// src/features/workflow/hooks/useAvailableVariables.ts

import { useMemo } from 'react';
import { useWorkflowStore } from '../stores/workflowStore';
import { PortType, VariableReference } from '@shared/types/workflow';
import { Edge } from '@xyflow/react';

/**
 * 특정 노드에서 사용 가능한 변수 목록 조회
 *
 * @param nodeId - 현재 노드 ID
 * @param filterType - 타입 필터 (선택사항)
 * @returns 사용 가능한 변수 목록
 */
export function useAvailableVariables(
  nodeId: string,
  filterType?: PortType
): VariableReference[] {
  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);

  return useMemo(() => {
    const availableVars: VariableReference[] = [];

    // 1. Upstream 노드 찾기 (토폴로지 정렬)
    const upstreamNodeIds = getUpstreamNodes(nodeId, edges);

    // 2. 각 upstream 노드의 출력 포트를 변수로 추가
    upstreamNodeIds.forEach((upstreamId) => {
      const upstreamNode = nodes.find((n) => n.id === upstreamId);
      if (!upstreamNode || !upstreamNode.data?.ports) return;

      const ports = upstreamNode.data.ports;
      if (!ports.outputs) return;

      ports.outputs.forEach((outputPort) => {
        // 타입 필터링
        if (filterType && !isTypeCompatible(outputPort.type, filterType)) {
          return;
        }

        availableVars.push({
          nodeId: upstreamNode.id,
          nodeTitle: upstreamNode.data.title || upstreamNode.type,
          portName: outputPort.name,
          portDisplayName: outputPort.display_name,
          type: outputPort.type,
          fullPath: `${upstreamNode.id}.${outputPort.name}`,
        });
      });
    });

    return availableVars;
  }, [nodeId, nodes, edges, filterType]);
}

/**
 * Upstream 노드 ID 목록 반환 (BFS 탐색)
 */
function getUpstreamNodes(nodeId: string, edges: Edge[]): string[] {
  const visited = new Set<string>();
  const queue = [nodeId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    // 현재 노드의 입력 엣지 찾기
    const incomingEdges = edges.filter((edge) => edge.target === currentId);

    incomingEdges.forEach((edge) => {
      if (!visited.has(edge.source)) {
        visited.add(edge.source);
        queue.push(edge.source);
      }
    });
  }

  // 현재 노드 제외
  visited.delete(nodeId);

  return Array.from(visited);
}

/**
 * 타입 호환성 체크
 */
function isTypeCompatible(sourceType: PortType, targetType: PortType): boolean {
  // ANY 타입은 모든 타입과 호환
  if (targetType === PortType.ANY) return true;
  if (sourceType === PortType.ANY) return true;

  // 같은 타입만 호환
  return sourceType === targetType;
}
