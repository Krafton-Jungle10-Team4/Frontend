/**
 * LLM 노드 설정 패널
 *
 * Provider, Model, Prompt, Temperature, Max Tokens 설정
 */

import { useWorkflowStore } from '../../../stores/workflowStore';
import { BasePanel } from '../_base/base-panel';
import { LLMModelSelect } from '../../shared-components/LLMModelSelect';
import { Input } from '@shared/components/input';
import { Textarea } from '@shared/components/textarea';
import { Label } from '@shared/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/select';
import type { LLMNodeType } from '@/shared/types/workflow.types';

/**
 * model 값에서 provider 추출
 */
const extractProviderFromModel = (model: unknown): string => {
  if (typeof model === 'object' && model !== null && 'provider' in model) {
    const value = (model as { provider?: string }).provider;
    return (value || 'openai').toLowerCase();
  }

  if (typeof model === 'string') {
    const normalized = model.toLowerCase();
    if (normalized.includes('/')) {
      const [provider] = normalized.split('/');
      if (provider === 'openai') return 'openai';
      if (provider === 'anthropic') return 'anthropic';
      if (provider === 'google') return 'google';
    }
    if (normalized.startsWith('gpt')) return 'openai';
    if (normalized.startsWith('claude')) return 'anthropic';
    if (normalized.includes('gemini')) return 'google';
  }

  return 'openai';
};

/**
 * model 값에서 실제 모델명 추출
 */
const extractModelNameFromModel = (model: unknown): string => {
  if (typeof model === 'object' && model !== null && 'name' in model) {
    return (model as { name: string }).name;
  }

  if (typeof model === 'string') {
    if (model.includes('/')) {
      const [, modelName] = model.split('/');
      return modelName || model;
    }
    return model;
  }

  return 'gpt-4o-mini';
};

export const LLMPanel = () => {
  const { selectedNodeId, nodes, updateNode } = useWorkflowStore();

  const node = nodes.find((n) => n.id === selectedNodeId);

  if (!node) return null;

  const llmData = node.data as LLMNodeType;
  const currentProvider = llmData.provider || extractProviderFromModel(llmData.model);

  const handleUpdate = (field: string, value: unknown) => {
    updateNode(selectedNodeId!, { [field]: value });
  };

  return (
    <BasePanel>
      {/* Provider 선택 */}
      <div className="space-y-2">
        <Label className="font-semibold">Provider</Label>
        <Select
          value={currentProvider}
          onValueChange={(provider) => {
            handleUpdate('provider', provider);
            handleUpdate('model', {
              provider,
              name: '',
            });
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
            <SelectItem value="google">Google</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 모델 선택 */}
      <div className="space-y-2">
        <Label className="font-semibold">모델</Label>
        <LLMModelSelect
          selectedProvider={currentProvider}
          value={extractModelNameFromModel(llmData.model)}
          onChange={(modelId) => {
            handleUpdate('model', {
              provider: currentProvider,
              name: modelId,
            });
          }}
        />
      </div>

      {/* 프롬프트 */}
      <div className="space-y-2">
        <Label className="font-semibold">프롬프트</Label>
        <Textarea
          value={llmData.prompt || ''}
          onChange={(e) => handleUpdate('prompt', e.target.value)}
          rows={6}
          placeholder="프롬프트를 입력하세요..."
        />
      </div>

      {/* Temperature */}
      <div className="space-y-2">
        <Label className="font-semibold">Temperature</Label>
        <Input
          type="number"
          min="0"
          max="2"
          step="0.1"
          value={llmData.temperature || 0.7}
          onChange={(e) =>
            handleUpdate('temperature', parseFloat(e.target.value))
          }
        />
      </div>

      {/* Max Tokens */}
      <div className="space-y-2">
        <Label className="font-semibold">Max Tokens</Label>
        <Input
          type="number"
          min="1"
          max="8192"
          value={llmData.maxTokens || 4000}
          onChange={(e) =>
            handleUpdate('maxTokens', parseInt(e.target.value, 10))
          }
        />
      </div>
    </BasePanel>
  );
};
