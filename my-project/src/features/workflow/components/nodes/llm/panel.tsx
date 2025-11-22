/**
 * LLM 노드 설정 패널
 *
 * Provider, Model, Prompt, Temperature, Max Tokens 설정
 */

import { useState, useEffect } from 'react';
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
import { TemplateSyntaxHint } from '../common/TemplateSyntaxHint';
import { PromptValidationStatus } from './PromptValidationStatus';
import { VariableSelector } from '../answer/VariableSelector';
import { useRef } from 'react';
import {
  getNodeCustomName,
  setNodeCustomName,
} from '../../../utils/nodeCustomNames';

/**
 * model 값에서 provider 추출
 */
const extractProviderFromModel = (model: unknown): string => {
  if (typeof model === 'object' && model !== null && 'provider' in model) {
    const value = (model as { provider?: string }).provider;
    return (value || 'bedrock').toLowerCase(); // 기본값을 bedrock으로 변경
  }

  if (typeof model === 'string') {
    const normalized = model.toLowerCase();
    if (normalized.includes('/')) {
      const [provider] = normalized.split('/');
      if (provider === 'openai') return 'openai';
      if (provider === 'anthropic') return 'anthropic';
      if (provider === 'google') return 'google';
      if (provider === 'bedrock') return 'bedrock';
    }
    // Bedrock 모델 ID 패턴 인식
    if (normalized.startsWith('anthropic.claude') || normalized.includes('amazon.titan')) return 'bedrock';
    if (normalized.startsWith('gpt')) return 'openai';
    if (normalized.startsWith('claude')) return 'anthropic';
    if (normalized.includes('gemini')) return 'google';
  }

  return 'bedrock'; // 기본값을 bedrock으로 변경
};

/**
 * model 값을 ModelConfig 객체로 변환 (LLMModelSelect의 value prop에 사용)
 *
 * 주의: model 필드에는 실제 API 모델 ID가 저장됨 (예: "chatgpt-4o-latest", "gpt-4o-mini")
 */
const convertToModelConfig = (model: unknown, provider: string): import('@/shared/types/workflow.types').ModelConfig | undefined => {
  // 이미 ModelConfig 객체인 경우
  if (typeof model === 'object' && model !== null && 'name' in model && 'provider' in model) {
    return model as import('@/shared/types/workflow.types').ModelConfig;
  }

  // 문자열인 경우 ModelConfig 객체 생성 (model은 이제 API 모델 ID)
  if (typeof model === 'string' && model) {
    return {
      provider: provider,
      name: model, // 이미 모델 ID이므로 그대로 사용
      mode: 'chat',
      completion_params: {
        temperature: 0.7,
      },
    };
  }

  // 값이 없으면 undefined 반환 (드롭다운이 비어있게)
  return undefined;
};

export const LLMPanel = () => {
  const { selectedNodeId, nodes, updateNode, botId } = useWorkflowStore();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [customName, setCustomName] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const node = nodes.find((n) => n.id === selectedNodeId);

  // 로컬 스토리지에서 커스텀 이름 로드
  useEffect(() => {
    if (node && botId) {
      const storedName = getNodeCustomName(botId, node.id);
      setCustomName(storedName || '');
    }
  }, [node?.id, botId]);

  if (!node) return null;

  const llmData = node.data as LLMNodeType;
  const currentProvider = llmData.provider || extractProviderFromModel(llmData.model);

  const handleUpdate = (field: string, value: unknown) => {
    updateNode(selectedNodeId!, { [field]: value });
  };

  const handleCustomNameChange = (value: string) => {
    setCustomName(value);
    if (botId && selectedNodeId) {
      setNodeCustomName(botId, selectedNodeId, value || null);
    }
  };

  const handleInsertVariable = (variable: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentPrompt = llmData.prompt || '';
    const newPrompt =
      currentPrompt.slice(0, start) + `{{${variable}}}` + currentPrompt.slice(end);

    handleUpdate('prompt', newPrompt);

    // 커서 위치 조정
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + variable.length + 4; // {{}} 포함
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
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

        <Group title="기본 설정" description="노드의 이름을 설정하세요">
          <Field label="노드 이름">
            <Input
              value={customName}
              onChange={(e) => handleCustomNameChange(e.target.value)}
              placeholder="노드 이름을 입력하세요 (예: 질문 분석 LLM)"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              이 이름은 이 브라우저에서만 저장되며, 새로고침 후에도 유지됩니다.
            </p>
          </Field>
        </Group>

        <Group title="모델 설정" description="사용할 LLM 제공자와 모델을 선택하세요">
          <Field label="Provider" required>
            <Select
              value={currentProvider}
              onValueChange={(provider) => {
                handleUpdate('provider', provider);
                // Provider 변경 시 모델 초기화 (빈 문자열로 설정하면 백엔드에서 기본값 사용)
                handleUpdate('model', '');
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bedrock">Bedrock (AWS)</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="google">Google</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="모델" required>
            <LLMModelSelect
              selectedProvider={currentProvider}
              value={convertToModelConfig(llmData.model, currentProvider)}
              onChange={(modelConfig) => {
                // 백엔드는 model을 문자열로 받음 (modelConfig.name 사용)
                handleUpdate('model', modelConfig.name);
              }}
            />
          </Field>
        </Group>

        <Group title="프롬프트 설정" description="모델에 전달할 프롬프트를 작성하세요">
          <Field label="프롬프트" required>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  변수를 삽입하려면 아래 버튼을 클릭하세요
                </span>
                <VariableSelector
                  nodeId={selectedNodeId!}
                  onSelect={handleInsertVariable}
                />
              </div>
              <Textarea
                ref={textareaRef}
                value={llmData.prompt || ''}
                onChange={(e) => handleUpdate('prompt', e.target.value)}
                rows={10}
                placeholder="프롬프트를 입력하세요...&#10;&#10;💡 팁: 입력 매핑에서 연결된 변수는 {{변수명}} 형식으로 사용하세요&#10;예: {{context}}, {{query}}&#10;&#10;다른 노드를 직접 참조하려면 {{nodeId.portName}} 형식 사용"
                className="font-mono text-sm"
              />
              <TemplateSyntaxHint />
              {/* 유효성 검사 상태 */}
              <div className="mt-2">
                <PromptValidationStatus
                  nodeId={selectedNodeId!}
                  prompt={llmData.prompt || ''}
                />
              </div>
            </div>
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
                value={llmData.temperature ?? 0.7}
                onChange={(e) => {
                  const value = e.target.value;
                  // 빈 문자열이면 기본값으로 설정
                  if (value === '' || value === null) {
                    handleUpdate('temperature', 0.7);
                    return;
                  }
                  const parsed = parseFloat(value);
                  // NaN 체크 및 유효 범위 검증
                  if (!isNaN(parsed) && parsed >= 0 && parsed <= 2) {
                    handleUpdate('temperature', parsed);
                  }
                }}
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
                value={llmData.maxTokens ?? 4000}
                onChange={(e) => {
                  const value = e.target.value;
                  // 빈 문자열이면 기본값으로 설정
                  if (value === '' || value === null) {
                    handleUpdate('maxTokens', 4000);
                    return;
                  }
                  const parsed = parseInt(value, 10);
                  // NaN 체크 및 유효 범위 검증
                  if (!isNaN(parsed) && parsed >= 1 && parsed <= 8192) {
                    handleUpdate('maxTokens', parsed);
                  }
                }}
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
