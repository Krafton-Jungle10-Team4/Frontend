// src/features/workflow/components/variable/VariablePath.tsx

import React from 'react';
import { VariableReference } from '@shared/types/workflow';
import { PORT_TYPE_META } from '@shared/constants/workflow/portTypes';
import { cn } from '@shared/utils/cn';
import { RiArrowRightSLine } from '@remixicon/react';

interface VariablePathProps {
  variable: VariableReference;
  showType?: boolean;
  compact?: boolean;
}

export function VariablePath({
  variable,
  showType = true,
  compact = false,
}: VariablePathProps) {
  const meta = PORT_TYPE_META[variable.type];

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 text-sm">
        <span className={cn('font-medium', meta.color)}>
          {variable.nodeTitle}
        </span>
        <RiArrowRightSLine size={16} className="text-gray-400" />
        <span className="text-gray-600 dark:text-gray-400">
          {variable.portDisplayName}
        </span>
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      {/* 타입 뱃지 */}
      {showType && (
        <span
          className={cn(
            'px-2 py-0.5 rounded text-xs font-medium',
            meta.bgColor,
            meta.color
          )}
        >
          {meta.label}
        </span>
      )}

      {/* 경로 */}
      <span className="inline-flex items-center gap-1">
        <span className="font-medium text-gray-800 dark:text-gray-200">
          {variable.nodeTitle}
        </span>
        <RiArrowRightSLine size={16} className="text-gray-400" />
        <span className="text-gray-600 dark:text-gray-400">
          {variable.portDisplayName}
        </span>
      </span>
    </div>
  );
}
