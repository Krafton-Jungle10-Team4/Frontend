import { useState } from 'react';
import { Search, Tag as TagIcon, ChevronDown, X } from 'lucide-react';
import { Badge } from '@/shared/components/badge';
import { Button } from '@/shared/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
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
  stats,
}: SearchAndFiltersProps) {
  const [tagSearchQuery, setTagSearchQuery] = useState('');

  const getTagButtonLabel = () => {
    if (selectedTags.length === 0) {
      return '모든 태그';
    }
    return `태그 (${selectedTags.length})`;
  };

  const filteredTags = tags.filter(tag =>
    tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* 첫 번째 행: 정렬 + 태그 드롭다운 + 검색 */}
      <div className="flex items-center gap-3 justify-between flex-wrap">
        {/* 정렬 (왼쪽) */}
        <SortDropdown value={sortBy} onChange={onSortChange} />

        <div className="flex items-center gap-2">
          {/* 태그 필터 드롭다운 */}
          <DropdownMenu onOpenChange={(open) => !open && setTagSearchQuery('')}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="gap-1.5 h-10 px-3 text-sm font-medium text-gray-700 bg-white/80 border border-white/70 rounded-xl shadow-[0_10px_30px_rgba(55,53,195,0.08)] hover:border-[#3735c3] hover:text-[#3735c3] hover:shadow-[0_16px_40px_rgba(55,53,195,0.14)] focus-visible:ring-2 focus-visible:ring-[#3735c3] focus-visible:ring-offset-0 backdrop-blur"
              >
                <TagIcon className="h-3.5 w-3.5" />
                <span>{getTagButtonLabel()}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {/* 태그 검색 */}
              <div className="px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                  <input
                    type="text"
                    value={tagSearchQuery}
                    onChange={(e) => setTagSearchQuery(e.target.value)}
                    placeholder="태그 검색..."
                    className="w-full h-9 pl-8 pr-3 text-xs bg-white/80 border border-white/70 rounded-lg text-gray-700 placeholder:text-gray-500 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#3735c3]/30 focus:border-[#3735c3] transition"
                    autoFocus
                  />
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* 태그 목록 - 최대 10개까지 보이고 스크롤 */}
              <div className="max-h-[320px] overflow-y-auto">
                {tags.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-gray-500">태그 없음</div>
                ) : filteredTags.length > 0 ? (
                  filteredTags.map((tag) => (
                    <DropdownMenuCheckboxItem
                      key={tag}
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={() => onTagToggle(tag)}
                    >
                      {tag}
                    </DropdownMenuCheckboxItem>
                  ))
                ) : (
                  <div className="px-2 py-1.5 text-sm text-gray-500">검색 결과 없음</div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 검색 바 */}
          <div className="relative w-72 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3735c3]" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="서비스 검색..."
              className="w-full h-10 pl-10 pr-4 text-sm bg-white/80 border border-white/70 rounded-xl text-gray-700 placeholder:text-gray-400 shadow-[0_10px_30px_rgba(55,53,195,0.06)] backdrop-blur transition focus:border-[#3735c3] focus:ring-2 focus:ring-[#3735c3]/30 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-gray-600">
        <span className="inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50/70 px-2.5 py-1 text-[#3735c3]">
          활성 {stats.running}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-blue-700">
          배포 {stats.deployed}
        </span>
      </div>

      {/* 두 번째 행: 선택된 태그 표시 */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="group flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer transition-colors"
              onClick={() => onTagToggle(tag)}
            >
              <span>{tag}</span>
              <X className="h-3 w-3 opacity-70 group-hover:opacity-100 transition-opacity" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
