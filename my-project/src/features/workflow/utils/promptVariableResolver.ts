/**
 * 프롬프트 변수 해석 유틸리티
 * 
 * LLM 노드의 프롬프트에서 사용되는 변수를 해석합니다.
 * - {{nodeId.portName}} 형식: 직접 노드 참조
 * - {{portName}} 형식: 입력 포트 이름만 사용 (연결된 노드 자동 찾기)
 */

import type { Node, Edge } from '@/shared/types/workflow.types';
import type { NodeVariableMappings } from '@/shared/types/workflow';

export interface ResolvedVariable {
  /** 원본 변수 참조 ({{context}} 또는 {{nodeId.portName}}) */
  original: string;
  /** 해석된 변수 경로 (nodeId.portName) */
  resolved: string | null;
  /** 해석 성공 여부 */
  isValid: boolean;
  /** 에러 메시지 (해석 실패 시) */
  error?: string;
  /** 연결된 소스 노드 ID */
  sourceNodeId?: string;
  /** 포트 이름 */
  portName: string;
}

/**
 * 프롬프트에서 변수 참조 추출
 * 
 * @param prompt - 프롬프트 텍스트
 * @returns 추출된 변수 참조 목록
 */
export function extractVariableReferences(prompt: string): string[] {
  // {{...}} 패턴 찾기
  const pattern = /\{\{\s*([^}]+)\s*\}\}/g;
  const matches = [...prompt.matchAll(pattern)];
  return matches.map((m) => m[1].trim());
}

/**
 * 입력 포트 이름으로 연결된 노드 찾기
 * 
 * @param nodeId - 현재 노드 ID
 * @param portName - 입력 포트 이름
 * @param nodes - 모든 노드 목록
 * @param edges - 모든 엣지 목록
 * @param variableMappings - 변수 매핑 정보
 * @returns 연결된 노드 ID와 포트 이름, 없으면 null
 */
export function findConnectedNodeForInputPort(
  nodeId: string,
  portName: string,
  nodes: Node[],
  edges: Edge[],
  variableMappings?: NodeVariableMappings
): { sourceNodeId: string; sourcePortName: string } | null {
  const currentNode = nodes.find((n) => n.id === nodeId);
  if (!currentNode) return null;

  // 1. variable_mappings에서 찾기
  if (variableMappings && variableMappings[portName]) {
    const mapping = variableMappings[portName];
    const variable = mapping.source?.variable;
    if (variable && variable.includes('.')) {
      const [sourceNodeId, sourcePortName] = variable.split('.', 2);
      if (sourceNodeId && sourcePortName) {
        return { sourceNodeId, sourcePortName };
      }
    }
  }

  // 2. 엣지에서 찾기
  const incomingEdges = edges.filter((edge) => edge.target === nodeId);
  for (const edge of incomingEdges) {
    // targetHandle이 입력 포트 이름과 일치하는지 확인
    if (edge.targetHandle === portName) {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      if (sourceNode && edge.sourceHandle) {
        return {
          sourceNodeId: edge.source,
          sourcePortName: edge.sourceHandle,
        };
      }
    }
  }

  // 3. 엣지에서 targetHandle이 없으면 첫 번째 입력 포트로 매핑
  if (incomingEdges.length > 0) {
    const firstEdge = incomingEdges[0];
    const sourceNode = nodes.find((n) => n.id === firstEdge.source);
    if (sourceNode && firstEdge.sourceHandle) {
      // 입력 포트가 하나만 있고 엣지가 하나만 있으면 자동 매핑
      const inputPorts = currentNode.data?.ports?.inputs || [];
      if (inputPorts.length === 1 && inputPorts[0].name === portName) {
        return {
          sourceNodeId: firstEdge.source,
          sourcePortName: firstEdge.sourceHandle,
        };
      }
    }
  }

  return null;
}

/**
 * 프롬프트 변수 해석
 * 
 * @param prompt - 프롬프트 텍스트
 * @param nodeId - 현재 노드 ID
 * @param nodes - 모든 노드 목록
 * @param edges - 모든 엣지 목록
 * @param variableMappings - 변수 매핑 정보
 * @returns 해석된 변수 목록
 */
export function resolvePromptVariables(
  prompt: string,
  nodeId: string,
  nodes: Node[],
  edges: Edge[],
  variableMappings?: NodeVariableMappings
): ResolvedVariable[] {
  const references = extractVariableReferences(prompt);
  const resolved: ResolvedVariable[] = [];

  for (const ref of references) {
    // 이미 nodeId.portName 형식인 경우
    if (ref.includes('.')) {
      const [refNodeId, portName] = ref.split('.', 2);
      const refNode = nodes.find((n) => n.id === refNodeId);
      
      if (!refNode) {
        resolved.push({
          original: ref,
          resolved: null,
          isValid: false,
          error: `존재하지 않는 노드 '${refNodeId}' 참조`,
          portName,
        });
        continue;
      }

      // 출력 포트 확인
      const outputPorts = refNode.data?.ports?.outputs || [];
      const hasPort = outputPorts.some((p) => p.name === portName);
      
      if (!hasPort) {
        resolved.push({
          original: ref,
          resolved: null,
          isValid: false,
          error: `노드 '${refNodeId}'에 출력 포트 '${portName}'가 없습니다`,
          portName,
        });
        continue;
      }

      resolved.push({
        original: ref,
        resolved: `${refNodeId}.${portName}`,
        isValid: true,
        sourceNodeId: refNodeId,
        portName,
      });
    } else {
      // 포트 이름만 있는 경우 (예: {{context}})
      const portName = ref;
      const currentNode = nodes.find((n) => n.id === nodeId);
      
      if (!currentNode) {
        resolved.push({
          original: ref,
          resolved: null,
          isValid: false,
          error: '현재 노드를 찾을 수 없습니다',
          portName,
        });
        continue;
      }

      // 입력 포트인지 확인
      const inputPorts = currentNode.data?.ports?.inputs || [];
      const isInputPort = inputPorts.some((p) => p.name === portName);

      if (!isInputPort) {
        resolved.push({
          original: ref,
          resolved: null,
          isValid: false,
          error: `입력 포트 '${portName}'가 존재하지 않습니다`,
          portName,
        });
        continue;
      }

      // 연결된 노드 찾기
      const connected = findConnectedNodeForInputPort(
        nodeId,
        portName,
        nodes,
        edges,
        variableMappings
      );

      if (!connected) {
        resolved.push({
          original: ref,
          resolved: null,
          isValid: false,
          error: `입력 포트 '${portName}'에 연결된 노드가 없습니다`,
          portName,
        });
        continue;
      }

      // 연결된 노드의 출력 포트 확인
      const sourceNode = nodes.find((n) => n.id === connected.sourceNodeId);
      if (!sourceNode) {
        resolved.push({
          original: ref,
          resolved: null,
          isValid: false,
          error: `연결된 노드 '${connected.sourceNodeId}'를 찾을 수 없습니다`,
          portName,
        });
        continue;
      }

      const outputPorts = sourceNode.data?.ports?.outputs || [];
      const hasOutputPort = outputPorts.some((p) => p.name === connected.sourcePortName);

      if (!hasOutputPort) {
        resolved.push({
          original: ref,
          resolved: null,
          isValid: false,
          error: `연결된 노드에 출력 포트 '${connected.sourcePortName}'가 없습니다`,
          portName,
        });
        continue;
      }

      resolved.push({
        original: ref,
        resolved: `${connected.sourceNodeId}.${connected.sourcePortName}`,
        isValid: true,
        sourceNodeId: connected.sourceNodeId,
        portName,
      });
    }
  }

  return resolved;
}

