import type { NodeProps, LLMNodeType } from '@/shared/types/workflow.types';
import { memo, useMemo } from 'react';

/**
 * LLM 노드
 * AI 모델 호출
 */
const LLMNode = ({ data }: NodeProps<LLMNodeType>) => {
  const { model, prompt } = data;

  const modelDisplay = useMemo(() => {
    if (!model) return null;

    if (typeof model === 'string') {
      const provider = model.startsWith('gpt')
        ? 'OpenAI'
        : model.startsWith('claude')
          ? 'Anthropic'
          : 'Unknown';
      return { provider, name: model };
    }

    return model;
  }, [model]);

  return (
    <div className="px-3 py-1">
      {/* 모델 정보 */}
      {modelDisplay && (
        <div className="mb-1 rounded-md bg-workflow-block-parma-bg px-2 py-1">
          <div className="system-2xs-regular-uppercase text-text-tertiary">
            MODEL
          </div>
          <div className="system-xs-medium text-text-primary mt-0.5">
            {modelDisplay.provider} • {modelDisplay.name}
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
