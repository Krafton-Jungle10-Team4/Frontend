import { useState } from 'react';
import { useLibraryStore } from '../stores/libraryStore';
import { Input } from '@/shared/components/input';
import { Button } from '@/shared/components/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/select';
import { Badge } from '@/shared/components/badge';
import { Search, X } from 'lucide-react';

const CATEGORIES = [
  { value: 'all', label: '전체 카테고리' },
  { value: 'RAG', label: 'RAG' },
  { value: 'LLM', label: 'LLM' },
  { value: 'Agent', label: 'Agent' },
  { value: 'Custom', label: 'Custom' },
];

const VISIBILITY_OPTIONS = [
  { value: 'all', label: '전체 공개 범위' },
  { value: 'private', label: '비공개' },
  // 팀 공개는 현재 백엔드에서 지원하지 않음
  { value: 'public', label: '공개' },
];

export function LibraryFilters() {
  const { filters, setFilters, fetchAgents, resetFilters } = useLibraryStore();
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [tagInput, setTagInput] = useState('');

  const handleSearch = () => {
    setFilters({ search: searchInput, page: 1 });
    fetchAgents({ search: searchInput, page: 1 });
  };

  const handleCategoryChange = (category: string) => {
    const actualCategory = category === 'all' ? undefined : category;
    setFilters({ category: actualCategory, page: 1 });
    fetchAgents({ category: actualCategory, page: 1 });
  };

  const handleVisibilityChange = (visibility: string) => {
    const actualVisibility = visibility === 'all' ? undefined : visibility;
    setFilters({ visibility: actualVisibility, page: 1 });
    fetchAgents({ visibility: actualVisibility, page: 1 });
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const currentTags = filters.tags || [];
    const newTags = [...currentTags, tagInput.trim()];
    setFilters({ tags: newTags, page: 1 });
    fetchAgents({ tags: newTags, page: 1 });
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.filter((t) => t !== tag);
    setFilters({ tags: newTags.length > 0 ? newTags : undefined, page: 1 });
    fetchAgents({ tags: newTags.length > 0 ? newTags : undefined, page: 1 });
  };

  const handleReset = () => {
    resetFilters();
    setSearchInput('');
    setTagInput('');
    fetchAgents();
  };

  return (
    <div className="bg-card border rounded-lg p-4 mb-6 space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <Input
          placeholder="서비스 이름 또는 설명으로 검색..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button onClick={handleSearch} size="icon">
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Category */}
        <Select value={filters.category || 'all'} onValueChange={handleCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="카테고리 선택" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Visibility */}
        <Select value={filters.visibility || 'all'} onValueChange={handleVisibilityChange}>
          <SelectTrigger>
            <SelectValue placeholder="공개 범위 선택" />
          </SelectTrigger>
          <SelectContent>
            {VISIBILITY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Tag Input */}
        <div className="flex gap-2">
          <Input
            placeholder="태그 입력"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
          />
          <Button onClick={handleAddTag} variant="outline">
            추가
          </Button>
        </div>
      </div>

      {/* Active Tags */}
      {filters.tags && filters.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <X
                className="w-3 h-3 cursor-pointer hover:text-destructive"
                onClick={() => handleRemoveTag(tag)}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Reset Button */}
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={handleReset}>
          필터 초기화
        </Button>
      </div>
    </div>
  );
}
