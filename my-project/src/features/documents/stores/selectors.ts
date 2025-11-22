/**
 * Store Selectors for Async Document Store
 *
 * This file provides selector functions for accessing document store state.
 * Includes backward compatibility selectors for Workflow Builder integration.
 */

import { useAsyncDocumentStore } from './documentStore.async';
import { DocumentStatus } from '../types/document.types';
import { useMemo } from 'react';

// ============================================================================
// Document Selectors
// ============================================================================

/**
 * Get all documents as an array
 */
export const useDocuments = () => {
  const documentsMap = useAsyncDocumentStore((state) => state.documents);
  return useMemo(() => Array.from(documentsMap.values()), [documentsMap]);
};

/**
 * Get a single document by ID
 * @param documentId - Document ID
 */
export const useDocument = (documentId: string) => {
  return useAsyncDocumentStore((state) => state.documents.get(documentId));
};

/**
 * Get documents filtered by status
 * @param status - Document status to filter by
 */
export const useDocumentsByStatus = (status: DocumentStatus) => {
  const documentsMap = useAsyncDocumentStore((state) => state.documents);
  return useMemo(
    () =>
      Array.from(documentsMap.values()).filter(
        (doc) => doc.status === status
      ),
    [documentsMap, status]
  );
};

// ============================================================================
// Polling Selectors
// ============================================================================

/**
 * Check if a document is currently being polled
 * @param documentId - Document ID
 */
export const useIsPolling = (documentId: string) => {
  return useAsyncDocumentStore((state) => state.pollingStates.has(documentId));
};

/**
 * Get the total number of documents currently being polled
 */
export const usePollingCount = () => {
  return useAsyncDocumentStore((state) => state.pollingStates.size);
};

// ============================================================================
// Filter & Pagination Selectors
// ============================================================================

/**
 * Get current filters
 */
export const useFilters = () => {
  return useAsyncDocumentStore((state) => state.filters);
};

/**
 * Get current pagination state
 */
export const usePagination = () => {
  return useAsyncDocumentStore((state) => state.pagination);
};

// ============================================================================
// UI Selectors
// ============================================================================

/**
 * Get the currently selected document
 */
export const useSelectedDocument = () => {
  const selectedId = useAsyncDocumentStore((state) => state.selectedDocumentId);
  const document = useAsyncDocumentStore((state) =>
    selectedId ? state.documents.get(selectedId) : null
  );
  return document;
};

/**
 * Get upload progress (0-100)
 */
export const useUploadProgress = () => {
  return useAsyncDocumentStore((state) => state.uploadProgress);
};

/**
 * Check if store is currently loading
 */
export const useIsLoading = () => {
  return useAsyncDocumentStore((state) => state.isLoading);
};

/**
 * Get current error state
 */
export const useError = () => {
  return useAsyncDocumentStore((state) => state.error);
};

// ============================================================================
// Backward Compatibility Selectors (Workflow Builder)
// ============================================================================

/**
 * 하위 호환성을 위한 배열 셀렉터 (Workflow Builder용)
 * @deprecated 기존 레거시 Document 인터페이스와의 호환성 제공
 *
 * @note 레거시 필드 매핑:
 *       - documentId → id
 *       - originalFilename → filename
 *       - fileSize → size
 *       - createdAt → uploadedAt
 *
 * @note 🔧 FIX: Memoization added to prevent infinite re-renders
 *       Derived array is created via useMemo after subscribing to documents Map
 *
 * @returns Legacy Document[] format
 */
export const useDocumentsArray = () => {
  const documentsMap = useAsyncDocumentStore((state) => state.documents);

  return useMemo(
    () => Array.from(documentsMap.values()).map((doc) => toLegacyDocument(doc)),
    [documentsMap]
  );
};

/**
 * 완료된 문서 목록 반환 (Workflow용)
 *
 * @param botId - 봇 ID (선택). 생략 시 사용자 전체 문서 포함.
 * @returns 완료된 문서 목록 (레거시 포맷)
 *
 * @note 필드 매핑 (표준 스키마 → 레거시):
 *       - documentId → id
 *       - originalFilename → filename
 *       - fileSize → size
 *       - createdAt → uploadedAt
 *
 * @note TypeScript 타입 안정성:
 *       - botId가 null/undefined인 경우 전체 문서에서 status=done만 반환
 *       - React hooks rules 준수 (unconditional invocation)
 *
 * @note 🔧 FIX: Memoization added to prevent infinite re-renders
 *       Derived array is created via useMemo after subscribing to documents Map
 */
export const useCompletedDocuments = (botId?: string | null) => {
  const documentsMap = useAsyncDocumentStore((state) => state.documents);

  return useMemo(() => {
    const completedDocuments = Array.from(documentsMap.values()).filter(
      (doc) => doc.status === DocumentStatus.DONE
    );

    const filteredDocuments = botId
      ? completedDocuments.filter((doc) => doc.botId === botId)
      : completedDocuments;

    return filteredDocuments
      .map((doc) => ({
        id: doc.documentId, // ✅ FIX: documentId → id
        filename: doc.originalFilename, // ✅ FIX: originalFilename → filename
        size: doc.fileSize, // ✅ FIX: fileSize → size
        mimeType: doc.mimeType,
        uploadedAt: doc.createdAt, // ✅ FIX: createdAt → uploadedAt
        metadata: {
          chunkCount: doc.chunkCount,
          fileExtension: doc.fileExtension,
        },
      }));
  }, [documentsMap, botId]);
};

/**
 * Helper: Convert DocumentWithStatus to Legacy Document format
 *
 * @param doc - DocumentWithStatus
 * @returns Legacy Document format
 */
export const toLegacyDocument = (doc: ReturnType<typeof useDocuments>[0]) => ({
  id: doc.documentId,
  filename: doc.originalFilename,
  size: doc.fileSize,
  mimeType: doc.mimeType,
  uploadedAt: doc.createdAt,
  metadata: {
    status: doc.status,
    chunkCount: doc.chunkCount,
    fileExtension: doc.fileExtension,
    ...doc.metadata,
  },
});
