import { useEffect, useState } from 'react';
import { Label } from '@/shared/components/label';
import { Input } from '@/shared/components/input';
import { Switch } from '@/shared/components/switch';
import { Alert, AlertDescription } from '@/shared/components/alert';
import { AlertCircle } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/components/collapsible';
import { RiArrowDownSLine, RiArrowRightSLine } from '@remixicon/react';
import { ClassList } from './components/ClassList';
import { useQuestionClassifier } from './hooks/useQuestionClassifier';
import type { QuestionClassifierNodeType } from '@/shared/types/workflow.types';
import { useWorkflowStore } from '@/features/workflow/stores/workflowStore';
import { VarReferencePicker } from '@/features/workflow/components/variable/VarReferencePicker';
import { PortType, type ValueSelector } from '@/shared/types/workflow';
import { BasePanel } from '../_base/base-panel';
import { Box, Group, Field, OutputVars, VarItem } from '../_base/components';
import { Textarea } from '@/shared/components/textarea';
import { Separator } from '@/shared/components/separator';
import { LLMModelSelect } from '../../shared-components/LLMModelSelect';
type WorkflowNode = ReturnType<typeof useWorkflowStore>['nodes'][number];

type VariableMappingRecord = Record<
  string,
  {
    target_port: string;
    source: ValueSelector;
  }
>;

export function QuestionClassifierPanel() {
  const { selectedNodeId, nodes, updateNode } = useWorkflowStore();

  if (!selectedNodeId) {
    return null;
  }

  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node) {
    return null;
  }

  return (
    <QuestionClassifierPanelContent
      key={selectedNodeId}
      nodeId={selectedNodeId}
      node={node}
      updateNode={updateNode}
    />
  );
}

interface QuestionClassifierPanelContentProps {
  nodeId: string;
  node: WorkflowNode;
  updateNode: ReturnType<typeof useWorkflowStore>['updateNode'];
}

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

function QuestionClassifierPanelContent({
  nodeId,
  node,
  updateNode,
}: QuestionClassifierPanelContentProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const qcData = node.data as QuestionClassifierNodeType;
  const initialClasses = qcData?.classes ?? [];
  const initialModel =
    qcData?.model ??
    ({
      provider: 'openai',
      name: 'gpt-4',
      mode: 'chat' as const,
      completion_params: { temperature: 0.7 },
    } as QuestionClassifierNodeType['model']);
  const variableMappings = (node.data.variable_mappings || {}) as VariableMappingRecord;

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
    nodeId,
    classes: initialClasses,
    model: initialModel,
    visionConfig: qcData?.vision,
    onUpdate: (updates) => {
      updateNode(nodeId, updates as any);
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

    updateNode(nodeId, {
      variable_mappings: nextMappings,
    } as any);
  };

  const handleQuerySelectorChange = (selector: ValueSelector | null) => {
    updateVariableMapping('query', selector, PortType.STRING);
    handleQueryVarChange(selector ? selector.variable.split('.') : []);
  };

  const handleVisionSelectorChange = (selector: ValueSelector | null) => {
    updateVariableMapping('files', selector, PortType.ARRAY_FILE);
    handleVisionFileVarChange(selector ? selector.variable.split('.') : []);
  };

  const querySelectorKey = currentQuerySelector?.variable ?? '';
  const storedQueryKey = qcData?.query_variable_selector?.join('.') ?? '';

  useEffect(() => {
    if (querySelectorKey && querySelectorKey !== storedQueryKey) {
      updateNode(nodeId, {
        query_variable_selector: querySelectorKey.split('.'),
      } as any);
    } else if (!querySelectorKey && storedQueryKey) {
      updateNode(nodeId, {
        query_variable_selector: [],
      } as any);
    }
  }, [querySelectorKey, storedQueryKey, nodeId, updateNode]);

  const fileSelectorKey = currentFilesSelector?.variable ?? '';
  const storedFileKey = qcData?.vision?.variable_selector?.join('.') ?? '';

  useEffect(() => {
    if (!qcData?.vision?.enabled) return;
    if (fileSelectorKey && fileSelectorKey !== storedFileKey) {
      updateNode(nodeId, {
        vision: {
          ...qcData.vision,
          variable_selector: fileSelectorKey.split('.'),
        },
      } as any);
    } else if (!fileSelectorKey && storedFileKey) {
      updateNode(nodeId, {
        vision: {
          ...qcData.vision,
          variable_selector: [],
        },
      } as any);
    }
  }, [fileSelectorKey, storedFileKey, qcData?.vision?.enabled, nodeId, updateNode, qcData?.vision]);

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
        <Group
          title="응답 템플릿"
          description="워크플로우의 최종 응답을 정의합니다"
        >
          {hasErrors && (
            <Alert variant="destructive">
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

          <Group title="클래스 설정" description="질문을 분류할 클래스와 조건을 설정하세요">
            <ClassList classes={classes} onChange={handleClassesChange} />
          </Group>

          <Group
            title="모델 설정"
            description="질문을 분류할 LLM 모델을 선택하세요"
          >
            <LLMModelSelect
              value={qcData.model}
              onChange={handleModelChange}
            />
          </Group>

          <Group title="입력 변수" description="분류할 질문이 담긴 변수를 선택하세요">
            <VarReferencePicker
              nodeId={node.id}
              portType={PortType.STRING}
              value={currentQuerySelector}
              onChange={handleQuerySelectorChange}
              placeholder="프롬프트 입력 변수를 선택하세요"
            />
          </Group>

          <Group
            title="Vision 모드"
            description="이미지를 분류하려면 활성화하세요"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Vision 입력 사용</div>
                <p className="text-xs text-muted-foreground">
                  이미지 파일을 Input으로 받아 분류할 수 있습니다
                </p>
              </div>
              <Switch
                checked={qcData.vision?.enabled}
                onCheckedChange={handleVisionToggle}
              />
            </div>

            {qcData.vision?.enabled && (
              <div className="mt-3 space-y-2">
                <Label className="text-xs text-muted-foreground">이미지 변수</Label>
                <VarReferencePicker
                  nodeId={node.id}
                  portType={PortType.ARRAY_FILE}
                  value={currentFilesSelector}
                  onChange={handleVisionSelectorChange}
                  placeholder="이미지가 포함된 변수를 선택하세요"
                />
              </div>
            )}
          </Group>

          <Separator className="my-4" />

          <Group
            title="추가 설정"
            description="프롬프트 템플릿과 메모리를 구성하세요"
          >
            <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full rounded-md bg-muted px-3 py-2 text-sm font-medium">
                <span>고급 설정</span>
                {isAdvancedOpen ? (
                  <RiArrowDownSLine className="h-4 w-4" />
                ) : (
                  <RiArrowRightSLine className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 space-y-4">
                <Field label="분류 지침" description="분류 기준을 명확히 정의하세요">
                  <Textarea
                    value={qcData.instruction || ''}
                    onChange={(e) => handleInstructionChange(e.target.value)}
                    placeholder="예: 고객 문의 유형을 식별하고, 각각의 케이스를 명확히 구분합니다..."
                    rows={4}
                  />
                </Field>

                <Group title="메모리 설정" description="대화 맥락을 유지하려면 메모리를 활성화하세요">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">메모리 사용</div>
                      <p className="text-xs text-muted-foreground">
                        최근 대화 기록을 기반으로 추가 정보를 활용합니다
                      </p>
                    </div>
                    <Switch
                      checked={Boolean(qcData.memory)}
                      onCheckedChange={handleMemoryToggle}
                    />
                  </div>

                  {qcData.memory && (
                    <div className="mt-3 space-y-3">
                      <Field label="저장 윈도우" description="최근 몇 개의 메시지를 저장할지 설정하세요">
                        <div className="flex items-center gap-4">
                          <Switch
                            checked={qcData.memory.window?.enabled}
                            onCheckedChange={handleMemoryWindowToggle}
                          />
                          <Label className="text-xs text-muted-foreground">
                            최근 {qcData.memory.window?.size ?? 10}개의 메시지를 유지
                          </Label>
                        </div>
                        {qcData.memory.window?.enabled && (
                          <Input
                            type="number"
                            min={1}
                            max={50}
                            value={qcData.memory.window?.size ?? 10}
                            onChange={(e) => handleMemoryWindowSizeChange(Number(e.target.value))}
                          />
                        )}
                      </Field>

                      <Field label="역할 Prefix" description="메모리에 저장될 사용자/어시스턴트 역할 이름">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">User Prefix</Label>
                            <Input
                              value={qcData.memory.role_prefix?.user ?? 'User'}
                              onChange={(e) => handleRolePrefixChange('user', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Assistant Prefix</Label>
                            <Input
                              value={qcData.memory.role_prefix?.assistant ?? 'Assistant'}
                              onChange={(e) => handleRolePrefixChange('assistant', e.target.value)}
                            />
                          </div>
                        </div>
                      </Field>
                    </div>
                  )}
                </Group>
              </CollapsibleContent>
            </Collapsible>
          </Group>
        </Group>
      </Box>
      <OutputVars title="출력 변수" defaultCollapsed={false}>
        <VarItem
          name="query"
          type={PortType.STRING}
          description="입력된 원본 질문 (pass-through)"
        />
        <VarItem
          name="classification"
          type={PortType.STRING}
          description="선택된 클래스 이름"
        />
        <VarItem
          name="confidence"
          type={PortType.NUMBER}
          description="분류 신뢰도 (0~1)"
        />
        <VarItem
          name="explanation"
          type={PortType.STRING}
          description="분류 설명"
        />
      </OutputVars>
    </BasePanel>
  );
}
