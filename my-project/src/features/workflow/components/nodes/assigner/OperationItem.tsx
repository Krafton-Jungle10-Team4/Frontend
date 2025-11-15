/**
 * OperationItem 컴포넌트
 * 개별 작업 항목 UI
 */

import { RiDeleteBinLine } from 'react-icons/ri';
import { Button } from '@shared/components/button';
import { Label } from '@shared/components/label';
import { OperationSelector } from './OperationSelector';
import { ConstantValueInput } from './ConstantValueInput';
import { AssignerOperation, AssignerInputType } from '@/shared/types/workflow.types';
import { needsValueInput } from './types';

interface OperationItemProps {
  operation: AssignerOperation;
  index: number;
  onChange: (changes: Partial<AssignerOperation>) => void;
  onRemove: () => void;
}

export const OperationItem = ({
  operation,
  index,
  onChange,
  onRemove,
}: OperationItemProps) => {
  const needsValue = needsValueInput(operation.write_mode);
  const isConstantMode = operation.input_type === AssignerInputType.CONSTANT;

  return (
    <div className="space-y-3 p-3 border rounded-lg bg-background">
      {/* 작업 헤더 */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">작업 {index + 1}</span>
        <Button onClick={onRemove} variant="ghost" size="sm">
          <RiDeleteBinLine className="w-4 h-4" />
        </Button>
      </div>

      {/* 대상 변수 (포트 연결로 처리) */}
      <div className="space-y-1.5">
        <Label className="text-xs">대상 변수</Label>
        <div className="px-3 py-2 rounded-md border bg-muted/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono">operation_{index}_target</span>
            <span className="text-xs text-muted-foreground">← 좌측 포트에 연결</span>
          </div>
        </div>
      </div>

      {/* 작업 타입 선택 */}
      <div className="space-y-1.5">
        <Label className="text-xs">작업</Label>
        <OperationSelector
          value={operation.write_mode}
          targetType={operation.target_variable?.data_type}
          onChange={(writeMode) => onChange({ write_mode: writeMode })}
        />
      </div>

      {/* 입력 값 (작업에 따라 다름) */}
      {needsValue && (
        <div className="space-y-1.5">
          <Label className="text-xs">값</Label>

          {/* 입력 타입 토글 */}
          <div className="flex gap-2">
            <Button
              variant={isConstantMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => onChange({ input_type: AssignerInputType.CONSTANT })}
              className="flex-1"
            >
              상수
            </Button>
            <Button
              variant={!isConstantMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => onChange({ input_type: AssignerInputType.VARIABLE })}
              className="flex-1"
            >
              변수
            </Button>
          </div>

          {/* 상수 입력 */}
          {isConstantMode ? (
            <ConstantValueInput
              writeMode={operation.write_mode}
              targetType={operation.target_variable?.data_type}
              value={operation.constant_value}
              onChange={(value) => onChange({ constant_value: value })}
            />
          ) : (
            <div className="px-3 py-2 rounded-md border bg-muted/50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono">operation_{index}_value</span>
                <span className="text-xs text-muted-foreground">← 좌측 포트에 연결</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 결과 출력 */}
      <div className="space-y-1.5">
        <Label className="text-xs">결과</Label>
        <div className="px-3 py-2 rounded-md border bg-muted/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono">operation_{index}_result</span>
            <span className="text-xs text-muted-foreground">→ 우측 포트로 출력</span>
          </div>
        </div>
      </div>
    </div>
  );
};
