import { useState, useEffect } from 'react';
import { MarketplaceItemCard } from '@/features/marketplace/components/MarketplaceItemCard';
import { getMarketplaceItems, type MarketplaceItem } from '@/features/marketplace/api/marketplaceApi';
import { useUIStore } from '@shared/stores/uiStore';
import { Loader2, Search, Trophy, Sparkles } from 'lucide-react';
import { cn } from '@/shared/components/utils';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/components/pagination';

export function MarketplacePage() {
  const language = useUIStore(state => state.language);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [recommendedItems, setRecommendedItems] = useState<MarketplaceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 추천 에이전트 불러오기 (다운로드 수 많은 상위 3개)
  useEffect(() => {
    const fetchRecommendedItems = async () => {
      try {
        setIsLoadingRecommended(true);
        const response = await getMarketplaceItems({
          page: 1,
          page_size: 3,
          sort_by: 'popular',
        });
        setRecommendedItems(response.items);
      } catch (error) {
        console.error('추천 에이전트 로드 실패:', error);
      } finally {
        setIsLoadingRecommended(false);
      }
    };

    fetchRecommendedItems();
  }, []);

  // 최신 에이전트 불러오기
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true);
        const response = await getMarketplaceItems({
          page: currentPage,
          page_size: 20,
          search: searchQuery || undefined,
          sort_by: 'latest',
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
  }, [searchQuery, currentPage]);

  return (
    <div className="flex h-full overflow-hidden bg-muted/30">
      <div className="flex-1 flex flex-col overflow-hidden p-6">
        <div className="flex flex-col flex-1 overflow-hidden rounded-none bg-background border border-gray-200/60 shadow-sm">
          <div className="p-6 pb-4">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">
                {language === 'ko' ? (
                  <>
                    <span className="text-gray-900">마켓플레이스</span>에서 에이전트 탐색
                  </>
                ) : (
                  <>
                    Browse Agents in <span className="text-gray-900">Marketplace</span>
                  </>
                )}
              </h1>
              <div className="flex items-center justify-between gap-4">
                <p className="text-muted-foreground">
                  {language === 'ko'
                    ? '커뮤니티에서 공유된 에이전트를 검색하고 가져와서 사용하세요.'
                    : 'Search and import agents shared by the community.'}
                </p>
                {/* 검색바 */}
                <div className="relative w-1/3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="에이전트 검색..."
                    className={cn(
                      'w-full pl-10 pr-4 py-2',
                      'bg-white border border-gray-300',
                      'text-sm text-gray-900',
                      'placeholder:text-gray-500',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500/20',
                      'focus:border-blue-500',
                      'transition-all'
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-0">
            {/* 추천 에이전트 섹션 */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h2 className="text-lg font-bold text-gray-900">
                  {language === 'ko' ? '추천 에이전트' : 'Recommended Agents'}
                </h2>
              </div>
              {isLoadingRecommended ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {recommendedItems.map((item, index) => (
                    <MarketplaceItemCard
                      key={item.id}
                      item={item}
                      rank={index + 1}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* 최신 에이전트 섹션 */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-bold text-gray-900">
                  {language === 'ko' ? '최신 에이전트' : 'Latest Agents'}
                </h2>
              </div>
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
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
    </div>
  );
}
