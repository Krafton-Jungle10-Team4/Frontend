import type { Node, Edge } from '@/shared/types/workflow.types';
import { BlockEnum } from '@/shared/types/workflow.types';

/**
 * Bot 생성 시 사용되는 기본 워크플로우 구조
 * Start 노드 → End 노드 연결
 */
export const DEFAULT_WORKFLOW: { nodes: Node[]; edges: Edge[] } = {
  nodes: [
    {
      id: 'start-1',
      type: 'custom',
      position: { x: 100, y: 150 },
      data: {
        title: 'Start',
        desc: '워크플로우 시작',
        type: BlockEnum.Start,
      },
    },
    {
      id: 'end-1',
      type: 'custom',
      position: { x: 500, y: 150 },
      data: {
        title: 'End',
        desc: '워크플로우 종료',
        type: BlockEnum.End,
      },
    },
  ],
  edges: [
    {
      id: 'e-start-end',
      source: 'start-1',
      target: 'end-1',
      type: 'custom',
      data: {
        sourceType: BlockEnum.Start,
        targetType: BlockEnum.End,
      },
    },
  ],
};
