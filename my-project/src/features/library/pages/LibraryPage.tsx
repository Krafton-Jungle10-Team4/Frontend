import { useEffect } from 'react';
import { useLibraryStore } from '../stores/libraryStore';
import { LibraryFilters } from '../components/LibraryFilters';
import { AgentCard } from '../components/AgentCard';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/components/pagination';
import { Loader2 } from 'lucide-react';

export function LibraryPage() {
  const {
    agents,
    totalCount,
    currentPage,
    totalPages,
    isLoading,
    fetchAgents,
    setFilters,
  } = useLibraryStore();

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handlePageChange = (page: number) => {
    setFilters({ page });
    fetchAgents({ page });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">라이브러리</h1>
        <p className="text-muted-foreground">
          팀에서 게시된 모든 에이전트 버전을 확인하고 가져올 수 있습니다.
        </p>
      </div>

      {/* Filters */}
      <LibraryFilters />

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">로딩 중...</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && agents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            라이브러리에 등록된 에이전트가 없습니다.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            워크플로우를 발행할 때 라이브러리 메타데이터를 입력하면 자동으로 등록됩니다.
          </p>
        </div>
      )}

      {/* Agent Cards Grid */}
      {!isLoading && agents.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={page === currentPage}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}

          {/* Results Info */}
          <div className="text-center text-sm text-muted-foreground mt-4">
            총 {totalCount}개의 에이전트
          </div>
        </>
      )}
    </div>
  );
}
