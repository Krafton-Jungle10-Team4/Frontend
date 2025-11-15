import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/select';
import { ComparisonOperator, VarType } from '@/shared/types/workflow.types';
import { getOperatorsForType, OPERATOR_LABELS } from '../utils/operators';

interface OperatorSelectorProps {
  varType: VarType;
  value: ComparisonOperator;
  onChange: (operator: ComparisonOperator) => void;
}

export function OperatorSelector({ varType, value, onChange }: OperatorSelectorProps) {
  const availableOperators = getOperatorsForType(varType);

  return (
    <Select value={value} onValueChange={(val) => onChange(val as ComparisonOperator)}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="연산자 선택..." />
      </SelectTrigger>
      <SelectContent>
        {availableOperators.map((op) => (
          <SelectItem key={op} value={op}>
            {OPERATOR_LABELS[op]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
