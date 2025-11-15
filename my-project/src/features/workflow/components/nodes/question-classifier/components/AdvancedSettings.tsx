import { Label } from '@/shared/components/label';
import { Textarea } from '@/shared/components/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/card';
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
  onInstructionChange,
  readonly = false,
}: AdvancedSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">고급 설정</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
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
          <p className="text-xs text-gray-500">
            분류 정확도를 높이기 위한 추가 컨텍스트를 제공할 수 있습니다
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
