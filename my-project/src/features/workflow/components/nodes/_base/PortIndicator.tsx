// src/features/workflow/components/nodes/_base/PortIndicator.tsx

import { RiCheckLine } from '@remixicon/react';
import { cn } from '@shared/utils/cn';

interface PortIndicatorProps {
  type: 'required' | 'connected';
  size?: 'sm' | 'md';
}

/**
 * 포트 상태 표시 인디케이터
 * - required: 필수 포트 표시 (빨간 별표)
 * - connected: 연결됨 표시 (초록 체크)
 */
export function PortIndicator({ type, size = 'sm' }: PortIndicatorProps) {
  const iconSize = size === 'sm' ? 12 : 16;

  if (type === 'required') {
    return (
      <span
        className="text-red-500 font-bold leading-none"
        style={{ fontSize: `${iconSize}px` }}
        title="필수 포트"
      >
        *
      </span>
    );
  }

  if (type === 'connected') {
    return (
      <RiCheckLine
        size={iconSize}
        className="text-green-500"
        title="연결됨"
      />
    );
  }

  return null;
}
