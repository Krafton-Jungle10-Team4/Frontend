import { Search, Tag as TagIcon } from 'lucide-react';
import { cn } from '@/shared/components/utils';
import { Badge } from '@/shared/components/badge';

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
        placeholder="서비스 검색..."
        className={cn(
          'w-full pl-10 pr-4 py-2',
          'bg-studio-search-bg border border-studio-search-border',
          'text-sm text-studio-text-primary',
          'placeholder:text-studio-text-muted',
          'focus:outline-none focus:ring-2 focus:ring-studio-primary/20',
          'focus:border-studio-primary',
          'transition-all'
        )}
      />
    </div>
  );
};

export const FilterSidebar: React.FC<FilterSidebarProps> = ({image.png
  tags,
  selectedTags,
  onTagToggle,
  searchValue,
  onSearchChange,
  workflowStats,
}) => {
  return (
    <aside className="w-[280px] h-full bg-white border-r border-gray-200 p-5 space-y-5">
      <StudioSearchBar value={searchValue} onChange={onSearchChange} />

      <div className="space-y-3">
        <div className="border border-gray-200 flex items-stretch overflow-hidden">
          <div className="flex-1 bg-white p-3 flex flex-col items-center">
            <h3 className="text-sm font-medium text-gray-900 mb-2">총 서비스</h3>
            <div className="text-3xl font-bold text-gray-900">{workflowStats.total}</div>
          </div>

          <div className="w-px bg-gray-300" />

          <div className="flex-1 bg-green-100 p-3 flex flex-col items-center">
            <h3 className="text-sm font-medium text-gray-900 mb-2">배포된 서비스</h3>
            <div className="text-3xl font-bold text-gray-900">{workflowStats.deployed}</div>
          </div>
        </div>
      </div>

      <div className="px-3">
        <div className="border-t border-gray-200" />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <TagIcon className="h-4 w-4 text-gray-700" />
          <h3 className="text-sm font-semibold text-gray-700">태그 필터</h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? 'default' : 'secondary'}
              className={cn(
                'text-xs cursor-pointer transition-colors',
                selectedTags.includes(tag)
                  ? 'bg-gray-900 text-white hover:bg-gray-800 border-transparent'
                  : 'hover:bg-gray-300'
              )}
              onClick={() => onTagToggle(tag)}
            >
              <TagIcon className="h-3 w-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </aside>
  );
};
