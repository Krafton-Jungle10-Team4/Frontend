import type { NodeProps, LLMNodeType } from '../../types/workflow.types';
import { memo } from 'react';

/**
 * LLM 노드
 * AI 모델 호출
 */
const LLMNode = ({ data }: NodeProps<LLMNodeType>) => {
  const { model, prompt } = data;

  return (
    <div className="px-3 py-1">
      {/* 모델 정보 */}
      {model && (
        <div className="mb-1 rounded-md bg-workflow-block-parma-bg px-2 py-1">
          <div className="system-2xs-regular-uppercase text-text-tertiary">
            MODEL
          </div>
          <div className="system-xs-medium text-text-primary mt-0.5">
            {model.provider} • {model.name}
          </div>
        </div>
      )}

      {/* 프롬프트 정보 */}
      {prompt && (
        <div>
          <div className="system-2xs-regular-uppercase text-text-tertiary">
            PROMPT
          </div>
          <div className="system-xs-regular text-text-secondary mt-0.5 line-clamp-2">
            {prompt}
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(LLMNode);
