import { apiClient } from '@/shared/api/client';
import { API_ENDPOINTS } from '@/shared/constants/apiEndpoints';
import type { AxiosProgressEvent } from 'axios';
import type {
  AsyncDocumentUploadResponse,
  DocumentStatusResponse,
  DocumentListRequest,
  DocumentListResponse,
} from '../types/document.types';

/**
 * 비동기 문서 처리 API
 */
export const documentsAsyncApi = {
  /**
   * 비동기 문서 업로드
   * @param file 업로드할 파일
   * @param botId 봇 ID
   * @param onUploadProgress 업로드 진행률 콜백 (선택)
   * @returns 즉시 응답 (< 2초)
   */
  uploadAsync: async (
    file: File,
    botId: string,
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
  ): Promise<AsyncDocumentUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.post<AsyncDocumentUploadResponse>(
      API_ENDPOINTS.DOCUMENTS.UPLOAD,
      formData,
      {
        params: { bot_id: botId },
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress,
      }
    );

    return data;
  },

  /**
   * 문서 상태 조회
   * @param documentId 문서 ID
   * @returns DocumentStatusResponse
   */
  getStatus: async (documentId: string): Promise<DocumentStatusResponse> => {
    const { data } = await apiClient.get<DocumentStatusResponse>(
      API_ENDPOINTS.DOCUMENTS.STATUS(documentId)
    );
    return data;
  },

  /**
   * 문서 목록 조회 (상태 포함)
   * @param request 목록 조회 요청 파라미터
   * @returns DocumentListResponse
   */
  listWithStatus: async (
    request: DocumentListRequest
  ): Promise<DocumentListResponse> => {
    const { data } = await apiClient.get<DocumentListResponse>(
      API_ENDPOINTS.DOCUMENTS.LIST,
      { params: request }
    );
    return data;
  },

  /**
   * 실패한 문서 재처리
   * @param documentId 문서 ID
   * @returns AsyncDocumentUploadResponse
   */
  retry: async (documentId: string): Promise<AsyncDocumentUploadResponse> => {
    const { data } = await apiClient.post<AsyncDocumentUploadResponse>(
      API_ENDPOINTS.DOCUMENTS.RETRY(documentId)
    );
    return data;
  },

  /**
   * 여러 문서 상태 일괄 조회
   * @param documentIds 문서 ID 배열
   * @returns DocumentStatusResponse[]
   */
  getBatchStatus: async (
    documentIds: string[]
  ): Promise<DocumentStatusResponse[]> => {
    const promises = documentIds.map((id) => documentsAsyncApi.getStatus(id));
    return Promise.all(promises);
  },
};
