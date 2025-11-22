/**
 * NodeSelector 메인 컴포넌트
 * Dify 스타일의 노드 선택 UI
 */

import { FC, memo, useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/shared/utils/cn';
import { NodeSelectorTabs } from './NodeSelectorTabs';
import { SearchInput } from './SearchInput';
import { NodeList } from './NodeList';
import { useFilteredNodes, useGroupedNodes } from './hooks';
import { TabType, type NodeSelectorProps } from './types';
import type { NodeTypeResponse } from '../../types/api.types';

export const NodeSelector: FC<NodeSelectorProps> = memo(
  ({ nodes, onSelect, onClose, position, showToolsTab = false }) => {
    const [activeTab, setActiveTab] = useState<TabType>(TabType.Nodes);
    const [searchText, setSearchText] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    // 노드 필터링 및 그룹화
    const filteredNodes = useFilteredNodes(nodes, searchText);
    const groupedNodes = useGroupedNodes(filteredNodes);

    // 노드 선택 핸들러
    const handleSelect = useCallback(
      (nodeType: NodeTypeResponse) => {
        onSelect(nodeType);
        onClose();
      },
      [onSelect, onClose]
    );

    // 외부 클릭 감지
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          onClose();
        }
      };

      // mousedown으로 변경하여 클릭 시작 시 즉시 닫히도록
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // ESC 키로 닫기
    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    // 탭 변경 시 검색어 초기화
    const handleTabChange = useCallback((tab: TabType) => {
      setActiveTab(tab);
      setSearchText('');
    }, []);

    return (
      <div
        ref={containerRef}
        className={cn(
          'fixed z-50 min-w-[280px] max-w-[320px]',
          'bg-white dark:bg-gray-800',
          'rounded-lg shadow-xl',
          'border border-gray-200 dark:border-gray-700',
          'overflow-hidden'
        )}
        style={{ left: position.x, top: position.y }}
      >
        {/* 탭 (선택적) */}
        <NodeSelectorTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          showToolsTab={showToolsTab}
        />

        {/* 검색 입력 */}
        <SearchInput
          value={searchText}
          onChange={setSearchText}
          placeholder={activeTab === TabType.Nodes ? '노드 검색...' : '도구 검색...'}
        />

        {/* 구분선 */}
        <div className="border-t border-gray-200 dark:border-gray-700" />

        {/* 콘텐츠 영역 */}
        {activeTab === TabType.Nodes && (
          <NodeList groups={groupedNodes} onSelect={handleSelect} />
        )}

        {activeTab === TabType.Tools && (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
            도구 기능은 추후 지원 예정입니다.
          </div>
        )}
      </div>
    );
  }
);

NodeSelector.displayName = 'NodeSelector';

// Default export
export default NodeSelector;

// Re-exports
export * from './types';
export * from './constants';
export { BlockIcon } from './BlockIcon';
export { SearchInput } from './SearchInput';
export { NodeSelectorTabs } from './NodeSelectorTabs';
export { NodeList } from './NodeList';
export { NodeItem } from './NodeItem';
