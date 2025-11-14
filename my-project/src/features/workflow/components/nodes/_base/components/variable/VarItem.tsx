/**
 * VarItem
 *
 * 개별 출력 변수를 타입, 이름, 설명과 함께 표시 (중첩 지원)
 * 재귀적으로 렌더링하여 계층 구조 시각화
 */

import { PortType } from '@shared/types/workflow/port.types';
import { cn } from '@shared/utils/cn';

interface VarItemProps {
  /** 변수명 */
  name: string;

  /** 변수 타입 */
  type: PortType;

  /** 변수 설명 */
  description: string;

  /** 중첩된 하위 항목 (optional) */
  subItems?: VarItemProps[];

  /** 들여쓰기 여부 */
  isIndent?: boolean;

  /** 실행 후 실제 값 (optional) */
  currentValue?: unknown;

  /** 값 표시 여부 */
  showValue?: boolean;
}

/**
 * 값을 타입에 맞게 포맷팅
 */
const formatValue = (value: unknown, type: PortType): string => {
  if (value === null || value === undefined) {
    return 'null';
  }

  switch (type) {
    case PortType.STRING:
      return `"${String(value)}"`;

    case PortType.NUMBER:
      return String(value);

    case PortType.BOOLEAN:
      return String(value);

    case PortType.ARRAY:
      if (Array.isArray(value)) {
        return `[${value.length}개 항목]`;
      }
      return JSON.stringify(value);

    case PortType.OBJECT:
      if (typeof value === 'object') {
        const keys = Object.keys(value as Record<string, unknown>);
        return `{${keys.length}개 필드}`;
      }
      return JSON.stringify(value);

    case PortType.FILE:
      return '[파일]';

    case PortType.ANY:
    default:
      return JSON.stringify(value);
  }
};

export const VarItem = ({
  name,
  type,
  description,
  subItems,
  isIndent = false,
  currentValue,
  showValue = false,
}: VarItemProps) => {
  return (
    <div
      className={cn(
        'py-1',
        isIndent && 'ml-4 pl-3 border-l-2 border-gray-300 dark:border-gray-600'
      )}
    >
      {/* 변수 이름 및 타입 (Dify 스타일) */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
          {name}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
          {type}
        </span>
      </div>

      {/* 변수 설명 */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
        {description}
      </p>

      {/* 실제 값 표시 (실행 후) */}
      {showValue && currentValue !== undefined && (
        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-mono bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
          {formatValue(currentValue, type)}
        </div>
      )}

      {/* 중첩된 하위 항목 (재귀) */}
      {subItems && subItems.length > 0 && (
        <div className="mt-2">
          {subItems.map((item, idx) => (
            <VarItem key={`${item.name}-${idx}`} {...item} isIndent />
          ))}
        </div>
      )}
    </div>
  );
};
