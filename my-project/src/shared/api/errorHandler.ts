import type { APIErrorResponse, HTTPValidationError } from '@/shared/types/api.types';

/**
 * 커스텀 API 에러 클래스
 */
export class APIError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Axios 에러를 파싱하여 APIError로 변환
 */
export const handleAPIError = (error: any): never => {
  if (error.response) {
    const { status, data } = error.response as {
      status: number;
      data: APIErrorResponse;
    };

    // Validation 에러 처리
    if (typeof data.detail === 'object' && Array.isArray((data.detail as any).detail)) {
      const validationError = data.detail as HTTPValidationError;
      const errorMessages = validationError.detail
        .map((err) => `${err.loc.join('.')}: ${err.msg}`)
        .join(', ');

      throw new APIError(status, errorMessages, validationError);
    }

    // 일반 에러 메시지
    const message = typeof data.detail === 'string' ? data.detail : 'An error occurred';

    throw new APIError(status, message, data);
  }

  // 네트워크 에러
  if (error.request) {
    throw new APIError(0, 'Network error: Unable to reach server', error);
  }

  // 기타 에러
  throw new APIError(500, error.message || 'Unknown error occurred', error);
};

/**
 * 에러 메시지 추출 유틸리티
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof APIError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
};
