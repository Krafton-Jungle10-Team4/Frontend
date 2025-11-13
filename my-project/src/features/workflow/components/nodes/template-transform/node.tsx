import type { NodeProps, TemplateTransformNodeType } from '@/shared/types/workflow.types';
import { memo } from 'react';

/**
 * Template Transform 노드
 * 템플릿 기반 텍스트 변환
 * - 템플릿과 출력 형식을 캔버스에 요약 표시
 */
const TemplateTransformNode = ({ data }: NodeProps<TemplateTransformNodeType>) => {
  return (
    <div className="space-y-1">
      {data.template && (
        <div className="text-xs text-muted-foreground line-clamp-2">
          템플릿: {data.template}
        </div>
      )}
      {data.outputFormat && (
        <div className="text-xs text-muted-foreground">
          형식: {data.outputFormat}
        </div>
      )}
    </div>
  );
};

export default memo(TemplateTransformNode);
