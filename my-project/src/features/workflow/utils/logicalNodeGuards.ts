import type { Connection } from '@xyflow/react';
import type { Edge } from '@/shared/types/workflow.types';
import type { Node } from '@/shared/types/workflow.types';
import { BlockEnum } from '@/shared/types/workflow.types';

/**
 * 입력 핸들을 가지지 않는 논리 노드(IF/ELSE 등)에 대해
 * targetHandle 정보를 제거하여 validator가 잘못된 variable mapping을 만들지 않도록 한다.
 */
const HANDLELESS_TARGET_NODE_TYPES = new Set<BlockEnum>([BlockEnum.IfElse]);

const shouldStripTargetHandle = (node?: Node): boolean => {
  if (!node) {
    return false;
  }
  const nodeType = node.data?.type as BlockEnum | undefined;
  if (!nodeType) {
    return false;
  }
  return HANDLELESS_TARGET_NODE_TYPES.has(nodeType);
};

type TargetHandleCarrier = {
  target?: string | null;
  targetHandle?: string | null | undefined;
};

const stripHandleIfNeeded = <T extends TargetHandleCarrier>(
  item: T,
  nodes: Node[]
): T => {
  if (!item.target) {
    return item;
  }

  if (!item.targetHandle) {
    return item;
  }

  const targetNode = nodes.find((candidate) => candidate.id === item.target);
  if (!shouldStripTargetHandle(targetNode)) {
    return item;
  }

  return {
    ...item,
    targetHandle: undefined,
  };
};

export const sanitizeConnectionForLogicalTargets = (
  connection: Connection,
  nodes: Node[]
): Connection => stripHandleIfNeeded(connection, nodes);

export const sanitizeEdgeForLogicalTargets = (edge: Edge, nodes: Node[]): Edge =>
  stripHandleIfNeeded(edge, nodes);

