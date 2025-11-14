import { useMemo } from 'react';
import { useWorkflowStore } from '@features/workflow/stores/workflowStore';
import type { NodeVariableGroup, AvailableVariable, VarType } from '../types';
import type { Node, Edge } from '@/shared/types/workflow.types';
import { PortType } from '@/shared/types/workflow';
import type { NodePortSchema } from '@/shared/types/workflow';

/**
 * PortType을 VarType으로 변환
 * 대부분의 타입이 동일하므로 직접 매핑
 */
const PORT_TYPE_TO_VAR_TYPE: Record<PortType, VarType> = {
  [PortType.STRING]: VarType.STRING,
  [PortType.NUMBER]: VarType.NUMBER,
  [PortType.BOOLEAN]: VarType.BOOLEAN,
  [PortType.ARRAY]: VarType.ARRAY,
  [PortType.OBJECT]: VarType.OBJECT,
  [PortType.FILE]: VarType.FILE,
  [PortType.ANY]: VarType.ANY,
};

function portTypeToVarType(portType: PortType): VarType {
  return PORT_TYPE_TO_VAR_TYPE[portType] ?? VarType.ANY;
}

/**
 * 타입 필터링 함수
 * filterType과 varType이 호환되는지 확인
 */
function isTypeCompatible(filterType: VarType | undefined, varType: VarType): boolean {
  if (!filterType || filterType === 'any') return true;
  if (varType === 'any') return true;
  return varType === filterType;
}

/**
 * 현재 노드 이전에 실행되는 노드들 찾기
 * 그래프 순회를 통해 현재 노드로 들어오는 모든 선행 노드를 수집
 */
function getBeforeNodes(
  targetNodeId: string,
  nodes: Node[],
  edges: Edge[]
): Node[] {
  const visited = new Set<string>();
  const beforeNodes: Node[] = [];

  function traverse(nodeId: string) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const incomingEdges = edges.filter((edge) => edge.target === nodeId);

    for (const edge of incomingEdges) {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      if (sourceNode && !visited.has(sourceNode.id)) {
        beforeNodes.push(sourceNode);
        traverse(sourceNode.id);
      }
    }
  }

  traverse(targetNodeId);

  return beforeNodes;
}

/**
 * 사용 가능한 변수 계산 훅
 *
 * 현재 노드 이전에 실행되는 모든 노드의 출력 포트에서 변수를 추출합니다.
 * 타입 필터링을 지원하여 특정 타입의 변수만 선택할 수 있습니다.
 *
 * @param nodeId - 현재 노드 ID
 * @param filterType - 필터링할 변수 타입 (선택사항)
 * @returns 노드별로 그룹화된 사용 가능한 변수 목록
 */
export function useAvailableVariables(
  nodeId: string,
  filterType?: VarType
): NodeVariableGroup[] {
  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);

  return useMemo(() => {
    // 1. 현재 노드 이전의 노드들 찾기 (실행 순서 기준)
    const beforeNodes = getBeforeNodes(nodeId, nodes, edges);

    // 2. 각 노드의 출력 포트에서 변수 추출
    const variableGroups: NodeVariableGroup[] = beforeNodes.map((node) => {
      const portsFromData = node.data.ports;
      const portsFromNode = (node as unknown as { ports?: NodePortSchema }).ports;
      const outputs =
        portsFromData?.outputs ??
        portsFromNode?.outputs ??
        [];

      const variables: AvailableVariable[] = outputs
        .map((port) => {
          const varType = portTypeToVarType(port.type);

          // 타입 필터링
          if (!isTypeCompatible(filterType, varType)) {
            return null;
          }

          return {
            nodeId: node.id,
            nodeName: node.data.title || node.data.type,
            portName: port.name,
            displayName: port.display_name || port.name,
            type: varType,
            description: port.description,
            selector: [node.id, port.name],
          } as AvailableVariable;
        })
        .filter((v): v is AvailableVariable => v !== null);

      return {
        nodeId: node.id,
        nodeName: node.data.title || node.data.type,
        nodeType: node.data.type,
        variables,
      };
    });

    // 변수가 있는 노드만 반환
    return variableGroups.filter((group) => group.variables.length > 0);
  }, [nodeId, nodes, edges, filterType]);
}
