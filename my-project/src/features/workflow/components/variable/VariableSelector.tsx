// src/features/workflow/components/variable/VariableSelector.tsx

import React from 'react';
import { VariableReference } from '@shared/types/workflow';
import { PORT_TYPE_META } from '@shared/constants/workflow/portTypes';
import { cn } from '@shared/utils/cn';
import { RiCheckLine } from '@remixicon/react';

interface VariableSelectorProps {
  variable: VariableReference;
  isSelected: boolean;
  onSelect: (variable: VariableReference) => void;
}

export function VariableSelector({
  variable,
  isSelected,
  onSelect,
}: VariableSelectorProps) {
  const meta = PORT_TYPE_META[variable.type];

  return (
    <button
      onClick={() => onSelect(variable)}
      className={cn(
        'w-full flex items-center justify-between',
        'px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800',
        'transition-colors text-left',
        isSelected && 'bg-blue-50 dark:bg-blue-900/20'
      )}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* 타입 아이콘 */}
        <div
          className={cn(
            'w-6 h-6 rounded flex items-center justify-center',
            meta.bgColor
          )}
        >
          <span className={cn('text-xs font-semibold', meta.color)}>
            {meta.label.charAt(0)}
          </span>
        </div>

        {/* 변수 정보 */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">
            {variable.nodeTitle}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {variable.portDisplayName}
          </div>
        </div>
      </div>

      {/* 선택 표시 */}
      {isSelected && (
        <RiCheckLine size={18} className="text-blue-600 flex-shrink-0" />
      )}
    </button>
  );
}
