import axios from 'axios';

import { STORAGE_KEYS } from '@constants/storageKeys';
import { ERROR_MESSAGES } from '@constants/errorMessages';

/**
 * Axios 클라이언트 인스턴스
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000, // 10초
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 요청 인터셉터: 토큰 자동 추가
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 응답 인터셉터: 에러 처리
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 네트워크 에러
    if (!error.response) {
      console.error(ERROR_MESSAGES.NETWORK.CONNECTION_ERROR);
      return Promise.reject({
        message: ERROR_MESSAGES.NETWORK.CONNECTION_ERROR,
      });
    }

    // 401 Unauthorized - 토큰 만료 or 인증 실패
    if (error.response.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_INFO);

      // 로그인 페이지가 아닌 경우에만 리다이렉트
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // 500 Server Error
    if (error.response.status >= 500) {
      console.error(ERROR_MESSAGES.NETWORK.SERVER_ERROR);
      return Promise.reject({
        message: ERROR_MESSAGES.NETWORK.SERVER_ERROR,
        statusCode: error.response.status,
      });
    }

    // 기타 에러
    return Promise.reject({
      message: error.response.data?.message || ERROR_MESSAGES.COMMON.UNKNOWN,
      statusCode: error.response.status,
      errors: error.response.data?.errors,
    });
  }
);
