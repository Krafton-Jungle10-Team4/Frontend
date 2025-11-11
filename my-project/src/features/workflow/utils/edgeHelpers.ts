import type { Connection } from '@xyflow/react';

import type { Node } from '@/shared/types/workflow.types';
import { BlockEnum } from '@/shared/types/workflow.types';

type ConnectionWithMetadata = Connection & {
  data: {
    sourceType: BlockEnum;
    targetType: BlockEnum;
  };
};

const FALLBACK_TYPE = BlockEnum.LLM;

const findNodeType = (
  nodes: Node[],
  nodeId?: string | null
): BlockEnum | undefined => {
  if (!nodeId) return undefined;
  return nodes.find((node) => node.id === nodeId)?.data
    .type as BlockEnum | undefined;
};

/**
 * 연결 정보에 노드 타입 메타데이터를 채워 넣어
 * 저장/복원 시 타입 정보가 사라지지 않도록 한다.
 */
export const withEdgeMetadata = (
  connection: Connection,
  nodes: Node[]
): ConnectionWithMetadata => {
  const sourceType = findNodeType(nodes, connection.source) ?? FALLBACK_TYPE;
  const targetType = findNodeType(nodes, connection.target) ?? FALLBACK_TYPE;

  return {
    ...connection,
    type: connection.type ?? 'custom',
    data: {
      sourceType,
      targetType,
    },
  };
};

