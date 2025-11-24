import { useState } from 'react';
import { Search, Tag as TagIcon, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { Button } from '@shared/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@shared/components/dropdown-menu';

interface KnowledgeSearchBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  tags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  sortBy: 'name' | 'date';
  onSortChange: (sortBy: 'name' | 'date') => void;
}

const SORT_OPTIONS: Record<'name' | 'date', string> = {
  date: '최근 업데이트순',
  name: '이름순',
};

export function KnowledgeSearchBar({
  searchValue,
  onSearchChange,
  tags,
  selectedTags,
  onTagToggle,
  sortBy,
  onSortChange,
}: KnowledgeSearchBarProps) {
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const getTagButtonLabel = () => {
    if (selectedTags.length === 0) return '모든 태그';
    return `태그 (${selectedTags.length})`;
  };

  const filteredTags = tags.filter(tag =>
    tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="지식 검색..."
            className="w-full h-11 rounded-xl border border-slate-200 bg-white px-10 pr-4 text-sm text-gray-800 placeholder:text-slate-500 shadow-[0_6px_18px_rgba(55,53,195,0.08)] focus:border-indigo-400 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-[0_6px_18px_rgba(55,53,195,0.08)] transition hover:border-indigo-300 hover:text-indigo-700"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            필터 · 정렬
            <ChevronDown className={`h-3 w-3 transition ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] text-slate-600">
            정렬 {SORT_OPTIONS[sortBy]}
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] text-slate-600">
            태그 {selectedTags.length > 0 ? `${selectedTags.length}개` : '전체'}
          </span>
        </div>
      </div>

      {showFilters && (
        <div className="rounded-xl border border-slate-100 bg-white/90 p-3 shadow-[0_10px_30px_rgba(55,53,195,0.08)]">
          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="gap-1.5 h-10 px-3 text-sm font-medium text-gray-700 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-300 hover:text-indigo-700"
                >
                  <span>{SORT_OPTIONS[sortBy]}</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuRadioGroup value={sortBy} onValueChange={(val) => onSortChange(val as 'name' | 'date')}>
                  <DropdownMenuRadioItem value="date">최근 업데이트순</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="name">이름순</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu onOpenChange={(open) => !open && setTagSearchQuery('')}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="gap-1.5 h-10 px-3 text-sm font-medium text-gray-700 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-300 hover:text-indigo-700"
                >
                  <TagIcon className="h-3.5 w-3.5" />
                  <span>{getTagButtonLabel()}</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {/* 태그 검색 */}
                <div className="px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                    <input
                      type="text"
                      value={tagSearchQuery}
                      onChange={(e) => setTagSearchQuery(e.target.value)}
                      placeholder="태그 검색..."
                      className="w-full h-9 pl-8 pr-3 text-xs bg-white border border-slate-200 rounded-lg text-gray-700 placeholder:text-gray-500 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#3735c3]/20 focus:border-[#3735c3] transition"
                    />
                  </div>
                </div>
                <DropdownMenuSeparator />
                {/* 태그 목록 */}
                {filteredTags.length > 0 ? (
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
                  <div className="px-2 py-1.5 text-xs text-gray-500">검색 결과가 없습니다</div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </div>
  );
}
