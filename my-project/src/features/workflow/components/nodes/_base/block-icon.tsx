import { memo } from 'react';
import { BlockEnum } from '../../../types/workflow.types';
import Home from '../../icons/Home';
import Llm from '../../icons/Llm';
import Answer from '../../icons/Answer';
import KnowledgeRetrieval from '../../icons/KnowledgeRetrieval';
import clsx from 'clsx';

type BlockIconProps = {
  type: BlockEnum;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
};

/**
 * 아이콘 크기별 컨테이너 클래스
 */
const ICON_CONTAINER_SIZE_MAP: Record<string, string> = {
  xs: 'w-4 h-4 rounded-[5px] shadow-xs',
  sm: 'w-5 h-5 rounded-md shadow-xs',
  md: 'w-6 h-6 rounded-lg shadow-md',
};

/**
 * 노드 타입별 아이콘 컴포넌트 반환
 */
const getIcon = (type: BlockEnum, className: string) => {
  const iconMap = {
    [BlockEnum.Start]: <Home className={className} />,
    [BlockEnum.LLM]: <Llm className={className} />,
    [BlockEnum.End]: <Answer className={className} />,
    [BlockEnum.KnowledgeRetrieval]: (
      <KnowledgeRetrieval className={className} />
    ),
  };
  return iconMap[type] || null;
};

/**
 * 노드 타입별 배경색
 */
const ICON_CONTAINER_BG_COLOR_MAP: Record<string, string> = {
  [BlockEnum.Start]: 'bg-util-colors-blue-brand-blue-brand-500',
  [BlockEnum.LLM]: 'bg-util-colors-indigo-indigo-500',
  [BlockEnum.End]: 'bg-util-colors-warning-warning-500',
  [BlockEnum.KnowledgeRetrieval]: 'bg-util-colors-green-green-500',
};

/**
 * 워크플로우 노드 아이콘 컴포넌트
 * 노드 타입에 따라 적절한 아이콘과 배경색을 표시
 */
const BlockIcon = ({ type, size = 'sm', className }: BlockIconProps) => {
  const iconClassName = size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <div
      className={clsx(
        'flex items-center justify-center border-[0.5px] border-white/2 text-white',
        ICON_CONTAINER_SIZE_MAP[size],
        ICON_CONTAINER_BG_COLOR_MAP[type],
        className
      )}
    >
      {getIcon(type, iconClassName)}
    </div>
  );
};

export default memo(BlockIcon);
