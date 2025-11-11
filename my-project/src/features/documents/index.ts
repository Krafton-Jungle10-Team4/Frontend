/**
 * Documents Feature
 * Public API
 */

// Components
export { DocumentList } from './components/DocumentList';

// Legacy Store (Backward Compatibility)
export {
  useDocumentStore,
  selectDocuments,
  selectSelectedDocument,
  selectSearchQuery,
  selectUploadProgress,
  selectIsLoading,
  selectError,
} from './stores/documentStore';

// Async Store (Phase 3)
export { useAsyncDocumentStore } from './stores/documentStore.async';

// Selectors (Phase 3)
export {
  useDocuments,
  useDocument,
  useDocumentsByStatus,
  useIsPolling,
  usePollingCount,
  useFilters,
  usePagination,
  useSelectedDocument,
  useUploadProgress as useAsyncUploadProgress,
  useIsLoading as useAsyncIsLoading,
  useError as useAsyncError,
  useDocumentsArray,
  useCompletedDocuments,
  toLegacyDocument,
} from './stores/selectors';

// Types
export type {
  Document,
  DocumentUploadRequest,
  DocumentUploadResponse,
  DocumentSearchRequest,
  DocumentSearchResponse,
  DocumentWithStatus,
  DocumentStatus,
  AsyncDocumentUploadResponse,
  DocumentStatusResponse,
  DocumentListRequest,
  DocumentListResponse,
} from './types/document.types';

// Type Guards
export {
  isAsyncUploadResponse,
  isValidDocument,
  isProcessing,
  isCompleted,
  isSuccessfullyCompleted,
  isFailed,
} from './types/type-guards';

// API
export {
  documentsApi,
  isDocumentError,
  handleDocumentError,
} from './api/documentsApi';

// Async API 
export { documentsAsyncApi } from './api/documentsApi.async';

// Constants 
export {
  POLLING_CONFIG,
  DOCUMENT_STATUS_CONFIG,
  PAGINATION_CONFIG,
  FILE_CONSTRAINTS,
} from './constants/documentConstants';
