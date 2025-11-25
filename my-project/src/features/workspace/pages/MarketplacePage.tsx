import { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { MarketplaceSearchBar } from '@/features/marketplace/components/MarketplaceSearchBar';
import { MarketplaceGrid } from '@/features/marketplace/components/MarketplaceGrid';
import { MarketplaceItemCard } from '@/features/marketplace/components/MarketplaceItemCard';
import {
  getMarketplaceItems,
  type MarketplaceItem,
  type MarketplaceSortOption,
} from '@/features/marketplace/api/marketplaceApi';
import { useUIStore } from '@shared/stores/uiStore';
import { cn } from '@/shared/components/utils';

type CategoryFilter = 'all' | 'popular' | 'recent';

const categoryFilters: { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: '모두' },
  { id: 'popular', label: '인기' },
  { id: 'recent', label: '최신' },
];

export function MarketplacePage() {
  const language = useUIStore(state => state.language);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<MarketplaceSortOption>('latest');
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  // keep track of the latest fetch to ignore stale responses
  const fetchRequestId = useRef(0);

  // 인기 템플릿 (다운로드 TOP 3)
  const popularItems = useMemo(() => {
    return [...items]
      .sort((a, b) => (b.download_count ?? 0) - (a.download_count ?? 0))
      .slice(0, 3);
  }, [items]);

  // 필터링된 아이템 (인기 템플릿 제외)
  const filteredItems = useMemo(() => {
    const popularIds = new Set(popularItems.map((item) => item.id));
    let result = items.filter((item) => !popularIds.has(item.id));

    // 태그 필터링
    if (selectedTags.length > 0) {
      result = result.filter((item) =>
        selectedTags.some((tag) => item.tags?.includes(tag))
      );
    }

    if (categoryFilter === 'popular') {
      result = [...result].sort((a, b) => (b.download_count ?? 0) - (a.download_count ?? 0));
    } else if (categoryFilter === 'recent') {
      result = [...result].sort((a, b) =>
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      );
    }

    return result;
  }, [items, popularItems, categoryFilter, selectedTags]);

  const handleSortChange = (value: MarketplaceSortOption) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // 마켓플레이스 아이템 불러오기
  useEffect(() => {
    let isActive = true;
    const requestId = fetchRequestId.current + 1;
    fetchRequestId.current = requestId;

    const fetchItems = async () => {
      try {
        setIsLoading(true);
        const response = await getMarketplaceItems({
          page: currentPage,
          page_size: 20,
          search: searchQuery || undefined,
          tags: selectedTags.length > 0 ? selectedTags.join(',') : undefined,
          sort_by: sortBy,
        });
        if (!isActive || requestId !== fetchRequestId.current) return;

        setItems(response.items);
        setTotalPages(response.total_pages);

        // 태그 추출
        setAllTags((prev) => {
          const tagSet = new Set(prev);
          response.items.forEach(item => {
            item.tags?.forEach(tag => tagSet.add(tag));
          });
          return Array.from(tagSet);
        });
      } catch (error) {
        console.error('마켓플레이스 아이템 로드 실패:', error);
      } finally {
        if (isActive && requestId === fetchRequestId.current) {
          setIsLoading(false);
        }
      }
    };

    void fetchItems();

    return () => {
      isActive = false;
    };
  }, [searchQuery, selectedTags, sortBy, currentPage]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => {
      // multi-select: toggle tag on/off
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      }
      return [...prev, tag];
    });
    setCurrentPage(1);
  };

  return (
    <div className="px-20 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <span>Home</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900">Marketplace</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl mb-2">Marketplace</h1>
        <p className="text-gray-600 text-sm">커뮤니티 템플릿을 둘러보고 적용하세요.</p>
      </div>

      {/* 인기 템플릿 섹션 */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">인기 템플릿</h2>
          <span className="text-xs text-gray-500">TOP 3</span>
        </div>
        {isLoading ? (
          <div className="flex h-32 items-center justify-center text-sm text-gray-600">로딩 중...</div>
        ) : popularItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularItems.map((item, idx) => (
              <MarketplaceItemCard key={item.id} item={item} rank={idx + 1} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">표시할 인기 템플릿이 없습니다.</p>
        )}
      </section>

      {/* Filters + Search */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {categoryFilters.map((f) => (
            <button
              key={f.id}
              onClick={() => setCategoryFilter(f.id)}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm transition-colors',
                categoryFilter === f.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <MarketplaceSearchBar
          searchValue={searchQuery}
          onSearchChange={handleSearchChange}
          tags={allTags}
          selectedTags={selectedTags}
          onTagToggle={handleTagToggle}
          sortBy={sortBy}
          onSortChange={handleSortChange}
        />
      </div>

      {/* Marketplace Grid */}
      <MarketplaceGrid
        items={filteredItems}
        loading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        language={language}
        enableRanking={false}
      />
    </div>
  );
}
