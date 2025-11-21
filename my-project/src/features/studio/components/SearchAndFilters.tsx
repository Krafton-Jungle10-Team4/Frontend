import { Search, Tag as TagIcon, ChevronDown } from 'lucide-react';
import { Badge } from '@/shared/components/badge';
import { Button } from '@/shared/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu';
import { SortDropdown } from './SortDropdown';
import type { WorkflowStats, SortOption } from '@/shared/types/workflow';

interface SearchAndFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  tags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  stats: WorkflowStats;
}

export function SearchAndFilters({
  searchValue,
  onSearchChange,
  tags,
  selectedTags,
  onTagToggle,
  sortBy,
  onSortChange,
}: SearchAndFiltersProps) {
  const getTagButtonLabel = () => {
    if (selectedTags.length === 0) {
      return '모든 태그';
    }
    return `태그 (${selectedTags.length})`;
  };

  return (
    <div>
      {/* 첫 번째 행: 태그 드롭다운 + 검색 + 정렬 */}
      <div className="flex items-center gap-3 justify-between">
        {/* 정렬 */}
        <SortDropdown value={sortBy} onChange={onSortChange} />

        <div className="flex items-center gap-3">
          {/* 태그 필터 드롭다운 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 h-9">
                <TagIcon className="h-4 w-4" />
                <span>{getTagButtonLabel()}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {tags.length > 0 ? (
                tags.map((tag) => (
                  <DropdownMenuCheckboxItem
                    key={tag}
                    checked={selectedTags.includes(tag)}
                    onCheckedChange={() => onTagToggle(tag)}
                  >
                    {tag}
                  </DropdownMenuCheckboxItem>
                ))
              ) : (
                <div className="px-2 py-1.5 text-sm text-gray-500">태그 없음</div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 검색 바 */}
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="서비스 검색..."
              className="w-full h-9 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
