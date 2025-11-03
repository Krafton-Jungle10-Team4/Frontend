/**
 * Documents Feature
 * Public API
 */

// Components
export { DocumentList } from './components/DocumentList';

// Store
export {
  useDocumentStore,
  selectDocuments,
  selectSelectedDocument,
  selectSearchQuery,
  selectUploadProgress,
  selectIsLoading,
  selectError,
} from './stores/documentStore';

// Types
export type {
  Document,
  DocumentUploadRequest,
  DocumentUploadResponse,
  DocumentSearchRequest,
  DocumentSearchResponse,
} from './types/document.types';

// API
export {
  documentsApi,
  isDocumentError,
  handleDocumentError,
} from './api/documentsApi';
