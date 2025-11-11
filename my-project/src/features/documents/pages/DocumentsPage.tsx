/**
 * Documents Page
 *
 * Main page for document management that switches between
 * the new monitoring dashboard and legacy document list based on feature flag
 * 
 * NOTE: This file is now only used for backward compatibility.
 * The routing logic has moved to routes.tsx for proper code-splitting.
 */

import React, { useEffect, useState } from 'react';
import { useAsyncDocumentStore } from '../stores/documentStore.async';
import { useDocumentsArray } from '../stores/selectors';
import { useBotStore, selectSelectedBotId } from '@/features/bot/stores/botStore';
import { DocumentList } from '../components/DocumentList';
import { DocumentUploadModal } from '../components/monitoring/DocumentUploadModal';
import { Button } from '@/shared/components/button';
import { FileUp, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Legacy Documents View
 * Fully functional legacy UI with data fetching, upload, and delete capabilities
 */
export const LegacyDocumentsView: React.FC = () => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const documents = useDocumentsArray(); // Convert DocumentWithStatus → legacy Document format
  const { fetchDocuments, deleteDocument } = useAsyncDocumentStore();
  const selectedBotId = useBotStore(selectSelectedBotId);

  // Fetch documents on mount and when bot changes
  useEffect(() => {
    if (selectedBotId) {
      fetchDocuments({ botId: selectedBotId });
    }
  }, [selectedBotId, fetchDocuments]);

  // Delete handler
  const handleDelete = async (documentId: string) => {
    if (!selectedBotId) {
      toast.error('봇을 먼저 선택해주세요');
      return;
    }

    try {
      await deleteDocument(documentId, selectedBotId);
      toast.success('문서가 삭제되었습니다');
    } catch (error) {
      toast.error('삭제 실패: ' + (error as Error).message);
    }
  };

  // Refresh handler
  const handleRefresh = async () => {
    if (!selectedBotId) {
      toast.error('봇을 먼저 선택해주세요');
      return;
    }

    try {
      await fetchDocuments({ botId: selectedBotId });
      toast.success('문서 목록을 새로고침했습니다');
    } catch (error) {
      toast.error('새로고침 실패: ' + (error as Error).message);
    }
  };

  return (
    <div className="space-y-4 p-6">
      {/* Header with Upload and Refresh buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">문서 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">
            업로드된 문서를 관리합니다
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={!selectedBotId}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            새로고침
          </Button>
          <Button
            onClick={() => setUploadModalOpen(true)}
            disabled={!selectedBotId}
          >
            <FileUp className="mr-2 h-4 w-4" />
            업로드
          </Button>
        </div>
      </div>

      {/* Document List */}
      {!selectedBotId ? (
        <div className="flex items-center justify-center h-32 text-sm text-gray-400">
          봇을 먼저 선택해주세요
        </div>
      ) : (
        <DocumentList documents={documents} onDelete={handleDelete} />
      )}

      {/* Upload Modal */}
      <DocumentUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />
    </div>
  );
};

/**
 * @deprecated This component is kept for backward compatibility only.
 * The routing logic has moved to routes.tsx for proper code-splitting.
 * Please import LegacyDocumentsView directly instead.
 */
export const DocumentsPage = LegacyDocumentsView;
