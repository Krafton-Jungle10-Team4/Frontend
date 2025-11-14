import type { Node, Edge } from '@/shared/types/workflow.types';
import { BlockEnum } from '@/shared/types/workflow.types';

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
        ports: {
          inputs: [],
          outputs: [
            {
              name: 'user_message',
              type: 'string',
              required: true,
              default_value: '',
              description: '최초 사용자 입력',
              display_name: 'User Message',
            },
          ],
        },
      },
    },
    {
      id: 'end-1',
      type: 'custom',
      position: { x: 350, y: 150 },
      data: {
        title: '종료',
        desc: '워크플로우 종료',
        type: BlockEnum.End,
        ports: {
          inputs: [
            {
              name: 'final_output',
              type: 'string',
              required: true,
              default_value: '',
              description: '최종 응답',
              display_name: 'Final Output',
            },
          ],
          outputs: [],
        },
      },
    },
  ],
  // 초기 상태에서는 노드 간 연결을 제공하지 않는다.
  edges: [],
};
