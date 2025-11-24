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
  const activeTagCount = selectedTags.length;

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
    <div className="relative min-h-[calc(100vh-56px)] bg-gradient-to-b from-[#f7f8fa] via-[#eef0f4] to-[#e8eaee] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(124,128,148,0.12),transparent_32%),radial-gradient(circle_at_86%_8%,rgba(152,156,172,0.1),transparent_30%),radial-gradient(circle_at_62%_72%,rgba(118,122,142,0.1),transparent_36%)]" />
      <div className="pointer-events-none absolute -left-24 top-12 h-64 w-64 rounded-full bg-slate-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-12 bottom-12 h-72 w-72 rounded-full bg-slate-300/35 blur-3xl" />
      <main className="relative w-full flex-1 flex-col gap-6 px-5 md:px-8 lg:px-10 py-8">
        <div className="relative w-full px-5 py-6">
          <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden>
            <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />
            <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-100 via-white to-transparent blur-3xl" />
            <div className="absolute -right-6 bottom-4 h-28 w-28 rounded-full bg-gradient-to-br from-sky-100 via-white to-transparent blur-2xl" />
          </div>
          <div className="relative grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-center">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-500 shadow-sm">
                Marketplace
                <span className="h-1 w-1 rounded-full bg-indigo-400" />
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold text-gray-900">마켓플레이스</h1>
                <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 shadow-sm">
                  {items.length} 템플릿
                </span>
              </div>
              <p className="text-sm text-slate-600">
                커뮤니티 템플릿을 둘러보고 적용하세요. 검색과 태그로 원하는 쇼케이스를 빠르게 찾을 수 있습니다.
              </p>
              <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold text-slate-600">
                <span className="inline-flex items-center gap-1 rounded-full border border-white/80 bg-white px-3 py-1 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#3735c3]" />
                  최신순 · 인기순 · 조회순
                </span>
                {activeTagCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-indigo-700 shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                    선택된 태그 {activeTagCount}개
                  </span>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br from-white via-indigo-50/70 to-white p-4 shadow-[0_16px_40px_rgba(55,53,195,0.12)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.12),transparent_40%)]" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-500">Live Templates</p>
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

              <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/80 p-4 shadow-[0_16px_40px_rgba(55,53,195,0.12)]">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-indigo-50/70" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">태그</p>
                    <p className="text-xl font-semibold text-slate-900">{allTags.length || 0}개</p>
                    <p className="text-xs text-slate-500">필터로 원하는 쇼케이스를 바로 찾기</p>
                  </div>
                  <div className="flex -space-x-2">
                    {allTags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex h-8 items-center justify-center rounded-full border border-indigo-100 bg-white px-3 text-[11px] font-semibold text-indigo-600 shadow-sm"
                      >
                        {tag}
                      </span>
                    ))}
                    {allTags.length > 4 && (
                      <span className="inline-flex h-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-3 text-[11px] font-semibold text-slate-700 shadow-sm">
                        +{allTags.length - 4}
                      </span>
                    )}
                  </div>
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
              onSortChange={setSortBy}
            />
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-4 md:p-5 shadow-[0_18px_48px_rgba(55,53,195,0.15)] backdrop-blur">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(168,85,247,0.08),transparent_40%)]" />
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
