import { Loader2 } from 'lucide-react';
import { MarketplaceItem } from '@/features/marketplace/api/marketplaceApi';
import { MarketplaceItemCard } from './MarketplaceItemCard';
import type { Language } from '@shared/types';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/components/pagination';

interface MarketplaceGridProps {
  items: MarketplaceItem[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  language?: Language;
  enableRanking?: boolean;
}

export function MarketplaceGrid({
  items,
  loading,
  currentPage,
  totalPages,
  onPageChange,
  language: _language = 'ko',
  enableRanking = true,
}: MarketplaceGridProps) {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">
          마켓플레이스 아이템을 찾을 수 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {(() => {
          if (!enableRanking) {
            return items.map((item) => <MarketplaceItemCard key={item.id} item={item} />);
          }

          const topDownloadIds = [...items]
            .sort((a, b) => (b.download_count ?? 0) - (a.download_count ?? 0))
            .slice(0, 3)
            .map((item) => item.id);

          return items.map((item) => {
            const rankIndex = topDownloadIds.indexOf(item.id);
            const rank = rankIndex === -1 ? undefined : rankIndex + 1;
            return <MarketplaceItemCard key={item.id} item={item} rank={rank} />;
          });
        })()}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => onPageChange(page)}
                    isActive={page === currentPage}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
