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
    <div className="relative min-h-[calc(100vh-56px)] bg-gradient-to-b from-white via-slate-50 to-indigo-50/35 text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(99,102,241,0.16),transparent_32%),radial-gradient(circle_at_80%_0,rgba(14,165,233,0.12),transparent_30%),radial-gradient(circle_at_60%_70%,rgba(168,85,247,0.14),transparent_36%)]" />
      <main className="relative w-full flex-1 flex-col gap-5 px-4 md:px-8 py-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between px-2">
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-500">Marketplace</span>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold text-gray-900">마켓플레이스 커뮤니티</h1>
              <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 shadow-sm">
                {items.length} 템플릿
              </span>
            </div>
            <p className="text-sm text-slate-600">커뮤니티 템플릿을 둘러보고 적용하세요. 검색과 태그로 원하는 쇼케이스를 빠르게 찾을 수 있습니다.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/70 bg-white/85 p-4 md:p-5 shadow-[0_14px_40px_rgba(55,53,195,0.12)] backdrop-blur">
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

        <div className="rounded-2xl border border-white/70 bg-white/85 p-4 md:p-5 shadow-[0_14px_40px_rgba(55,53,195,0.12)] backdrop-blur">
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
