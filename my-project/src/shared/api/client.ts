import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '@/shared/constants/apiEndpoints';
import { STORAGE_KEYS } from '@/shared/constants/storageKeys';
import { ERROR_MESSAGES } from '@/shared/constants/errorMessages';
import { handleAPIError } from './errorHandler';

/**
 * JWT Bearer Token 인증용 클라이언트
 * 사용: User 관련 엔드포인트, Team 관리
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * API Key 인증용 클라이언트
 * 사용: Documents, Chat 엔드포인트
 */
export const apiKeyClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// Request Interceptors
// ============================================

/**
 * JWT 토큰 자동 삽입
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * API Key 자동 삽입
 */
apiKeyClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const apiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
    if (apiKey && config.headers) {
      config.headers['X-API-Key'] = apiKey;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// Response Interceptors
// ============================================

/**
 * JWT 클라이언트 에러 처리
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401: 인증 실패 -> 로그인 페이지로 리다이렉트
    if (error.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.JWT_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(handleAPIError(error));
  }
);

/**
 * API Key 클라이언트 에러 처리
 */
apiKeyClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // API Key 관련 에러 처리
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error(ERROR_MESSAGES.API_KEY.INVALID);
      // TODO: API Key 재설정 UI로 안내
    }

    return Promise.reject(handleAPIError(error));
  }
);
