/**
 * OperationSelector 컴포넌트
 * 작업 타입 선택 드롭다운
 */

import { useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/select';
import { Separator } from '@shared/components/separator';
import { WriteMode } from '@/shared/types/workflow.types';
import { WRITE_MODE_LABELS, BASE_MODES, ARRAY_MODES, ARITHMETIC_MODES } from './types';

interface OperationSelectorProps {
  value: WriteMode;
  targetType?: string;
  onChange: (value: WriteMode) => void;
}

export const OperationSelector = ({
  value,
  targetType,
  onChange,
}: OperationSelectorProps) => {
  // 타입에 따라 사용 가능한 작업 필터링
  const availableOperations = useMemo(() => {
    if (!targetType || targetType === 'any') {
      return {
        base: BASE_MODES,
        array: ARRAY_MODES,
        arithmetic: ARITHMETIC_MODES,
      };
    }

    if (targetType.startsWith('array')) {
      return {
        base: BASE_MODES,
        array: ARRAY_MODES,
        arithmetic: [],
      };
    }

    if (targetType === 'number') {
      return {
        base: BASE_MODES,
        array: [],
        arithmetic: ARITHMETIC_MODES,
      };
    }

    return {
      base: BASE_MODES,
      array: [],
      arithmetic: [],
    };
  }, [targetType]);

  const hasArrayOps = availableOperations.array.length > 0;
  const hasArithmeticOps = availableOperations.arithmetic.length > 0;

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="작업 선택" />
      </SelectTrigger>
      <SelectContent>
        {/* 기본 작업 */}
        {availableOperations.base.map((mode) => (
          <SelectItem key={mode} value={mode}>
            {WRITE_MODE_LABELS[mode]}
          </SelectItem>
        ))}

        {/* 배열 작업 (있는 경우) */}
        {hasArrayOps && (
          <>
            <Separator className="my-1" />
            {availableOperations.array.map((mode) => (
              <SelectItem key={mode} value={mode}>
                {WRITE_MODE_LABELS[mode]}
              </SelectItem>
            ))}
          </>
        )}

        {/* 산술 작업 (있는 경우) */}
        {hasArithmeticOps && (
          <>
            <Separator className="my-1" />
            {availableOperations.arithmetic.map((mode) => (
              <SelectItem key={mode} value={mode}>
                {WRITE_MODE_LABELS[mode]}
              </SelectItem>
            ))}
          </>
        )}
      </SelectContent>
    </Select>
  );
};
