import { useEffect, useState } from 'react';
import { Label } from '@/shared/components/label';
import { Input } from '@/shared/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/select';
import { Switch } from '@/shared/components/switch';
import { Alert, AlertDescription } from '@/shared/components/alert';
import { AlertCircle } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/components/collapsible';
import { RiArrowDownSLine, RiArrowRightSLine } from '@remixicon/react';
import { ClassList } from './components/ClassList';
import { useQuestionClassifier } from './hooks/useQuestionClassifier';
import type { QuestionClassifierNodeType, MemoryConfig } from '@/shared/types/workflow.types';
import { useWorkflowStore } from '@/features/workflow/stores/workflowStore';
import { VarReferencePicker } from '@/features/workflow/components/variable/VarReferencePicker';
import { PortType, type ValueSelector } from '@/shared/types/workflow';
import { BasePanel } from '../_base/base-panel';
import { Box, Group, Field, OutputVars, VarItem } from '../_base/components';
import { Textarea } from '@/shared/components/textarea';
import { Separator } from '@/shared/components/separator';
import { LLMModelSelect } from '../../shared-components/LLMModelSelect';

type VariableMappingRecord = Record<
  string,
  {
    target_port: string;
    source: ValueSelector;
  }
>;

/**
 * Question Classifier 노드 설정 패널
 */
export function QuestionClassifierPanel() {
  const { selectedNodeId, nodes, updateNode } = useWorkflowStore();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // 선택된 노드 찾기
  const node = nodes.find((n) => n.id === selectedNodeId);

  if (!node) return null;

  const qcData = node.data as QuestionClassifierNodeType;
  const initialClasses = qcData?.classes ?? [];
  const initialModel = qcData?.model ?? {
    provider: 'openai',
    name: 'gpt-4',
    mode: 'chat' as const,
    completion_params: { temperature: 0.7 },
  };
  const variableMappings = (node.data.variable_mappings || {}) as VariableMappingRecord;

  const selectorFromSegments = (
    segments?: string[],
    valueType: PortType = PortType.ANY
  ): ValueSelector | null => {
    if (!segments || segments.length === 0) return null;
    return {
      variable: segments.join('.'),
      value_type: valueType,
    };
  };

  const currentQuerySelector =
    variableMappings.query?.source ??
    selectorFromSegments(qcData?.query_variable_selector, PortType.STRING);

  const currentFilesSelector =
    variableMappings.files?.source ??
    selectorFromSegments(qcData?.vision?.variable_selector, PortType.ARRAY_FILE);

  const {
    classes,
    handleClassesChange,
    handleModelChange,
    handleQueryVarChange,
    handleVisionToggle,
    handleVisionFileVarChange,
    handleInstructionChange,
    handleMemoryChange,
  } = useQuestionClassifier({
    nodeId: selectedNodeId!,
    classes: initialClasses,
    model: initialModel,
    visionConfig: qcData?.vision,
    onUpdate: (updates) => {
      updateNode(selectedNodeId!, updates as any);
    },
  });

  const updateVariableMapping = (
    portName: string,
    selector: ValueSelector | null,
    portType: PortType
  ) => {
    const nextMappings = { ...variableMappings };
    if (selector) {
      nextMappings[portName] = {
        target_port: portName,
        source: {
          variable: selector.variable,
          value_type: selector.value_type ?? portType,
        },
      };
    } else {
      delete nextMappings[portName];
    }

    updateNode(selectedNodeId!, {
      variable_mappings: nextMappings,
    } as any);
  };

  const querySelectorKey = currentQuerySelector?.variable ?? '';
  const storedQueryKey = qcData?.query_variable_selector?.join('.') ?? '';

  useEffect(() => {
    if (!selectedNodeId) return;
    if (querySelectorKey && querySelectorKey !== storedQueryKey) {
      updateNode(selectedNodeId, {
        query_variable_selector: querySelectorKey.split('.'),
      } as any);
    } else if (!querySelectorKey && storedQueryKey) {
      updateNode(selectedNodeId, {
        query_variable_selector: [],
      } as any);
    }
  }, [querySelectorKey, storedQueryKey, selectedNodeId, updateNode]);

  const fileSelectorKey = currentFilesSelector?.variable ?? '';
  const storedFileKey = qcData?.vision?.variable_selector?.join('.') ?? '';

  useEffect(() => {
    if (!selectedNodeId || !qcData?.vision?.enabled) return;
    if (fileSelectorKey && fileSelectorKey !== storedFileKey) {
      updateNode(selectedNodeId, {
        vision: {
          ...qcData.vision,
          variable_selector: fileSelectorKey.split('.'),
        },
      } as any);
    } else if (!fileSelectorKey && storedFileKey) {
      updateNode(selectedNodeId, {
        vision: {
          ...qcData.vision,
          variable_selector: [],
        },
      } as any);
    }
  }, [fileSelectorKey, storedFileKey, qcData?.vision?.enabled, selectedNodeId, updateNode, qcData?.vision]);

  // 검증
  const hasQueryVariable = Boolean(currentQuerySelector);
  const hasVisionFiles = !qcData?.vision?.enabled || Boolean(currentFilesSelector);
  const hasErrors =
    !qcData?.model?.provider ||
    !qcData?.model?.name ||
    !hasQueryVariable ||
    classes.length === 0 ||
    classes.some((c) => !c.name) ||
    !hasVisionFiles;

  const errors: string[] = [];
  if (!qcData?.model?.provider || !qcData?.model?.name) errors.push('모델을 선택해주세요');
  if (!hasQueryVariable) errors.push('입력 변수를 선택해주세요');
  if (classes.length === 0) errors.push('최소 1개의 클래스를 추가해주세요');
  if (classes.some((c) => !c.name)) errors.push('모든 클래스에 이름을 입력해주세요');
  if (!hasVisionFiles) errors.push('Vision 모드에서는 파일 변수를 선택해주세요');

  // Memory 핸들러들
  const handleMemoryToggle = (enabled: boolean) => {
    if (enabled) {
      handleMemoryChange({
        role_prefix: {
          user: 'User',
          assistant: 'Assistant',
        },
        window: {
          enabled: true,
          size: 10,
        },
      });
    } else {
      handleMemoryChange(undefined);
    }
  };

  const handleMemoryWindowToggle = (enabled: boolean) => {
    if (!qcData?.memory) return;
    handleMemoryChange({
      ...qcData.memory,
      window: {
        ...qcData.memory.window,
        enabled,
      },
    });
  };

  const handleMemoryWindowSizeChange = (size: number) => {
    if (!qcData?.memory) return;
    handleMemoryChange({
      ...qcData.memory,
      window: {
        ...qcData.memory.window,
        size,
      },
    });
  };

  const handleRolePrefixChange = (role: 'user' | 'assistant', prefix: string) => {
    if (!qcData?.memory) return;
    handleMemoryChange({
      ...qcData.memory,
      role_prefix: {
        ...qcData.memory.role_prefix,
        [role]: prefix,
      },
    });
  };

  return (
    <BasePanel>
      <Box>
        {/* 검증 에러 표시 */}
        {hasErrors && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="text-sm font-medium mb-1">설정을 완료해주세요</div>
              <ul className="text-xs space-y-1">
                {errors.map((error, idx) => (
                  <li key={idx}>• {error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* 입력 변수 */}
        <Group title="입력 변수" description="분류할 질문이 포함된 변수를 선택하세요">
          <Field label="Query Variable" required>
            <VarReferencePicker
              nodeId={selectedNodeId!}
              portName="query"
              portType={PortType.STRING}
              value={currentQuerySelector ?? null}
              onChange={(selector) => {
                if (selector) {
                  handleQueryVarChange(selector.variable.split('.'));
                } else {
                  handleQueryVarChange([]);
                }
                updateVariableMapping('query', selector, PortType.STRING);
              }}
              placeholder="분류할 텍스트 변수 선택..."
            />
          </Field>
        </Group>

        {/* 모델 설정 */}
        <Group title="모델 설정" description="사용할 LLM 제공자와 모델을 선택하세요">
          <Field label="Provider" required>
            <Select
              value={qcData?.model?.provider || 'openai'}
              onValueChange={(value) => handleModelChange({ provider: value, name: '' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Provider 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="bedrock">AWS Bedrock</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Model" required>
            <LLMModelSelect
              selectedProvider={qcData?.model?.provider || 'openai'}
              value={qcData?.model?.name || ''}
              onChange={(modelId) => {
                handleModelChange({ name: modelId });
              }}
            />
          </Field>

          <Field label="Temperature" description="0: 결정적, 1: 창의적 (기본값: 0.7)">
            <Input
              type="number"
              min={0}
              max={1}
              step={0.1}
              value={qcData?.model?.completion_params?.temperature ?? 0.7}
              onChange={(e) =>
                handleModelChange({
                  completion_params: {
                    ...qcData?.model?.completion_params,
                    temperature: parseFloat(e.target.value),
                  },
                })
              }
            />
          </Field>
        </Group>

        {/* Vision 설정 */}
        <Group title="Vision 설정" description="이미지를 포함한 질문을 분류할 수 있습니다">
          <div className="flex items-center justify-between">
            <Label>Vision 모드 활성화</Label>
            <Switch
              checked={qcData?.vision?.enabled ?? false}
              onCheckedChange={(enabled) => {
                handleVisionToggle(enabled);
                if (!enabled) {
                  updateVariableMapping('files', null, PortType.ARRAY_FILE);
                }
              }}
            />
          </div>

          {qcData?.vision?.enabled && (
            <Field label="File Variable" required>
              <VarReferencePicker
                nodeId={selectedNodeId!}
                portName="files"
                portType={PortType.ARRAY_FILE}
                value={currentFilesSelector ?? null}
                onChange={(selector) => {
                  if (selector) {
                    handleVisionFileVarChange(selector.variable.split('.'));
                  } else {
                    handleVisionFileVarChange([]);
                  }
                  updateVariableMapping('files', selector, PortType.ARRAY_FILE);
                }}
                placeholder="이미지 파일 변수 선택..."
              />
            </Field>
          )}
        </Group>

        {/* 클래스 관리 */}
        <Group title="분류 카테고리" description="질문을 분류할 카테고리를 관리하세요">
          <ClassList classes={classes} onChange={handleClassesChange} />
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
            <Field label="추가 지시사항" description="분류 정확도를 높이기 위한 추가 컨텍스트를 제공할 수 있습니다">
              <Textarea
                value={qcData?.instruction ?? ''}
                onChange={(e) => handleInstructionChange(e.target.value)}
                placeholder="LLM에게 전달할 추가 컨텍스트나 분류 기준을 입력하세요&#10;예: 다음 기준으로 질문을 분류해주세요:&#10;- 제품 문의: 제품 사용법, 기능 관련&#10;- 기술 지원: 오류, 버그 관련"
                className="min-h-[100px]"
              />
            </Field>

            <Separator className="my-4" />

            {/* Memory 설정 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>대화 기록 메모리</Label>
                  <p className="text-xs text-gray-500 mt-1">이전 대화 내용을 참고하여 분류</p>
                </div>
                <Switch checked={!!qcData?.memory} onCheckedChange={handleMemoryToggle} />
              </div>

              {qcData?.memory && (
                <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                  {/* Role Prefixes */}
                  <div className="space-y-2">
                    <Label className="text-xs">역할 접두사</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="user-prefix" className="text-xs text-gray-600">
                          사용자
                        </Label>
                        <Input
                          id="user-prefix"
                          value={qcData.memory.role_prefix.user}
                          onChange={(e) => handleRolePrefixChange('user', e.target.value)}
                          placeholder="User"
                          className="text-xs"
                        />
                      </div>
                      <div>
                        <Label htmlFor="assistant-prefix" className="text-xs text-gray-600">
                          어시스턴트
                        </Label>
                        <Input
                          id="assistant-prefix"
                          value={qcData.memory.role_prefix.assistant}
                          onChange={(e) => handleRolePrefixChange('assistant', e.target.value)}
                          placeholder="Assistant"
                          className="text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Memory Window */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">대화 기록 제한</Label>
                      <Switch checked={qcData.memory.window.enabled} onCheckedChange={handleMemoryWindowToggle} />
                    </div>

                    {qcData.memory.window.enabled && (
                      <div className="space-y-1">
                        <Label htmlFor="window-size" className="text-xs text-gray-600">
                          최대 메시지 수
                        </Label>
                        <Input
                          id="window-size"
                          type="number"
                          min={1}
                          max={100}
                          value={qcData.memory.window.size}
                          onChange={(e) => handleMemoryWindowSizeChange(parseInt(e.target.value, 10))}
                          className="text-xs"
                        />
                        <p className="text-xs text-gray-500">참고할 이전 대화 메시지 개수 (1-100)</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* 출력 변수 */}
        <OutputVars title="출력 변수" defaultCollapsed={false}>
          <VarItem
            name="class_name"
            type={PortType.STRING}
            description="선택된 클래스 이름"
          />
          <VarItem
            name="usage"
            type={PortType.OBJECT}
            description="LLM 토큰 사용량"
          />
          {classes.map((topic) => (
            <VarItem
              key={topic.id}
              name={`class_${topic.id}_branch`}
              type={PortType.BOOLEAN}
              description={`${topic.name || 'Unnamed'} 선택 여부`}
            />
          ))}
        </OutputVars>
      </Box>
    </BasePanel>
  );
}
