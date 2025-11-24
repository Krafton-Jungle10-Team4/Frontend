import { useState, useEffect } from 'react';
import { MarketplaceSearchBar } from '@/features/marketplace/components/MarketplaceSearchBar';
import { MarketplaceGrid } from '@/features/marketplace/components/MarketplaceGrid';
import {
  getMarketplaceItems,
  type MarketplaceItem,
  type MarketplaceSortOption,
} from '@/features/marketplace/api/marketplaceApi';
import { useUIStore } from '@shared/stores/uiStore';

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
  const activeTagCount = selectedTags.length;

  const handleSortChange = (value: MarketplaceSortOption) => {
    setSortBy(value);
    setCurrentPage(1);
  };

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
    <div className="relative min-h-[calc(100vh-56px)] bg-[#f7f8fa] text-slate-900">
      <main className="relative w-full flex-1 flex-col gap-6 px-5 md:px-8 lg:px-10 py-8">
        <div className="relative w-full px-5 py-6">
          <div className="relative grid gap-6 items-start lg:items-start lg:grid-cols-[1.4fr_1fr]">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-900 tracking-tight">MARKETPLACE</span>
                <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 shadow-sm">
                  {items.length} 템플릿
                </span>
              </div>
              <p className="text-sm text-slate-600">
                커뮤니티 템플릿을 둘러보고 적용하세요.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 self-start w-full">
              <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br from-white via-indigo-50/70 to-white p-2.5 shadow-[0_8px_20px_rgba(55,53,195,0.12)] min-h-[96px] flex flex-col justify-between">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.12),transparent_40%)]" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-500">라이브 템플릿</p>
                    <p className="text-2xl font-bold text-slate-900">{items.length}</p>
                    <p className="text-xs text-slate-500">커뮤니티가 공유한 쇼케이스</p>
                  </div>
                  <div className="flex items-end gap-1 self-end text-indigo-500">
                    {[68, 82, 74, 96, 88].map((v) => (
                      <span
                        key={v}
                        className="inline-block w-2 rounded-full bg-gradient-to-b from-indigo-400 to-indigo-600"
                        style={{ height: `${v * 0.6}px` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/80 p-2.5 shadow-[0_8px_20px_rgba(55,53,195,0.12)] min-h-[96px] flex flex-col justify-between">
                <div className="relative space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-500">태그</p>
                  <p className="text-2xl font-bold text-slate-900">{allTags.length || 0}개</p>
                  <p className="text-xs text-slate-500">필터로 원하는 쇼케이스를 바로 찾기</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative w-full space-y-4">
          <div className="relative px-1 md:px-2 lg:px-3 py-3 md:py-4">
            <MarketplaceSearchBar
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              tags={allTags}
              selectedTags={selectedTags}
              onTagToggle={handleTagToggle}
              sortBy={sortBy}
              onSortChange={handleSortChange}
            />
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-4 md:p-5 shadow-[0_18px_48px_rgba(55,53,195,0.15)] backdrop-blur">
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
