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
      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 via-white to-indigo-50/40">
        <div className="mx-auto max-w-7xl px-6 pt-10 pb-12 space-y-8">
          {/* 페이지 헤더 + 검색 */}
          <div className="rounded-3xl border border-white/70 bg-white/80 backdrop-blur-xl shadow-[0_18px_60px_rgba(55,53,195,0.12)] px-6 py-6 lg:px-8 lg:py-7">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3735c3]">Templates</p>
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">마켓플레이스</h1>
                <p className="text-gray-600 mt-2">
                  다양한 워크플로우를 탐색하고 나만의 프로젝트에 활용하세요.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 bg-indigo-50/60 border border-indigo-100 px-4 py-2 rounded-full shadow-sm">
                <span className="h-2 w-2 rounded-full bg-[#3735c3] shadow-[0_0_0_4px_rgba(55,53,195,0.12)]" />
                새 템플릿이 지속적으로 추가되고 있어요
              </div>
            </div>

            {/* 검색/필터 영역 */}
            <div className="mt-6">
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
          </div>

          {/* 그리드 영역 */}
          <div className="rounded-3xl border border-white/70 bg-white/80 backdrop-blur-xl shadow-[0_18px_60px_rgba(55,53,195,0.1)] px-4 py-5 lg:px-6 lg:py-6">
            <MarketplaceGrid
              items={items}
              loading={isLoading}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              language={language}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
