/**
 * VersionBadge - 버전 라벨 컴포넌트
 * 각 버전을 색상별로 구분하여 표시
 */
import { memo } from 'react';

interface VersionBadgeProps {
  version: string;
  className?: string;
}

/**
 * 버전 문자열을 기반으로 고유한 색상을 반환
 */
const getVersionColor = (version: string): string => {
  const colors = [
    'bg-green-600',    // 초록
    'bg-blue-600',     // 파랑
    'bg-yellow-600',   // 노랑
    'bg-purple-600',   // 보라
    'bg-pink-600',     // 분홍
    'bg-orange-600',   // 주황
    'bg-teal-600',     // 청록
    'bg-indigo-600',   // 남색
    'bg-red-600',      // 빨강
    'bg-cyan-600',     // 하늘색
  ];

  // 버전 문자열에서 숫자만 추출하여 해시값 생성
  const versionNumbers = version.replace(/[^\d]/g, '');
  const hash = versionNumbers.split('').reduce((acc, char) => acc + parseInt(char, 10), 0);

  return colors[hash % colors.length];
};

export const VersionBadge = memo<VersionBadgeProps>(({ version, className = '' }) => {
  const colorClass = getVersionColor(version);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium text-white ${colorClass} ${className}`}
    >
      {version}
    </span>
  );
});

VersionBadge.displayName = 'VersionBadge';
