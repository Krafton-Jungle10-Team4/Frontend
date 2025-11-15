/**
 * ConstantValueInput 컴포넌트
 * 상수 값 입력 UI (타입별로 다른 입력 필드 표시)
 */

import { Input } from '@shared/components/input';
import { Textarea } from '@shared/components/textarea';
import { Switch } from '@shared/components/switch';
import { Label } from '@shared/components/label';
import { WriteMode } from '@/shared/types/workflow.types';
import { isArithmeticOperation } from './types';

interface ConstantValueInputProps {
  writeMode: WriteMode;
  targetType?: string;
  value: any;
  onChange: (value: any) => void;
}

export const ConstantValueInput = ({
  writeMode,
  targetType,
  value,
  onChange,
}: ConstantValueInputProps) => {
  // 산술 작업 → 숫자 입력
  if (isArithmeticOperation(writeMode)) {
    return (
      <Input
        type="number"
        placeholder="숫자 입력"
        value={value ?? ''}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      />
    );
  }

  // set 작업 → 타입별 입력
  if (writeMode === WriteMode.SET) {
    switch (targetType) {
      case 'number':
        return (
          <Input
            type="number"
            placeholder="숫자 입력"
            value={value ?? ''}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center gap-2">
            <Switch checked={value ?? false} onCheckedChange={onChange} />
            <Label className="text-sm">{value ? 'True' : 'False'}</Label>
          </div>
        );

      case 'string':
        return (
          <Textarea
            placeholder="문자열 입력"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
          />
        );

      case 'object':
        return (
          <Textarea
            placeholder='{"key": "value"}'
            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value ?? ''}
            onChange={(e) => {
              try {
                onChange(JSON.parse(e.target.value));
              } catch {
                onChange(e.target.value);
              }
            }}
            rows={5}
            className="font-mono text-sm"
          />
        );

      default:
        return (
          <Input
            placeholder="값 입력"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
          />
        );
    }
  }

  // 기본: 문자열 입력
  return (
    <Input
      placeholder="값 입력"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};
