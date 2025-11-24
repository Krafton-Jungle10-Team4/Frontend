import type { Node, Edge } from '@/shared/types/workflow.types';
import { BlockEnum } from '@/shared/types/workflow.types';
import { clonePortSchema } from '@/shared/constants/nodePortSchemas';

/**
 * Bot 생성 시 사용되는 기본 워크플로우 구조
 * 연결되지 않은 Start / End 노드만 포함한다.
 */
export const DEFAULT_WORKFLOW: { nodes: Node[]; edges: Edge[] } = {
  nodes: [
    {
      id: 'start-1',
      type: 'custom',
      position: { x: 150, y: 150 },
      data: {
        title: '시작',
        desc: '워크플로우 시작',
        type: BlockEnum.Start,
        ports: clonePortSchema(BlockEnum.Start),
      },
    },
    {
      id: 'end-1',
      type: 'custom',
      position: { x: 550, y: 150 },
      data: {
        title: '종료',
        desc: '워크플로우 종료',
        type: BlockEnum.End,
        ports: clonePortSchema(BlockEnum.End),
      },
    },
  ],
  // 초기 상태에서는 노드 간 연결을 제공하지 않는다.
  edges: [],
};
