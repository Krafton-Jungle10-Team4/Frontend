// src/features/workflow/components/nodes/_base/PortTooltip.tsx

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@shared/components/tooltip';
import type { PortDefinition } from '@shared/types/workflow';
import { PORT_TYPE_META } from '@shared/constants/workflow/portTypes';
import { cn } from '@shared/utils/cn';

interface PortTooltipProps {
  port: PortDefinition;
  currentValue?: unknown;
  direction: 'input' | 'output';
  children: React.ReactNode;
}

/**
 * 포트 정보 툴팁
 * - 포트 이름, 타입, 설명 표시
 * - 필수 여부 표시
 * - 현재 값 표시 (디버깅용)
 */
export function PortTooltip({
  port,
  currentValue,
  direction,
  children,
}: PortTooltipProps) {
  const meta = PORT_TYPE_META[port.type];

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={direction === 'input' ? 'left' : 'right'}>
          <div className="max-w-xs space-y-2">
            {/* 포트 이름 */}
            <div className="font-semibold">{port.display_name}</div>

            {/* 타입 */}
            <div className="flex items-center gap-2 text-sm">
              <span className={cn('font-medium', meta.color)}>
                {meta.label}
              </span>
              {port.required && (
                <span className="text-red-500 text-xs">(필수)</span>
              )}
            </div>

            {/* 설명 */}
            {port.description && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {port.description}
              </div>
            )}

            {/* 기본값 */}
            {port.default_value !== undefined && (
              <div className="text-xs text-gray-500">
                기본값: <code>{JSON.stringify(port.default_value)}</code>
              </div>
            )}

            {/* 현재 값 (디버깅용) */}
            {currentValue !== undefined && (
              <div className="text-xs border-t pt-1 mt-1">
                <div className="text-gray-500 mb-1">현재 값:</div>
                <code className="text-xs bg-gray-100 dark:bg-gray-800 p-1 rounded block overflow-auto max-h-20">
                  {JSON.stringify(currentValue, null, 2)}
                </code>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
