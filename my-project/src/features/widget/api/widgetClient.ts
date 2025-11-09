import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL } from '@shared/constants/apiEndpoints';

/**
 * Widget 전용 API 클라이언트
 *
 * 중요:
 * - withCredentials: false (인증 쿠키 전송 금지)
 * - JWT 자동 첨부 금지
 * - CORS allow_credentials: false 환경에서만 사용
 */
export const widgetClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  // 절대 true로 변경 금지 - 외부 임베딩에서 CORS 실패
  withCredentials: false,
});

// 에러 응답 인터셉터 (선택적)
widgetClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[Widget Client Error]', error);
    return Promise.reject(error);
  }
);
