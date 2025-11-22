/**
 * 개별 노드 아이템 컴포넌트
 */

import { FC, memo } from 'react';
import { cn } from '@/shared/utils/cn';
import { BlockIcon } from './BlockIcon';
import type { NodeItemProps } from './types';

export const NodeItem: FC<NodeItemProps> = memo(({ node, onSelect }) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full px-3 py-2 flex items-center gap-3',
        'hover:bg-blue-50 dark:hover:bg-blue-900/20',
        'rounded-md transition-colors text-left',
        'group'
      )}
    >
      <BlockIcon type={node.type} size="sm" />

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {node.label}
        </div>
        {node.description && (
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {node.description}
          </div>
        )}
      </div>
    </button>
  );
});

NodeItem.displayName = 'NodeItem';
