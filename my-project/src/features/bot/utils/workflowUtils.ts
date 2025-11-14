/**
 * Workflow Utility Functions
 * 워크플로우 생성 및 변환을 위한 유틸리티 함수들
 */

import { DEFAULT_WORKFLOW } from '@/shared/constants/defaultWorkflow';

/**
 * 최소 구조의 워크플로우 생성
 * START, END 노드를 포함한 기본 워크플로우를 생성합니다.
 */
export function buildMinimalWorkflow() {
  return {
    nodes: DEFAULT_WORKFLOW.nodes.map((node) => ({
      ...node,
      data: { ...node.data },
    })),
    edges: [],
  };
}
