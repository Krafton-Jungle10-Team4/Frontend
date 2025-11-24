import { useState } from 'react';
import { Search, Tag as TagIcon, ChevronDown } from 'lucide-react';
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

  const getTagButtonLabel = () => {
    if (selectedTags.length === 0) return '모든 태그';
    return `태그 (${selectedTags.length})`;
  };

  const filteredTags = tags.filter(tag =>
    tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center gap-3 justify-between flex-wrap">
        {/* 정렬 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="gap-1.5 h-10 px-3 text-sm font-medium text-gray-700 bg-white/80 border border-white/70 rounded-xl shadow-[0_10px_30px_rgba(55,53,195,0.08)] hover:border-[#3735c3] hover:text-[#3735c3] hover:shadow-[0_16px_40px_rgba(55,53,195,0.14)] focus-visible:ring-2 focus-visible:ring-[#3735c3] focus-visible:ring-offset-0 backdrop-blur"
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
                    className="w-full h-9 pl-8 pr-3 text-xs bg-white/80 border border-white/70 rounded-lg text-gray-700 placeholder:text-gray-500 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#3735c3]/30 focus:border-[#3735c3] transition"
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

          {/* 검색 바 */}
          <div className="relative w-72 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3735c3]" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="지식 검색..."
              className="w-full h-10 pl-10 pr-4 text-sm bg-white/80 border border-white/70 rounded-xl text-gray-700 placeholder:text-gray-400 shadow-[0_10px_30px_rgba(55,53,195,0.06)] backdrop-blur transition focus:border-[#3735c3] focus:ring-2 focus:ring-[#3735c3]/30 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
