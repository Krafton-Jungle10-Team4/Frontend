import { Search } from 'lucide-react';
import { cn } from '@/shared/components/utils';

interface FilterSidebarProps {
  tags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  workflowStats: {
    total: number;
    running: number;
    stopped: number;
  };
}

const StudioSearchBar: React.FC<{ value: string; onChange: (value: string) => void }> = ({
  value,
  onChange
}) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="워크플로우 검색..."
        className={cn(
          "w-full pl-10 pr-4 py-2",
          "bg-gray-50 border border-gray-200",
          "rounded-studio text-sm",
          "placeholder:text-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-studio-primary/20",
          "focus:border-studio-primary",
          "transition-all"
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
    <aside className="w-[280px] h-full bg-studio-sidebar-bg border-r border-studio-sidebar-border p-5 space-y-6">
      <StudioSearchBar value={searchValue} onChange={onSearchChange} />

      <div>
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">태그 필터</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagToggle(tag)}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-sharp transition-all border',
                selectedTags.includes(tag)
                  ? 'bg-studio-tag-selected-bg text-studio-tag-selected-text border-transparent'
                  : 'bg-studio-tag-bg text-studio-tag-text border-studio-card-border hover:bg-gray-200',
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">총 워크플로우</h3>
        <div className="bg-gray-50 rounded-studio p-4">
          <div className="text-3xl font-bold text-gray-900">{workflowStats.total}</div>
          <div className="text-xs text-gray-500 mt-1">전체 워크플로우</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 border border-green-200 rounded-studio p-3">
            <div className="text-xs text-green-600 mb-1 font-medium">실행 중</div>
            <div className="text-2xl font-bold text-green-700">{workflowStats.running}</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-studio p-3">
            <div className="text-xs text-gray-600 mb-1 font-medium">중지됨</div>
            <div className="text-2xl font-bold text-gray-700">{workflowStats.stopped}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
