import { useState, useEffect } from 'react';
import { FilterTabs } from '../components/FilterTabs';
import { SearchBar } from '@shared/components/SearchBar';
import { MarketplaceItemCard } from '@/features/marketplace/components/MarketplaceItemCard';
import { getMarketplaceItems, type MarketplaceItem } from '@/features/marketplace/api/marketplaceApi';
import { useUIStore } from '@shared/stores/uiStore';
import { Loader2 } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/components/pagination';

export function ExplorePage() {
  const language = useUIStore(state => state.language);
  const [category, setCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'rating'>('latest');

  // 마켓플레이스 아이템 불러오기
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true);
        const response = await getMarketplaceItems({
          page: currentPage,
          page_size: 20,
          category: category !== 'all' ? category : undefined,
          search: searchQuery || undefined,
          sort_by: sortBy,
        });
        setItems(response.items);
        setTotalPages(response.total_pages);
      } catch (error) {
        console.error('마켓플레이스 아이템 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [category, searchQuery, currentPage, sortBy]);

  const filterTabs = [
    { id: 'all', label: language === 'ko' ? '전체' : 'All' },
    { id: '챗봇', label: language === 'ko' ? '챗봇' : 'Chatbot' },
    { id: '자동화', label: language === 'ko' ? '자동화' : 'Automation' },
    { id: '분석', label: language === 'ko' ? '분석' : 'Analytics' },
    { id: '기타', label: language === 'ko' ? '기타' : 'Other' },
  ];

  return (
    <div className="flex h-full overflow-hidden bg-muted/30">
      <div className="flex-1 flex flex-col overflow-hidden p-6">
        <div className="flex flex-col flex-1 overflow-hidden rounded-lg bg-background border border-gray-200/60 shadow-sm">
          <div className="p-6 pb-4">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">
                {language === 'ko' ? (
                  <>
                    <span className="text-teal-500">마켓플레이스</span>에서 에이전트 탐색
                  </>
                ) : (
                  <>
                    Explore Agents in <span className="text-teal-500">Marketplace</span>
                  </>
                )}
              </h1>
              <p className="text-muted-foreground">
                {language === 'ko'
                  ? '커뮤니티에서 공유된 에이전트를 검색하고 가져와서 사용하세요.'
                  : 'Search and import agents shared by the community.'}
              </p>
            </div>

            <div className="flex items-center justify-between gap-4">
              <FilterTabs
                tabs={filterTabs}
                activeTab={category}
                onTabChange={setCategory}
              />
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'latest' | 'popular' | 'rating')}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white"
                >
                  <option value="latest">{language === 'ko' ? '최신순' : 'Latest'}</option>
                  <option value="popular">{language === 'ko' ? '인기순' : 'Popular'}</option>
                  <option value="rating">{language === 'ko' ? '평점순' : 'Rating'}</option>
                </select>
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  className="w-48"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {items.map(item => (
                    <MarketplaceItemCard
                      key={item.id}
                      item={item}
                    />
                  ))}
                </div>

                {items.length === 0 && (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">
                      {language === 'ko' ? '마켓플레이스 아이템을 찾을 수 없습니다.' : 'No marketplace items found.'}
                    </p>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={page === currentPage}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
