import { useState } from 'react';
import { Search, Tag as TagIcon, X, Clock } from 'lucide-react';
import { Badge } from '@shared/components/badge';
import { cn } from '@shared/components/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from '@shared/components/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@shared/components/tooltip';

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
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const getTagButtonLabel = () => {
    if (selectedTags.length === 0) return '모든 태그';
    return `태그 (${selectedTags.length})`;
  };

  const getNextSort = (current: 'name' | 'date'): 'name' | 'date' =>
    current === 'date' ? 'name' : 'date';

  const filteredTags = tags.filter(tag =>
    tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
  );

  const hasSelectedTags = selectedTags.length > 0;
  const hasSearchValue = searchValue.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 justify-end">
        <div className="flex items-center gap-1">
          <div className="relative flex items-center">
            <div
              className={cn(
                'flex items-center overflow-hidden transition-all duration-300 ease-out',
                isSearchExpanded ? 'w-72' : 'w-9'
              )}
            >
              {isSearchExpanded ? (
                <div className="relative w-full">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onBlur={() => {
                      if (!searchValue) {
                        setIsSearchExpanded(false);
                      }
                    }}
                    placeholder="지식 검색..."
                    className="w-full h-9 pl-8 pr-9 text-xs bg-gray-200 border border-transparent rounded-lg text-gray-700 placeholder:text-gray-500 hover:bg-gray-300 focus:outline-none focus:ring-0 focus:bg-gray-50 focus:border-gray-400"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      onSearchChange('');
                      setIsSearchExpanded(false);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="검색 초기화"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setIsSearchExpanded(true)}
                        className={cn(
                          'flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
                          hasSearchValue
                            ? 'text-gray-700'
                            : 'text-gray-400 hover:text-gray-500'
                        )}
                        aria-label="검색"
                      >
                        <Search className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>검색</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>

          <TooltipProvider delayDuration={300}>
            <DropdownMenu onOpenChange={(open) => !open && setTagSearchQuery('')}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        'flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
                        hasSelectedTags
                          ? 'text-gray-700 bg-white border border-slate-200 shadow-sm'
                          : 'text-gray-400 hover:text-gray-500'
                      )}
                      aria-label={getTagButtonLabel()}
                    >
                      <TagIcon className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{getTagButtonLabel()}</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                    <input
                      type="text"
                      value={tagSearchQuery}
                      onChange={(e) => setTagSearchQuery(e.target.value)}
                      placeholder="태그 검색..."
                      className="w-full h-8 pl-8 pr-3 text-xs bg-gray-200 border border-transparent rounded-lg text-gray-700 placeholder:text-gray-500 hover:bg-gray-300 focus:outline-none focus:ring-0 focus:bg-gray-50 focus:border-gray-400"
                      autoFocus
                    />
                  </div>
                </div>
                <DropdownMenuSeparator />
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
          </TooltipProvider>

          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  aria-label={`정렬: ${SORT_OPTIONS[sortBy]}`}
                  onClick={() => onSortChange(getNextSort(sortBy))}
                  className="flex items-center justify-center w-9 h-9 rounded-lg transition-colors text-gray-700 hover:text-gray-900"
                >
                  <Clock className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{SORT_OPTIONS[sortBy]}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

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
