import type { NodeProps, TemplateTransformNodeType } from '@/shared/types/workflow.types';
import { memo } from 'react';

/**
 * Template Transform 노드
 * 템플릿 기반 텍스트 변환
 * - 템플릿과 출력 형식을 캔버스에 요약 표시
 */
const TemplateTransformNode = ({ data }: NodeProps<TemplateTransformNodeType>) => {
  return (
    <div className="px-3 py-2 space-y-2">
      {data.template && (
        <div className="rounded-md bg-workflow-block-parma-bg px-2.5 py-1.5">
          <div className="system-2xs-regular-uppercase text-text-tertiary">
            템플릿
          </div>
          <pre className="system-xs-medium text-text-primary mt-1 whitespace-pre-wrap break-words leading-relaxed font-mono">
            {data.template}
          </pre>
        </div>
      )}
      {data.outputFormat && (
        <div className="rounded-md bg-workflow-block-parma-bg px-2.5 py-1.5">
          <div className="system-2xs-regular-uppercase text-text-tertiary">
            출력 형식
          </div>
          <div className="system-xs-medium text-text-primary mt-1">
            {data.outputFormat}
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(TemplateTransformNode);
