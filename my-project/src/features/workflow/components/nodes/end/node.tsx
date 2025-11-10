import type { NodeProps, EndNodeType } from '@/shared/types/workflow.types';
import { memo } from 'react';

/**
 * End 노드
 * 워크플로우 종료점
 * - 아이콘과 제목만 표시 (BaseNode에서 제공)
 */
const EndNode = ({ data: _data }: NodeProps<EndNodeType>) => {
  return <></>;
};

export default EndNode;
