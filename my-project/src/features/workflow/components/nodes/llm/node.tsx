import type { NodeProps, LLMNodeType } from '@/shared/types/workflow.types';
import { useMemo } from 'react';

/**
 * LLM 노드
 * AI 모델 호출
 * - Provider와 Model 분리 표시
 */
const LLMNode = ({ data }: NodeProps<LLMNodeType>) => {
  const { model, provider } = data;

  const modelDisplay = useMemo(() => {
    if (!model && !provider) return null;

    const providerSlug =
      (typeof provider === 'string' && provider.toLowerCase()) ||
      (typeof model === 'object' &&
      model !== null &&
      'provider' in model &&
      typeof (model as { provider?: string }).provider === 'string'
        ? ((model as { provider?: string }).provider as string).toLowerCase()
        : undefined) ||
      (typeof model === 'string' && model.toLowerCase().startsWith('claude')
        ? 'anthropic'
        : typeof model === 'string' && model.toLowerCase().startsWith('gpt')
        ? 'openai'
        : typeof model === 'string' && model.toLowerCase().includes('gemini')
        ? 'google'
        : undefined);

    const modelName =
      typeof model === 'object' && model !== null && 'name' in model
        ? (model as { name?: string }).name
        : typeof model === 'string'
        ? model.includes('/') ? model.split('/')[1] : model
        : 'N/A';

    return {
      provider: providerSlug
        ? providerSlug.charAt(0).toUpperCase() + providerSlug.slice(1)
        : 'Unknown',
      name: modelName || 'N/A',
    };
  }, [model, provider]);

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
