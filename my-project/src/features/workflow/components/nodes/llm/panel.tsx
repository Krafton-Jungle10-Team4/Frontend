/**
 * LLM 노드 설정 패널
 *
 * Provider, Model, Prompt, Temperature, Max Tokens 설정
 */

import { useState } from 'react';
import { useWorkflowStore } from '../../../stores/workflowStore';
import { BasePanel } from '../_base/base-panel';
import { Box, Group, Field, OutputVars, VarItem, InputMappingSection } from '../_base/components';
import { LLMModelSelect } from '../../shared-components/LLMModelSelect';
import { Input } from '@shared/components/input';
import { Textarea } from '@shared/components/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@shared/components/collapsible';
import { RiArrowDownSLine, RiArrowRightSLine } from '@remixicon/react';
import type { LLMNodeType } from '@/shared/types/workflow.types';
import { PortType } from '@shared/types/workflow';

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
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const node = nodes.find((n) => n.id === selectedNodeId);

  if (!node) return null;

  const llmData = node.data as LLMNodeType;
  const currentProvider = llmData.provider || extractProviderFromModel(llmData.model);

  const handleUpdate = (field: string, value: unknown) => {
    updateNode(selectedNodeId!, { [field]: value });
  };

  return (
    <BasePanel>
      <Box>
        <InputMappingSection
          nodeId={node.id}
          ports={node.data.ports}
          title="입력 매핑"
          description="이 노드가 사용할 입력을 이전 노드의 출력과 연결하세요"
        />

        <Group title="모델 설정" description="사용할 LLM 제공자와 모델을 선택하세요">
          <Field label="Provider" required>
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
          </Field>

          <Field label="모델" required>
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
          </Field>
        </Group>

        <Group title="프롬프트 설정" description="모델에 전달할 프롬프트를 작성하세요">
          <Field label="프롬프트" required>
            <Textarea
              value={llmData.prompt || ''}
              onChange={(e) => handleUpdate('prompt', e.target.value)}
              rows={6}
              placeholder="프롬프트를 입력하세요..."
            />
          </Field>
        </Group>

        {/* 고급 설정 */}
        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen} className="space-y-2">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-2 py-1 transition-colors">
                {isAdvancedOpen ? (
                  <RiArrowDownSLine size={16} className="text-gray-500" />
                ) : (
                  <RiArrowRightSLine size={16} className="text-gray-500" />
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  고급 설정
                </span>
              </button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="space-y-3 pl-2">
            <Field
              label="Temperature"
              description="0: 결정적, 2: 창의적 (기본값: 0.7)"
            >
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
            </Field>

            <Field
              label="Max Tokens"
              description="생성할 최대 토큰 수 (기본값: 4000)"
            >
              <Input
                type="number"
                min="1"
                max="8192"
                value={llmData.maxTokens || 4000}
                onChange={(e) =>
                  handleUpdate('maxTokens', parseInt(e.target.value, 10))
                }
              />
            </Field>
          </CollapsibleContent>
        </Collapsible>

        {/* 출력 변수 */}
        <OutputVars title="출력 변수" defaultCollapsed={false}>
          <VarItem
            name="response"
            type={PortType.STRING}
            description="LLM 응답"
          />
          <VarItem
            name="tokens"
            type={PortType.NUMBER}
            description="사용된 토큰 수"
          />
          <VarItem
            name="model"
            type={PortType.STRING}
            description="사용된 모델명"
          />
        </OutputVars>
      </Box>
    </BasePanel>
  );
};
