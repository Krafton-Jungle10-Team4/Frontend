/**
 * Documents API Integration Layer
 */

import { documentsApi } from './documentsApi';
import { documentsAsyncApi } from './documentsApi.async';
import type {
  DocumentUploadResponse,
  AsyncDocumentUploadResponse,
} from '../types/document.types';

/**
 * Feature Flag 확인
 * @returns true if async upload is enabled
 */
const useAsyncAPI = (): boolean => {
  return import.meta.env.VITE_ENABLE_ASYNC_UPLOAD === 'true';
};

/**
 * 통합 문서 서비스
 * Feature flag에 따라 동기/비동기 API 자동 선택
 */
export const documentsService = {
  /**
   * 문서 업로드
   * Feature flag에 따라 sync/async 자동 선택
   * @param file 업로드할 파일
   * @param botId 봇 ID
   * @param onUploadProgress 업로드 진행률 콜백 (선택)
   * @returns DocumentUploadResponse | AsyncDocumentUploadResponse
   */
  upload: async (
    file: File,
    botId: string,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<DocumentUploadResponse | AsyncDocumentUploadResponse> => {
    if (useAsyncAPI()) {
      return documentsAsyncApi.uploadAsync(file, botId, onUploadProgress);
    }
    return documentsApi.uploadDocument(file, botId, onUploadProgress);
  },

  /**
   * 문서 삭제
   * @param documentId 문서 ID
   * @param botId 봇 ID
   */
  delete: async (documentId: string, botId: string): Promise<void> => {
    return documentsApi.deleteDocument(documentId, botId);
  },

  /**
   * 문서 검색
   * @param query 검색 쿼리
   * @param botId 봇 ID
   * @param topK 반환할 상위 K개 결과 (선택)
   */
  search: async (query: string, botId: string, topK?: number) => {
    return documentsApi.searchDocuments({ query, top_k: topK }, botId);
  },

  /**
   * 문서 정보 조회
   * @param documentId 문서 ID
   * @param botId 봇 ID
   */
  get: async (documentId: string, botId: string) => {
    return documentsApi.getDocument(documentId, botId);
  },
};

// Export all APIs for direct access
export { documentsApi } from './documentsApi';
export { documentsAsyncApi } from './documentsApi.async';
