import React, { useEffect } from 'react';
import { Card } from '@/shared/components/card';
import { Button } from '@/shared/components/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/components/pagination';
import { useAsyncDocumentStore } from '../../stores/documentStore.async';
import { useDocuments, usePagination } from '../../stores/selectors';
import { DocumentTable } from './DocumentTable';
import { DocumentFilters } from './DocumentFilters';
import { DocumentUploadModal } from './DocumentUploadModal';
import { DocumentStatusCard } from './DocumentStatusCard';
import { ProcessingQueuePanel } from './ProcessingQueuePanel';
import { FileUp, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const DocumentMonitoringPage: React.FC = () => {
  const [uploadModalOpen, setUploadModalOpen] = React.useState(false);
  const documents = useDocuments();
  const pagination = usePagination();
  const {
    fetchDocuments,
    stopAllPolling,
    setPagination,
    retryDocument,
    deleteDocument,
  } = useAsyncDocumentStore();

  // Initial load
  useEffect(() => {
    fetchDocuments();

    return () => {
      stopAllPolling();
    };
  }, [fetchDocuments, stopAllPolling]);

  // Handlers
  const handleRetry = async (documentId: string) => {
    try {
      await retryDocument(documentId);
      toast.success('문서 재처리가 시작되었습니다');
    } catch (error) {
      toast.error('재처리 실패: ' + (error as Error).message);
    }
  };

  const handleDelete = async (documentId: string) => {
    try {
      await deleteDocument(documentId);
      toast.success('문서가 삭제되었습니다');
    } catch (error) {
      toast.error('삭제 실패: ' + (error as Error).message);
    }
  };

  const handleRefresh = async () => {
    try {
      await fetchDocuments();
      toast.success('문서 목록을 새로고침했습니다');
    } catch (error) {
      toast.error('새로고침 실패: ' + (error as Error).message);
    }
  };

  // Pagination
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  const handlePageChange = (page: number) => {
    setPagination({ offset: (page - 1) * pagination.limit });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">문서 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">
            업로드된 문서를 관리하고 처리 상태를 모니터링합니다
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            새로고침
          </Button>
          <Button onClick={() => setUploadModalOpen(true)}>
            <FileUp className="mr-2 h-4 w-4" />
            업로드
          </Button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DocumentStatusCard />
        <ProcessingQueuePanel />
      </div>

      {/* Filters */}
      <Card>
        <DocumentFilters />
      </Card>

      {/* Table */}
      <DocumentTable
        documents={documents}
        onRetry={handleRetry}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            총 {pagination.total}개 문서 (페이지 {currentPage} / {totalPages})
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNum)}
                      isActive={pageNum === currentPage}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={
                    currentPage === totalPages ? 'pointer-events-none opacity-50' : ''
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Upload Modal */}
      <DocumentUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />
    </div>
  );
};
