import type { NodeProps, StartNodeType } from '@/shared/types/workflow.types';
import { memo } from 'react';

/**
 * Start 노드
 * 워크플로우의 시작점
 * - 아이콘과 제목만 표시 (BaseNode에서 제공)
 */
const StartNode = ({ data: _data }: NodeProps<StartNodeType>) => {
  return <></>;
};

export default memo(StartNode);
