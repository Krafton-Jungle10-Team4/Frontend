/**
 * Store Selectors for Async Document Store
 *
 * This file provides selector functions for accessing document store state.
 * Includes backward compatibility selectors for Workflow Builder integration.
 */

import { useAsyncDocumentStore } from './documentStore.async';
import { DocumentStatus } from '../types/document.types';

// ============================================================================
// Document Selectors
// ============================================================================

/**
 * Get all documents as an array
 */
export const useDocuments = () => {
  return useAsyncDocumentStore((state) => Array.from(state.documents.values()));
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
  return useAsyncDocumentStore((state) =>
    Array.from(state.documents.values()).filter((doc) => doc.status === status)
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
 * @returns Legacy Document[] format
 */
export const useDocumentsArray = () => {
  return useAsyncDocumentStore((state) => {
    // Map<string, DocumentWithStatus> → Legacy Document[] 변환
    return Array.from(state.documents.values()).map((doc) => ({
      id: doc.documentId, // ✅ FIX: documentId → id
      filename: doc.originalFilename, // ✅ FIX: originalFilename → filename
      size: doc.fileSize, // ✅ FIX: fileSize → size
      mimeType: doc.mimeType,
      uploadedAt: doc.createdAt, // ✅ FIX: createdAt → uploadedAt
      metadata: {
        status: doc.status,
        chunkCount: doc.chunkCount,
        fileExtension: doc.fileExtension, // 추가 정보 유지
        ...doc.metadata,
      },
    }));
  });
};

/**
 * 특정 봇의 완료된 문서만 반환 (Workflow용)
 *
 * @param botId - 봇 ID (optional, null 시 빈 배열 반환)
 * @returns 완료된 문서 목록 (레거시 포맷)
 *
 * @note 필드 매핑 (표준 스키마 → 레거시):
 *       - documentId → id
 *       - originalFilename → filename
 *       - fileSize → size
 *       - createdAt → uploadedAt
 *
 * @note TypeScript 타입 안정성:
 *       - botId가 null/undefined인 경우 빈 배열 반환
 *       - React hooks rules 준수 (unconditional invocation)
 */
export const useCompletedDocuments = (botId?: string | null) => {
  return useAsyncDocumentStore((state) => {
    // Guard: botId가 없으면 빈 배열 반환
    if (!botId) return [];

    return Array.from(state.documents.values())
      .filter(
        (doc) => doc.botId === botId && doc.status === DocumentStatus.DONE
      )
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
  });
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
