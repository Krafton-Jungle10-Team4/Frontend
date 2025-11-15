import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/card';
import { Label } from '@/shared/components/label';
import { Input } from '@/shared/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/select';
import { Switch } from '@/shared/components/switch';
import { Alert, AlertDescription } from '@/shared/components/alert';
import { AlertCircle } from 'lucide-react';
import { ClassList } from './components/ClassList';
import { AdvancedSettings } from './components/AdvancedSettings';
import { useQuestionClassifier } from './hooks/useQuestionClassifier';
import type { QuestionClassifierNodeType } from '@/shared/types/workflow.types';
import { useWorkflowStore } from '@/features/workflow/stores/workflowStore';

/**
 * Question Classifier 노드 설정 패널
 */
export function QuestionClassifierPanel() {
  const { selectedNodeId, nodes, updateNode } = useWorkflowStore();

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

  const {
    classes,
    handleClassesChange,
    handleModelChange,
    handleVisionToggle,
    handleInstructionChange,
  } = useQuestionClassifier({
    nodeId: selectedNodeId!,
    classes: initialClasses,
    model: initialModel,
    onUpdate: (updates) => {
      updateNode(selectedNodeId!, updates as any);
    },
  });

  // 검증
  const hasErrors =
    !qcData?.model?.provider || !qcData?.model?.name || classes.length === 0 || classes.some((c) => !c.name);

  const errors: string[] = [];
  if (!qcData?.model?.provider || !qcData?.model?.name) errors.push('모델을 선택해주세요');
  if (classes.length === 0) errors.push('최소 1개의 클래스를 추가해주세요');
  if (classes.some((c) => !c.name)) errors.push('모든 클래스에 이름을 입력해주세요');

  return (
    <div className="space-y-4 p-4">
      {/* 헤더 */}
      <div>
        <h3 className="text-sm font-semibold mb-1">Question Classifier 설정</h3>
        <p className="text-xs text-gray-500">AI를 사용하여 질문을 미리 정의된 카테고리로 분류합니다</p>
      </div>

      {/* 검증 에러 표시 */}
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

      {/* 모델 선택 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">모델 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>Provider</Label>
            <Select
              value={qcData?.model?.provider || 'openai'}
              onValueChange={(value) => handleModelChange({ provider: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Provider 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="google">Google</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Model</Label>
            <Select
              value={qcData?.model?.name || 'gpt-4'}
              onValueChange={(value) => handleModelChange({ name: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="모델 선택" />
              </SelectTrigger>
              <SelectContent>
                {qcData?.model?.provider === 'openai' && (
                  <>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  </>
                )}
                {qcData?.model?.provider === 'anthropic' && (
                  <>
                    <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                    <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                    <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                  </>
                )}
                {qcData?.model?.provider === 'google' && (
                  <>
                    <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                    <SelectItem value="gemini-pro-vision">Gemini Pro Vision</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Temperature</Label>
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
          </div>
        </CardContent>
      </Card>

      {/* Vision 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Vision 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Vision 모드 활성화</Label>
            <Switch
              checked={qcData?.vision?.enabled ?? false}
              onCheckedChange={handleVisionToggle}
            />
          </div>
          {qcData?.vision?.enabled && (
            <p className="text-xs text-gray-500">
              Vision 모드에서는 이미지를 포함한 질문을 분류할 수 있습니다
            </p>
          )}
        </CardContent>
      </Card>

      {/* 클래스 관리 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">분류 카테고리</CardTitle>
        </CardHeader>
        <CardContent>
          <ClassList classes={classes} onChange={handleClassesChange} />
        </CardContent>
      </Card>

      {/* 고급 설정 */}
      <AdvancedSettings
        instruction={qcData?.instruction ?? ''}
        onInstructionChange={handleInstructionChange}
      />

      {/* 출력 변수 안내 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">출력 변수</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <code className="px-2 py-1 bg-gray-100 rounded">class_name</code>
            <span className="text-gray-600">→ 선택된 클래스 이름 (string)</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="px-2 py-1 bg-gray-100 rounded">usage</code>
            <span className="text-gray-600">→ LLM 토큰 사용량 (object)</span>
          </div>
          {classes.map((topic) => (
            <div key={topic.id} className="flex items-center gap-2">
              <code className="px-2 py-1 bg-gray-100 rounded text-[10px]">
                class_{topic.id}_branch
              </code>
              <span className="text-gray-600">→ {topic.name || 'Unnamed'} 선택 여부 (boolean)</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
