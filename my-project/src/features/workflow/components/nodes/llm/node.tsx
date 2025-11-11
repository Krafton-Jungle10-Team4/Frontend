import type { NodeProps, LLMNodeType } from '@/shared/types/workflow.types';
import { memo, useMemo } from 'react';

/**
 * LLM 노드
 * AI 모델 호출
 * - Provider와 Model 분리 표시
 */
const LLMNode = ({ data }: NodeProps<LLMNodeType>) => {
  const { model } = data;

  const modelDisplay = useMemo(() => {
    if (!model) return null;

    if (typeof model === 'string') {
      let provider = 'Unknown';
      let name = model;

      // "provider/model" 형식 파싱 (예: "anthropic/claude", "openai/gpt-4")
      if (model.includes('/')) {
        const [providerPart, modelPart] = model.split('/');
        const providerLower = providerPart.toLowerCase();
        if (providerLower === 'openai') provider = 'OpenAI';
        else if (providerLower === 'anthropic') provider = 'Anthropic';
        name = modelPart;
      }
      // 모델명으로 provider 추론
      else if (model.startsWith('gpt')) {
        provider = 'OpenAI';
      } else if (model.startsWith('claude')) {
        provider = 'Anthropic';
      }

      return { provider, name };
    }

    return model;
  }, [model]);

  return (
    <div className="px-3 py-2 space-y-2">
      {/* Provider 정보 */}
      {modelDisplay && (
        <div className="rounded-md bg-workflow-block-parma-bg px-2.5 py-1.5">
          <div className="system-2xs-regular-uppercase text-text-tertiary">
            PROVIDER
          </div>
          <div className="system-xs-medium text-text-primary mt-1">
            {modelDisplay.provider}
          </div>
        </div>
      )}

      {/* Model 정보 */}
      {modelDisplay && (
        <div className="rounded-md bg-workflow-block-parma-bg px-2.5 py-1.5">
          <div className="system-2xs-regular-uppercase text-text-tertiary">
            MODEL
          </div>
          <div className="system-xs-medium text-text-primary mt-1">
            {modelDisplay.name}
          </div>
        </div>
      )}
    </div>
  );
};

export default LLMNode;
