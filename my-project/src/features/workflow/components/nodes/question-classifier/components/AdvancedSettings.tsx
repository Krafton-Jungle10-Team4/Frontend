import { Label } from '@/shared/components/label';
import { Textarea } from '@/shared/components/textarea';
import { Input } from '@/shared/components/input';
import { Switch } from '@/shared/components/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/card';
import { Separator } from '@/shared/components/separator';
import type { MemoryConfig } from '@/shared/types/workflow.types';

interface AdvancedSettingsProps {
  instruction: string;
  memory?: MemoryConfig;
  onInstructionChange: (instruction: string) => void;
  onMemoryChange?: (memory?: MemoryConfig) => void;
  readonly?: boolean;
}

/**
 * 고급 설정 컴포넌트
 * Instruction, Memory 설정
 */
export function AdvancedSettings({
  instruction,
  memory,
  onInstructionChange,
  onMemoryChange,
  readonly = false,
}: AdvancedSettingsProps) {
  const handleMemoryToggle = (enabled: boolean) => {
    if (!onMemoryChange) return;

    if (enabled) {
      onMemoryChange({
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
      onMemoryChange(undefined);
    }
  };

  const handleMemoryWindowToggle = (enabled: boolean) => {
    if (!onMemoryChange || !memory) return;

    onMemoryChange({
      ...memory,
      window: {
        ...memory.window,
        enabled,
      },
    });
  };

  const handleMemoryWindowSizeChange = (size: number) => {
    if (!onMemoryChange || !memory) return;

    onMemoryChange({
      ...memory,
      window: {
        ...memory.window,
        size,
      },
    });
  };

  const handleRolePrefixChange = (role: 'user' | 'assistant', prefix: string) => {
    if (!onMemoryChange || !memory) return;

    onMemoryChange({
      ...memory,
      role_prefix: {
        ...memory.role_prefix,
        [role]: prefix,
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">고급 설정</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Instruction */}
        <div className="space-y-2">
          <Label htmlFor="instruction">추가 지시사항</Label>
          <Textarea
            id="instruction"
            value={instruction}
            onChange={(e) => onInstructionChange(e.target.value)}
            placeholder="LLM에게 전달할 추가 컨텍스트나 분류 기준을 입력하세요&#10;예: 다음 기준으로 질문을 분류해주세요:&#10;- 제품 문의: 제품 사용법, 기능 관련&#10;- 기술 지원: 오류, 버그 관련"
            className="min-h-[100px] text-xs"
            disabled={readonly}
          />
          <p className="text-xs text-gray-500">분류 정확도를 높이기 위한 추가 컨텍스트를 제공할 수 있습니다</p>
        </div>

        <Separator />

        {/* Memory Configuration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label>대화 기록 메모리</Label>
              <p className="text-xs text-gray-500 mt-1">이전 대화 내용을 참고하여 분류</p>
            </div>
            <Switch checked={!!memory} onCheckedChange={handleMemoryToggle} disabled={readonly} />
          </div>

          {memory && (
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
                      value={memory.role_prefix.user}
                      onChange={(e) => handleRolePrefixChange('user', e.target.value)}
                      placeholder="User"
                      className="text-xs"
                      disabled={readonly}
                    />
                  </div>
                  <div>
                    <Label htmlFor="assistant-prefix" className="text-xs text-gray-600">
                      어시스턴트
                    </Label>
                    <Input
                      id="assistant-prefix"
                      value={memory.role_prefix.assistant}
                      onChange={(e) => handleRolePrefixChange('assistant', e.target.value)}
                      placeholder="Assistant"
                      className="text-xs"
                      disabled={readonly}
                    />
                  </div>
                </div>
              </div>

              {/* Memory Window */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">대화 기록 제한</Label>
                  <Switch
                    checked={memory.window.enabled}
                    onCheckedChange={handleMemoryWindowToggle}
                    disabled={readonly}
                  />
                </div>

                {memory.window.enabled && (
                  <div className="space-y-1">
                    <Label htmlFor="window-size" className="text-xs text-gray-600">
                      최대 메시지 수
                    </Label>
                    <Input
                      id="window-size"
                      type="number"
                      min={1}
                      max={100}
                      value={memory.window.size}
                      onChange={(e) => handleMemoryWindowSizeChange(parseInt(e.target.value, 10))}
                      className="text-xs"
                      disabled={readonly}
                    />
                    <p className="text-xs text-gray-500">참고할 이전 대화 메시지 개수 (1-100)</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
