/**
 * 노드 선택기 탭 컴포넌트
 */

import { FC, memo } from 'react';
import { cn } from '@/shared/utils/cn';
import { TabType, type NodeSelectorTabsProps } from './types';

const TABS = [
  { key: TabType.Nodes, label: '노드' },
  { key: TabType.Tools, label: '도구' },
];

export const NodeSelectorTabs: FC<NodeSelectorTabsProps> = memo(
  ({ activeTab, onTabChange, showToolsTab = false }) => {
    const visibleTabs = showToolsTab ? TABS : TABS.filter((tab) => tab.key !== TabType.Tools);

    // 탭이 하나만 있으면 탭 UI를 렌더링하지 않음
    if (visibleTabs.length <= 1) {
      return null;
    }

    return (
      <div className="flex bg-gray-100 dark:bg-gray-900 px-1 pt-1 rounded-t-lg">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={cn(
              'px-3 py-2 text-sm font-medium rounded-t-lg mr-0.5 transition-colors',
              activeTab === tab.key
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            )}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    );
  }
);

NodeSelectorTabs.displayName = 'NodeSelectorTabs';
