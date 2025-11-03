import { apiKeyClient } from '@/shared/api/client';
import { API_ENDPOINTS } from '@/shared/constants/apiEndpoints';
import type {
  DocumentUploadResponse,
  DocumentInfo,
  SearchRequest,
  SearchResponse,
} from '@/shared/types/api.types';

/**
 * Documents API (SnapAgent)
 * 문서 업로드, 검색, 삭제 (RAG 처리)
 *
 * ⚠️ 주의: API Key 인증 필요 (apiKeyClient 사용)
 */
export const documentsApi = {
  /**
   * 문서 업로드
   * @param file 업로드할 파일
   * @param onUploadProgress 업로드 진행률 콜백 (선택)
   * @returns DocumentUploadResponse
   */
  uploadDocument: async (
    file: File,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<DocumentUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiKeyClient.post<DocumentUploadResponse>(
      API_ENDPOINTS.DOCUMENTS.UPLOAD,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      }
    );
    return data;
  },

  /**
   * 문서 검색 (RAG similarity search)
   * @param request 검색 요청
   * @returns SearchResponse
   */
  searchDocuments: async (request: SearchRequest): Promise<SearchResponse> => {
    const { data } = await apiKeyClient.get<SearchResponse>(
      API_ENDPOINTS.DOCUMENTS.SEARCH,
      {
        params: request,
      }
    );
    return data;
  },

  /**
   * 문서 정보 조회
   * @param documentId 문서 ID
   * @returns DocumentInfo
   */
  getDocument: async (documentId: string): Promise<DocumentInfo> => {
    const { data } = await apiKeyClient.get<DocumentInfo>(
      API_ENDPOINTS.DOCUMENTS.BY_ID(documentId)
    );
    return data;
  },

  /**
   * 문서 삭제
   * @param documentId 문서 ID
   */
  deleteDocument: async (documentId: string): Promise<void> => {
    await apiKeyClient.delete(API_ENDPOINTS.DOCUMENTS.BY_ID(documentId));
  },
};

/**
 * Helper: 에러가 Document 관련 에러인지 확인
 */
export const isDocumentError = (error: unknown): error is Error => {
  return error instanceof Error;
};

/**
 * Helper: Document 에러 처리
 */
export const handleDocumentError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected document error occurred';
};
