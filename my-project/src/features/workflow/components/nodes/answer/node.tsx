import type { NodeProps, AnswerNodeType } from '@/shared/types/workflow.types';
import { memo } from 'react';

/**
 * Answer 노드
 * 워크플로우 최종 응답 생성
 * - 템플릿 미리보기 표시 (30자 제한)
 */
const AnswerNode = ({ data }: NodeProps<AnswerNodeType>) => {
  // 템플릿 미리보기 (30자 제한)
  const preview = data.template
    ? data.template.slice(0, 30) + (data.template.length > 30 ? '...' : '')
    : '템플릿을 입력하세요';

  return (
    <div className="px-3 py-2 space-y-2">
      {/* 템플릿 미리보기 */}
      <div className="rounded-md bg-workflow-block-parma-bg px-2.5 py-1.5">
        <div className="system-2xs-regular-uppercase text-text-tertiary">
          TEMPLATE
        </div>
        <div className="system-xs-medium text-text-primary mt-1 font-mono text-xs break-all">
          {preview}
        </div>
      </div>

      {/* 설명 (선택) */}
      {data.description && (
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {data.description}
        </div>
      )}
    </div>
  );
};

export default memo(AnswerNode);
