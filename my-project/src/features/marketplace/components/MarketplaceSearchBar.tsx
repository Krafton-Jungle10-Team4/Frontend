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

type SortOption = 'latest' | 'popular' | 'views';

interface MarketplaceSearchBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  tags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  sortBy: SortOption;
  onSortChange: (sortBy: SortOption) => void;
}

const SORT_OPTIONS: Record<SortOption, string> = {
  latest: '최근 등록순',
  popular: '다운로드 순',
  views: '조회수 순',
};

export function MarketplaceSearchBar({
  searchValue,
  onSearchChange,
  tags,
  selectedTags,
  onTagToggle,
  sortBy,
  onSortChange,
}: MarketplaceSearchBarProps) {
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
      <div className="flex items-center gap-2 justify-between">
        {/* 정렬 드롭다운 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-1.5 h-8 px-2.5 text-xs text-gray-700 bg-gray-200 hover:bg-gray-300 hover:text-gray-900">
              <span>{SORT_OPTIONS[sortBy]}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuRadioGroup value={sortBy} onValueChange={(val) => onSortChange(val as SortOption)}>
              <DropdownMenuRadioItem value="latest">최근 등록순</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="popular">다운로드 순</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="views">조회수 순</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-2">
          {/* 태그 필터 드롭다운 */}
          <DropdownMenu onOpenChange={(open) => !open && setTagSearchQuery('')}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-1.5 h-8 px-2.5 text-xs text-gray-700 bg-gray-200 hover:bg-gray-300 hover:text-gray-900">
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
                    className="w-full h-8 pl-8 pr-3 text-xs bg-gray-200 border border-transparent rounded-lg text-gray-700 placeholder:text-gray-500 hover:bg-gray-300 focus:outline-none focus:ring-0 focus:bg-gray-50 focus:border-gray-400"
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
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="서비스 검색..."
              className="w-full h-8 pl-8 pr-3 text-xs bg-gray-200 border border-transparent rounded-lg text-gray-700 placeholder:text-gray-500 hover:bg-gray-300 focus:outline-none focus:ring-0 focus:bg-gray-50 focus:border-gray-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
