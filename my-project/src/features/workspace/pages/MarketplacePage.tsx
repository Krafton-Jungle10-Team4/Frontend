import { useState, useEffect } from 'react';
import { MarketplaceSearchBar } from '@/features/marketplace/components/MarketplaceSearchBar';
import { MarketplaceGrid } from '@/features/marketplace/components/MarketplaceGrid';
import { getMarketplaceItems, type MarketplaceItem } from '@/features/marketplace/api/marketplaceApi';
import { useUIStore } from '@shared/stores/uiStore';

type SortOption = 'latest' | 'popular' | 'views';

export function MarketplacePage() {
  const language = useUIStore(state => state.language);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 마켓플레이스 아이템 불러오기
  useEffect(() => {
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
        setItems(response.items);
        setTotalPages(response.total_pages);

        // 태그 추출
        const tagSet = new Set<string>();
        response.items.forEach(item => {
          item.tags?.forEach(tag => tagSet.add(tag));
        });
        setAllTags(Array.from(tagSet));
      } catch (error) {
        console.error('마켓플레이스 아이템 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchItems();
  }, [searchQuery, selectedTags, sortBy, currentPage]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      <main className="flex-1 overflow-y-auto bg-gray-100">
        <div className="px-10 pt-8 pb-6">
          {/* 검색/필터 영역 */}
          <div className="mb-6">
            <MarketplaceSearchBar
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              tags={allTags}
              selectedTags={selectedTags}
              onTagToggle={handleTagToggle}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </div>

          {/* 그리드 영역 */}
          <MarketplaceGrid
            items={items}
            loading={isLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            language={language}
          />
        </div>
      </main>
    </div>
  );
}
