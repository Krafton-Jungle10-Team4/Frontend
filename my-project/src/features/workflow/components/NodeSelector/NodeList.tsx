/**
 * 노드 목록 컴포넌트 (카테고리별 그룹핑)
 */

import { FC, memo } from 'react';
import { NodeItem } from './NodeItem';
import type { NodeListProps } from './types';
import { CATEGORY_LABELS, CATEGORY_ORDER } from './constants';

export const NodeList: FC<NodeListProps> = memo(({ groups, onSelect }) => {
  const isEmpty = Object.values(groups).every((list) => list.length === 0);

  if (isEmpty) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
        검색 결과가 없습니다.
      </div>
    );
  }

  return (
    <div className="max-h-[400px] overflow-y-auto p-1">
      {CATEGORY_ORDER.map((category) => {
        const nodes = groups[category];
        if (!nodes || nodes.length === 0) return null;

        return (
          <div key={category} className="mb-1 last:mb-0">
            {/* 카테고리 라벨 (Default 제외) */}
            {CATEGORY_LABELS[category] && (
              <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {CATEGORY_LABELS[category]}
              </div>
            )}

            {/* 노드 아이템들 */}
            {nodes.map((node) => (
              <NodeItem key={node.type} node={node} onSelect={() => onSelect(node)} />
            ))}
          </div>
        );
      })}
    </div>
  );
});

NodeList.displayName = 'NodeList';
