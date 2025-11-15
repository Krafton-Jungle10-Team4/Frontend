import { Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { VariableSelector } from './VariableSelector';
import { OperatorSelector } from './OperatorSelector';
import { ValueInput } from './ValueInput';
import type { IfElseCondition, ComparisonOperator, VarType } from '@/shared/types/workflow.types';
import { NO_VALUE_OPERATORS } from '../utils/operators';

interface ConditionItemProps {
  nodeId: string;
  condition: IfElseCondition;
  caseId: string;
  onUpdate: (caseId: string, conditionId: string, updates: Partial<IfElseCondition>) => void;
  onRemove: (caseId: string, conditionId: string) => void;
}

export function ConditionItem({
  nodeId,
  condition,
  caseId,
  onUpdate,
  onRemove,
}: ConditionItemProps) {
  const handleVariableChange = (variable: string, varType: VarType) => {
    onUpdate(caseId, condition.id, {
      variable_selector: variable,
      varType: varType,
    });
  };

  const handleOperatorChange = (operator: ComparisonOperator) => {
    onUpdate(caseId, condition.id, {
      comparison_operator: operator,
    });
  };

  const handleValueChange = (value: string | number | boolean) => {
    onUpdate(caseId, condition.id, { value });
  };

  // empty 연산자는 값 입력 불필요
  const needsValue = !NO_VALUE_OPERATORS.includes(condition.comparison_operator);

  return (
    <div className="flex items-start gap-2">
      {/* 변수 선택 */}
      <div className="flex-1 min-w-0">
        <label className="text-xs text-gray-600 mb-1 block">변수</label>
        <VariableSelector
          nodeId={nodeId}
          value={condition.variable_selector}
          onChange={handleVariableChange}
        />
      </div>

      {/* 연산자 선택 */}
      <div className="flex-1 min-w-0">
        <label className="text-xs text-gray-600 mb-1 block">연산자</label>
        <OperatorSelector
          varType={condition.varType}
          value={condition.comparison_operator}
          onChange={handleOperatorChange}
        />
      </div>

      {/* 값 입력 */}
      {needsValue && (
        <div className="flex-1 min-w-0">
          <label className="text-xs text-gray-600 mb-1 block">값</label>
          <ValueInput
            varType={condition.varType}
            value={condition.value}
            onChange={handleValueChange}
          />
        </div>
      )}

      {/* 삭제 버튼 */}
      <div className="pt-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(caseId, condition.id)}
          className="h-8 w-8"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
