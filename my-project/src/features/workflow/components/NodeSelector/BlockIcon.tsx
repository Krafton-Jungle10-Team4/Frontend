/**
 * 블록 아이콘 컴포넌트
 * 노드 타입에 따른 SVG 아이콘과 배경색을 표시
 */

import { FC, memo, Suspense, lazy } from 'react';
import { cn } from '@/shared/utils/cn';
import type { BlockIconProps } from './types';
import { ICON_BG_COLORS } from './constants';

// 아이콘 동적 import (lazy loading)
const iconComponents: Record<string, React.LazyExoticComponent<FC<React.SVGProps<SVGSVGElement>>>> = {
  start: lazy(() => import('../icons/Home')),
  llm: lazy(() => import('../icons/Llm')),
  'knowledge-retrieval': lazy(() => import('../icons/KnowledgeRetrieval')),
  answer: lazy(() => import('../icons/Answer')),
  end: lazy(() => import('../icons/Answer')), // End는 Home 아이콘 재사용 또는 별도 아이콘
  'question-classifier': lazy(() => import('../icons/QuestionClassifier')),
  'if-else': lazy(() => import('../icons/IfElse')),
  'variable-assigner': lazy(() => import('../icons/Assigner')),
  assigner: lazy(() => import('../icons/Assigner')),
  'template-transform': lazy(() => import('../icons/TemplateTransform')),
  'tavily-search': lazy(() => import('../icons/Search')),
  mcp: lazy(() => import('../icons/Mcp')),
};

// 사이즈 매핑
const SIZE_MAP = {
  xs: 'w-4 h-4 rounded',
  sm: 'w-5 h-5 rounded-md',
  md: 'w-6 h-6 rounded-lg',
};

const ICON_SIZE_MAP = {
  xs: 'w-2.5 h-2.5',
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
};

// Fallback 아이콘 (로딩 중 또는 아이콘이 없을 때)
const FallbackIcon: FC<{ size: 'xs' | 'sm' | 'md' }> = ({ size }) => (
  <span
    className={cn(
      'text-white font-medium',
      size === 'xs' && 'text-[8px]',
      size === 'sm' && 'text-[10px]',
      size === 'md' && 'text-xs'
    )}
  >
    ?
  </span>
);

export const BlockIcon: FC<BlockIconProps> = memo(({ type, size = 'sm', className }) => {
  const IconComponent = iconComponents[type];
  const bgColor = ICON_BG_COLORS[type] || 'bg-gray-500';

  return (
    <div
      className={cn(
        'flex items-center justify-center flex-shrink-0',
        SIZE_MAP[size],
        bgColor,
        className
      )}
    >
      {IconComponent ? (
        <Suspense fallback={<FallbackIcon size={size} />}>
          <IconComponent className={cn(ICON_SIZE_MAP[size], 'text-white')} />
        </Suspense>
      ) : (
        <FallbackIcon size={size} />
      )}
    </div>
  );
});

BlockIcon.displayName = 'BlockIcon';
