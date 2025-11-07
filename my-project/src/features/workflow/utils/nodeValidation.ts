import type { Node } from '@/shared/types/workflow.types';
import type { NodeTypeResponse } from '../types/api.types';

/**
 * 노드 인스턴스 제한 검증 결과
 */
export interface NodeValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * 노드 인스턴스 제한 검증
 *
 * 각 노드 타입의 max_instances 속성을 기준으로
 * 현재 워크플로우에 존재하는 노드 수를 검증합니다.
 *
 * @param nodes - 현재 워크플로우의 노드 목록
 * @param nodeTypes - API에서 가져온 노드 타입 정의 목록
 * @returns 검증 결과 (valid: boolean, errors: string[])
 */
export const validateNodeInstances = (
  nodes: Node[],
  nodeTypes: NodeTypeResponse[]
): NodeValidationResult => {
  const errors: string[] = [];

  for (const nodeType of nodeTypes) {
    if (nodeType.max_instances === -1) continue; // unlimited

    const count = nodes.filter((n) => n.data.type === nodeType.type).length;

    if (count > nodeType.max_instances) {
      errors.push(
        `${nodeType.label} 노드는 최대 ${nodeType.max_instances}개까지만 추가할 수 있습니다 (현재: ${count}개)`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
