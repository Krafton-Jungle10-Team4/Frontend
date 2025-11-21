import { SearchBar } from '@shared/components/SearchBar';
import { TagBadge } from '@shared/components/TagBadge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/select';

interface KnowledgeSearchBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  tags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  sortBy: 'name' | 'date';
  onSortChange: (sortBy: 'name' | 'date') => void;
}

export function KnowledgeSearchBar({
  searchValue,
  onSearchChange,
  tags,
  selectedTags,
  onTagToggle,
  sortBy,
  onSortChange,
}: KnowledgeSearchBarProps) {
  return (
    <div className="space-y-4">
      {/* 검색 및 정렬 */}
      <div className="flex gap-4 items-center">
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          className="flex-1 max-w-md"
        />

        <Select value={sortBy} onValueChange={(value) => onSortChange(value as 'name' | 'date')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="정렬 기준" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">최근 업데이트순</SelectItem>
            <SelectItem value="name">이름순</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 태그 필터 */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">태그:</span>
          {tags.map((tag) => (
            <TagBadge
              key={tag}
              tag={tag}
              selected={selectedTags.includes(tag)}
              onClick={onTagToggle}
              onRemove={selectedTags.includes(tag) ? onTagToggle : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
