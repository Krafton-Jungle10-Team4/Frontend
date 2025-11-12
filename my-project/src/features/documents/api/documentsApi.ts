import { apiClient, apiKeyClient } from '@/shared/api/client';
import { API_ENDPOINTS } from '@/shared/constants/apiEndpoints';
import type {
  DocumentUploadResponse,
  DocumentInfo,
  SearchRequest,
  SearchResponse,
} from '@/shared/types/api.types';
import { validateFile } from '@/shared/utils/fileValidation';

/**
 * Documents API (SnapAgent)
 * 문서 업로드, 검색, 삭제 (RAG 처리)
 */
export const documentsApi = {
  /**
   * 문서 업로드 (비동기)
   *
   * 인증: JWT Bearer Token (로그인 필수)
   * 엔드포인트: POST /api/v1/documents/upload-async
   * Content-Type: multipart/form-data
   *
   * 비동기 처리: 파일이 S3에 업로드되고 SQS 메시지 큐에 추가됩니다.
   * 실제 임베딩 처리는 백그라운드 워커가 수행하며, job_id로 상태를 추적할 수 있습니다.
   *
   * 파일 제약사항:
   * - 최대 크기: 10MB
   * - 허용 확장자: PDF, TXT, DOCX
   * - 빈 파일 업로드 불가
   *
   * @param file 업로드할 파일
   * @param botId 봇 ID (필수, 형식: bot_{timestamp}_{random})
   * @param onUploadProgress 업로드 진행률 콜백 (선택)
   * @returns DocumentUploadResponse (job_id, status, message, estimated_time 포함)
   * @throws Error 파일 유효성 검증 실패 또는 업로드 오류
   */
  uploadDocument: async (
    file: File,
    botId: string,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<DocumentUploadResponse> => {
    // 1. 파일 유효성 검증
    const validation = validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // 2. FormData 생성
    const formData = new FormData();
    formData.append('file', file);

    // 3. JWT 인증으로 업로드 (apiClient 사용)
    const { data } = await apiClient.post<DocumentUploadResponse>(
      API_ENDPOINTS.DOCUMENTS.UPLOAD,
      formData,
      {
        params: {
          bot_id: botId,
        },
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
   * @param botId 봇 ID (필수)
   * @returns SearchResponse
   */
  searchDocuments: async (
    request: SearchRequest,
    botId: string
  ): Promise<SearchResponse> => {
    const { data } = await apiKeyClient.get<SearchResponse>(
      API_ENDPOINTS.DOCUMENTS.SEARCH,
      {
        params: {
          ...request,
          bot_id: botId,
        },
      }
    );
    return data;
  },

  /**
   * 문서 정보 조회
   * @param documentId 문서 ID
   * @param botId 봇 ID (필수)
   * @returns DocumentInfo
   */
  getDocument: async (
    documentId: string,
    botId: string
  ): Promise<DocumentInfo> => {
    const { data } = await apiKeyClient.get<DocumentInfo>(
      API_ENDPOINTS.DOCUMENTS.BY_ID(documentId),
      {
        params: {
          bot_id: botId,
        },
      }
    );
    return data;
  },

  /**
   * 문서 삭제
   * 
   * 인증: JWT Bearer Token (관리 작업은 JWT 인증 필수)
   * 
   * @param documentId 문서 ID
   * @param botId 봇 ID (필수)
   */
  deleteDocument: async (documentId: string, botId: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.DOCUMENTS.BY_ID(documentId), {
      params: {
        bot_id: botId,
      },
    });
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
