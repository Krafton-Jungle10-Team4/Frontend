import type { NodeProps, EndNodeType } from '../../types/workflow.types';
import { memo } from 'react';

/**
 * End 노드
 * 워크플로우 종료점 (최종 답변 출력)
 */
const EndNode = ({ data: _data }: NodeProps<EndNodeType>) => {
  return (
    <div className="px-3 py-1">
      <div className="system-xs-regular text-text-tertiary text-center">
        최종 답변 출력
      </div>
    </div>
  );
};

export default memo(EndNode);
