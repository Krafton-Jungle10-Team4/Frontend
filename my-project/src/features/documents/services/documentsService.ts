/**
 * Documents Service
 * High-level service layer for document operations with feature flag support
 */

import { documentsAsyncApi } from '../api/documentsApi.async';
import { ApiClient } from '@/shared/utils/api';
import type { AxiosProgressEvent } from 'axios';
import type {
  AsyncDocumentUploadResponse,
  DocumentStatusResponse,
  DocumentListRequest,
  DocumentListResponse,
} from '../types/document.types';

/**
 * Feature flag for async upload
 */
const isAsyncUploadEnabled = (): boolean => {
  return import.meta.env.VITE_ENABLE_ASYNC_UPLOAD === 'true';
};

/**
 * Legacy sync response type (for backward compatibility)
 */
interface LegacySyncUploadResponse {
  document_id: string;
  chunk_count: number;
  processing_time: number;
}

/**
 * Union type for upload responses
 */
export type DocumentUploadResponse =
  | AsyncDocumentUploadResponse
  | LegacySyncUploadResponse;

/**
 * Documents Service API
 */
export const documentsService = {
  /**
   * Upload document (async or sync based on feature flag)
   * @param file File to upload
   * @param botId Bot ID
   * @param onUploadProgress Upload progress callback (optional)
   * @returns Upload response (async or sync)
   */
  uploadDocument: async (
    file: File,
    botId: string,
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
  ): Promise<DocumentUploadResponse> => {
    if (isAsyncUploadEnabled()) {
      // Use async upload API
      return documentsAsyncApi.uploadAsync(file, botId, onUploadProgress);
    } else {
      // Use legacy sync upload API
      return ApiClient.uploadFile(file, botId);
    }
  },

  /**
   * Delete document
   * @param documentId Document ID
   * @param botId Bot ID
   */
  deleteDocument: async (documentId: string, botId: string): Promise<void> => {
    // Always use legacy delete for now (async delete not implemented yet)
    return ApiClient.deleteFile(documentId, botId);
  },

  /**
   * Get document status (async API only)
   * @param documentId Document ID
   * @returns Document status
   */
  getDocumentStatus: async (
    documentId: string
  ): Promise<DocumentStatusResponse> => {
    return documentsAsyncApi.getStatus(documentId);
  },

  /**
   * List documents with status (async API only)
   * @param request List request parameters
   * @returns Document list response
   */
  listDocumentsWithStatus: async (
    request: DocumentListRequest
  ): Promise<DocumentListResponse> => {
    return documentsAsyncApi.listWithStatus(request);
  },

  /**
   * Retry failed document processing (async API only)
   * @param documentId Document ID
   * @returns Async upload response
   */
  retryDocument: async (
    documentId: string
  ): Promise<AsyncDocumentUploadResponse> => {
    return documentsAsyncApi.retry(documentId);
  },

  /**
   * Get batch document status (async API only)
   * @param documentIds Document IDs
   * @returns Document status array
   */
  getBatchDocumentStatus: async (
    documentIds: string[]
  ): Promise<DocumentStatusResponse[]> => {
    return documentsAsyncApi.getBatchStatus(documentIds);
  },
};
