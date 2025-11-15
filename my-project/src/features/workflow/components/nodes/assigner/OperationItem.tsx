/**
 * OperationItem 컴포넌트
 * 개별 작업 항목 UI
 */

import { Trash2 } from 'lucide-react';
import { Button } from '@shared/components/button';
import { Label } from '@shared/components/label';
import { OperationSelector } from './OperationSelector';
import { ConstantValueInput } from './ConstantValueInput';
import {
  AssignerOperation,
  AssignerInputType,
  WriteMode,
} from '@/shared/types/workflow.types';
import { needsValueInput, ARITHMETIC_MODES } from './types';
import { VarReferencePicker } from '@/features/workflow/components/variable/VarReferencePicker';
import type { NodeVariableMappings, ValueSelector } from '@shared/types/workflow';
import { PortType } from '@shared/types/workflow';

interface OperationItemProps {
  nodeId: string;
  operation: AssignerOperation;
  index: number;
  variableMappings?: NodeVariableMappings;
  onChange: (changes: Partial<AssignerOperation>) => void;
  onRemove: () => void;
  onVariableMappingChange: (portName: string, selector: ValueSelector | null) => void;
}

export const OperationItem = ({
  nodeId,
  operation,
  index,
  variableMappings,
  onChange,
  onRemove,
  onVariableMappingChange,
}: OperationItemProps) => {
  const needsValue = needsValueInput(operation.write_mode);
  const isConstantMode = operation.input_type === AssignerInputType.CONSTANT;
  const targetPortName = `operation_${index}_target`;
  const valuePortName = `operation_${index}_value`;
  const targetSelector = variableMappings?.[targetPortName]?.source ?? null;
  const valueSelector = variableMappings?.[valuePortName]?.source ?? null;

  const getValuePortType = (writeMode: WriteMode) =>
    ARITHMETIC_MODES.includes(writeMode) ? PortType.NUMBER : PortType.ANY;

  return (
    <div className="space-y-3 p-3 border rounded-lg bg-background">
      {/* 작업 헤더 */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">작업 {index + 1}</span>
        <Button onClick={onRemove} variant="ghost" size="sm">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* 대상 변수 + 작업 타입 */}
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="flex-1 space-y-1.5">
          <Label className="text-xs">대상 변수</Label>
          <VarReferencePicker
            nodeId={nodeId}
            portName={targetPortName}
            portType={PortType.ANY}
            value={targetSelector}
            onChange={(selector) => onVariableMappingChange(targetPortName, selector)}
            placeholder="결과를 저장할 변수를 선택하세요"
          />
        </div>

        <div className="md:w-40 space-y-1.5">
          <Label className="text-xs">작업</Label>
          <OperationSelector
            value={operation.write_mode}
            targetType={operation.target_variable?.data_type}
            onChange={(writeMode) => onChange({ write_mode: writeMode })}
          />
        </div>
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
            <VarReferencePicker
              nodeId={nodeId}
              portName={valuePortName}
              portType={getValuePortType(operation.write_mode)}
              value={valueSelector}
              onChange={(selector) => onVariableMappingChange(valuePortName, selector)}
              placeholder="입력 값을 선택하세요"
            />
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
