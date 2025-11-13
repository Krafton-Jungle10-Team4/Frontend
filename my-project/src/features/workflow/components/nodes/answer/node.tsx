import type { NodeProps, AnswerNodeType } from '@/shared/types/workflow.types';
import { memo } from 'react';

/**
 * Answer 노드
 * 워크플로우 최종 응답 생성
 * - 응답 변수와 타입을 캔버스에 요약 표시
 */
const AnswerNode = ({ data }: NodeProps<AnswerNodeType>) => {
  return (
    <div className="space-y-1">
      {data.responseVariable && (
        <div className="text-xs text-muted-foreground">
          변수: {data.responseVariable}
        </div>
      )}
      {data.responseType && (
        <div className="text-xs text-muted-foreground">
          타입: {data.responseType}
        </div>
      )}
    </div>
  );
};

export default memo(AnswerNode);
