/**
 * TopActions Component
 * 검색, 태그 필터, 뷰 모드 전환 등 상단 액션 영역
 */

import { RiGridLine, RiListUnordered } from '@remixicon/react';
import { SearchBar } from '@/shared/components/SearchBar';
import { Button } from '@/shared/components/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu';
import { RiFilterLine } from '@remixicon/react';
import { cn } from '@/shared/components/utils';

export type ViewMode = 'grid' | 'list';

interface TopActionsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  availableTags: string[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  showOnlyMine?: boolean;
  onShowOnlyMineChange?: (value: boolean) => void;
  className?: string;
}

export function TopActions({
  searchQuery,
  onSearchChange,
  selectedTags,
  onTagsChange,
  availableTags,
  viewMode,
  onViewModeChange,
  showOnlyMine = false,
  onShowOnlyMineChange,
  className,
}: TopActionsProps) {
  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* 내가 만든 앱 보기 토글 */}
      {onShowOnlyMineChange && (
        <Button
          variant={showOnlyMine ? 'default' : 'outline'}
          size="sm"
          onClick={() => onShowOnlyMineChange(!showOnlyMine)}
          className="flex items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md"
        >
          <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
          내가 만든 앱
        </Button>
      )}

      {/* 태그 필터 드롭다운 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md">
            <RiFilterLine className="h-4 w-4 transition-colors duration-200" />
            태그
            {selectedTags.length > 0 && (
              <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {selectedTags.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {availableTags.length === 0 ? (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              사용 가능한 태그가 없습니다
            </div>
          ) : (
            availableTags.map((tag) => (
              <DropdownMenuCheckboxItem
                key={tag}
                checked={selectedTags.includes(tag)}
                onCheckedChange={() => handleTagToggle(tag)}
              >
                {tag}
              </DropdownMenuCheckboxItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 검색바 */}
      <SearchBar
        value={searchQuery}
        onChange={onSearchChange}
        placeholder=""
        className="flex-1"
      />

      {/* 뷰 모드 전환 */}
      <div className="flex items-center gap-1 rounded-md border border-border p-1">
        <Button
          variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('grid')}
          className="h-8 w-8 p-0 transition-all duration-200 hover:scale-110 active:scale-90"
        >
          <RiGridLine className="h-4 w-4 transition-colors duration-200" />
        </Button>
        <Button
          variant={viewMode === 'list' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('list')}
          className="h-8 w-8 p-0 transition-all duration-200 hover:scale-110 active:scale-90"
        >
          <RiListUnordered className="h-4 w-4 transition-colors duration-200" />
        </Button>
      </div>
    </div>
  );
}
