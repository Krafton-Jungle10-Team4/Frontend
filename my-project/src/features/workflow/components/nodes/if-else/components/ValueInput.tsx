import { Input } from '@/shared/components/input';
import { Switch } from '@/shared/components/switch';
import { VarType } from '@/shared/types/workflow.types';

interface ValueInputProps {
  varType: VarType;
  value?: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
}

export function ValueInput({ varType, value, onChange }: ValueInputProps) {
  if (varType === VarType.BOOLEAN) {
    return (
      <div className="flex items-center gap-2">
        <Switch
          checked={value === true || value === 'true'}
          onCheckedChange={(checked) => onChange(checked)}
        />
        <span className="text-xs text-gray-600">
          {value === true || value === 'true' ? 'True' : 'False'}
        </span>
      </div>
    );
  }

  if (varType === VarType.NUMBER) {
    return (
      <Input
        type="number"
        value={value !== undefined ? String(value) : ''}
        onChange={(e) => {
          const num = parseFloat(e.target.value);
          onChange(isNaN(num) ? 0 : num);
        }}
        placeholder="값"
        className="w-full"
      />
    );
  }

  // STRING
  return (
    <Input
      type="text"
      value={value !== undefined ? String(value) : ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder="값"
      className="w-full"
    />
  );
}
