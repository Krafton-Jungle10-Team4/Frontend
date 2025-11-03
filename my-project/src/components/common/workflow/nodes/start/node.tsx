import type { NodeProps, StartNodeType } from '@/types/workflow';
import { memo } from 'react';

/**
 * Start 노드
 * 워크플로우의 시작점
 */
const StartNode = ({ data: _data }: NodeProps<StartNodeType>) => {
  return (
    <div className="px-3 py-1">
      <div className="system-xs-regular text-text-tertiary text-center">
        워크플로우 시작
      </div>
    </div>
  );
};

export default memo(StartNode);
