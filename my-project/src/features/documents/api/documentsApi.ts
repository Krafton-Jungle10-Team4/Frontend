/**
 * Documents API Client
 * 문서 관련 API 호출 함수들
 */

import { API_BASE_URL } from '@/shared/utils/constants';
import type {
  Document,
  DocumentUploadResponse,
  DocumentSearchResponse,
} from '../types/document.types';

const DOCUMENTS_BASE = `${API_BASE_URL}/api/v1/documents`;

/**
 * 문서 업로드
 * @param file 업로드할 파일
 * @returns 업로드된 문서 정보
 */
export const documentsApi = {
  /**
   * 문서 업로드
   */
  async upload(file: File): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${DOCUMENTS_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Upload failed: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * 문서 검색
   */
  async search(query: string, limit: number = 20): Promise<DocumentSearchResponse> {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
    });

    const response = await fetch(`${DOCUMENTS_BASE}/search?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Search failed: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * 문서 정보 조회
   */
  async getDocument(documentId: string): Promise<Document> {
    const response = await fetch(`${DOCUMENTS_BASE}/${documentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Document not found');
      }
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Get document failed: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * 문서 삭제
   */
  async deleteDocument(documentId: string): Promise<{ success: boolean }> {
    const response = await fetch(`${DOCUMENTS_BASE}/${documentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Document not found');
      }
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Delete document failed: ${response.statusText}`);
    }

    return { success: true };
  },
};

// Helper functions for error handling
export const isDocumentError = (error: any): boolean => {
  return error.message?.includes('Document') || error.message?.includes('document');
};

export const handleDocumentError = (error: any) => {
  console.error('Document API Error:', error);

  // User-friendly error messages
  if (error.message?.includes('not found')) {
    return '문서를 찾을 수 없습니다.';
  }
  if (error.message?.includes('Upload failed')) {
    return '문서 업로드에 실패했습니다. 파일 크기와 형식을 확인해주세요.';
  }
  if (error.message?.includes('Search failed')) {
    return '문서 검색에 실패했습니다. 잠시 후 다시 시도해주세요.';
  }

  return '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
};
