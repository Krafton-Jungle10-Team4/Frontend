import { Search, Tag } from 'lucide-react';
import { cn } from '@/shared/components/utils';

import type { WorkflowStats } from '@/shared/types/workflow';

interface FilterSidebarProps {
  tags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  workflowStats: WorkflowStats;
}

const StudioSearchBar: React.FC<{ value: string; onChange: (value: string) => void }> = ({
  value,
  onChange
}) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-studio-text-muted" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="워크플로우 검색..."
        className={cn(
          'w-full pl-10 pr-4 py-2',
          'bg-studio-search-bg border border-studio-search-border',
          'rounded-studio text-sm text-studio-text-primary',
          'placeholder:text-studio-text-muted',
          'focus:outline-none focus:ring-2 focus:ring-studio-primary/20',
          'focus:border-studio-primary',
          'transition-all'
        )}
      />
    </div>
  );
};

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  tags,
  selectedTags,
  onTagToggle,
  searchValue,
  onSearchChange,
  workflowStats,
}) => {
  return (
    <aside className="w-[280px] h-full bg-white border-r border-gray-200 p-5 space-y-6">
      <StudioSearchBar value={searchValue} onChange={onSearchChange} />

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Tag className="h-4 w-4 text-gray-700" />
          <h3 className="text-sm font-semibold text-gray-700">태그 필터</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagToggle(tag)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-all border',
                selectedTags.includes(tag)
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">총 워크플로우</h3>
          <div className="text-4xl font-bold text-gray-900 mb-4">{workflowStats.total}</div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-50 rounded-md p-3">
              <div className="text-xs font-medium text-gray-600 mb-1">실행 중</div>
              <div className="text-2xl font-bold text-gray-900">{workflowStats.running}</div>
            </div>
            <div className="bg-gray-100 rounded-md p-3">
              <div className="text-xs font-medium text-gray-600 mb-1">중지됨</div>
              <div className="text-2xl font-bold text-gray-900">{workflowStats.stopped}</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
