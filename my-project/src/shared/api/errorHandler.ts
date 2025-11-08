import type {
  APIErrorResponse,
  HTTPValidationError,
} from '@/shared/types/api.types';
import { ERROR_MESSAGES } from '@/shared/constants/errorMessages';

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

    // Validation 에러 처리 (422)
    if (
      typeof data.detail === 'object' &&
      Array.isArray((data.detail as any).detail)
    ) {
      const validationError = data.detail as HTTPValidationError;
      const errorMessages = validationError.detail
        .map((err) => `${err.loc.join('.')}: ${err.msg}`)
        .join(', ');

      throw new APIError(status, errorMessages, validationError);
    }

    // 일반 에러 메시지 (다양한 백엔드 응답 형식 지원)
    let message: string;

    // 1. FastAPI 표준 형식: data.detail (문자열)
    if (typeof data.detail === 'string') {
      message = data.detail;
    }
    // 2. 중첩된 message 객체: data.message.message
    else if (
      typeof data.message === 'object' &&
      data.message !== null &&
      typeof (data.message as any).message === 'string'
    ) {
      message = (data.message as any).message;
    }
    // 3. 단순 message 문자열: data.message
    else if (typeof data.message === 'string') {
      message = data.message;
    }
    // 4. 폴백: 알 수 없는 오류
    else {
      message = ERROR_MESSAGES.COMMON.UNKNOWN;
    }

    throw new APIError(status, message, data);
  }

  // 네트워크 에러
  if (error.request) {
    throw new APIError(0, ERROR_MESSAGES.NETWORK.CONNECTION_ERROR, error);
  }

  // 기타 에러
  throw new APIError(
    500,
    error.message || ERROR_MESSAGES.COMMON.UNKNOWN,
    error
  );
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

  return ERROR_MESSAGES.COMMON.UNKNOWN;
};
