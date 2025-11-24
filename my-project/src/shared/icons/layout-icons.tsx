/**
 * Layout Position Icons
 * 위젯 위치 선택을 위한 아이콘 컴포넌트
 */

import React from 'react';

interface LayoutIconProps {
  className?: string;
}

export function LayoutBottomRight({ className = '' }: LayoutIconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="14" width="6" height="6" rx="1" fill="currentColor" />
    </svg>
  );
}

export function LayoutBottomLeft({ className = '' }: LayoutIconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="4" y="14" width="6" height="6" rx="1" fill="currentColor" />
    </svg>
  );
}

export function LayoutTopRight({ className = '' }: LayoutIconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="4" width="6" height="6" rx="1" fill="currentColor" />
    </svg>
  );
}

export function LayoutTopLeft({ className = '' }: LayoutIconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="4" y="4" width="6" height="6" rx="1" fill="currentColor" />
    </svg>
  );
}
