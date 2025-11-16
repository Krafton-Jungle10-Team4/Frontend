import axios from 'axios';
import type {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';
import { API_BASE_URL, API_TIMEOUT, API_ENDPOINTS } from '@/shared/constants/apiEndpoints';
import { STORAGE_KEYS } from '@/shared/constants/storageKeys';
import { ERROR_MESSAGES } from '@/shared/constants/errorMessages';
import { handleAPIError } from './errorHandler';

/**
 * JWT Bearer Token 인증용 클라이언트
 * - Access Token: localStorage 저장 (15분 유효)
 * - Refresh Token: httpOnly 쿠키 자동 관리 (7일 유효)
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // httpOnly 쿠키 송수신 필수
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
 * JWT Access Token 자동 삽입
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
    console.log('📤 [Request]', config.method?.toUpperCase(), config.url);
    console.log('📤 [Request] withCredentials:', config.withCredentials);
    console.log('📤 [Request] Has token:', !!token);

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
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
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ============================================
// Response Interceptors - Token Refresh Logic
// ============================================

// 토큰 갱신 상태 관리
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

/**
 * 대기 중인 요청 큐 처리
 */
const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * 로그아웃 처리 (로컬 스토리지 정리 + 리다이렉트)
 */
const handleLogout = () => {
  localStorage.removeItem(STORAGE_KEYS.JWT_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.TEAM);
  localStorage.removeItem(STORAGE_KEYS.API_KEY);

  // 레거시 키 정리
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_INFO);

  // 로그인 페이지로 리다이렉트 (로그인/콜백 페이지 제외)
  if (
    window.location.pathname !== '/login' &&
    window.location.pathname !== '/auth/callback'
  ) {
    console.warn('🚨 Session expired - Redirecting to login');
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  }
};

/**
 * JWT 응답 인터셉터: 자동 토큰 갱신
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('📥 [Response]', response.status, response.config.url);
    console.log('📥 [Response] Set-Cookie:', response.headers['set-cookie'] || 'None');
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // deployment 404 및 cost 404는 정상 상황이므로 에러 로그 생략
    const isExpected404 =
      error.response?.status === 404 &&
      (originalRequest.url?.includes('/deployment') ||
       originalRequest.url?.includes('/cost/usage'));

    if (!isExpected404) {
      console.error('❌ [Response Error]', error.response?.status, error.config?.url);
      console.error('❌ [Error Details]', error.response?.data);
    }

    // 401 에러이고, 재시도하지 않았으며, 인증 관련 엔드포인트가 아닌 경우
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url &&
      !originalRequest.url.includes(API_ENDPOINTS.AUTH.REFRESH) &&
      !originalRequest.url.includes(API_ENDPOINTS.AUTH.LOGIN) &&
      !originalRequest.url.includes(API_ENDPOINTS.AUTH.REGISTER)
    ) {
      // 토큰 갱신 중이면 대기열에 추가
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Refresh Token으로 Access Token 갱신 (httpOnly 쿠키 자동 전송)
        const { data } = await axios.post<{ access_token: string }>(
          `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
          {},
          {
            withCredentials: true,
          }
        );

        const newToken = data.access_token;
        localStorage.setItem(STORAGE_KEYS.JWT_TOKEN, newToken);

        // 대기 중인 요청들 처리
        processQueue(null, newToken);

        // 원래 요청 재시도
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh Token도 만료 → 로그아웃
        processQueue(refreshError as AxiosError, null);
        handleLogout();

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(handleAPIError(error));
  }
);

/**
 * API Key 클라이언트 에러 처리
 */
apiKeyClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error(ERROR_MESSAGES.API_KEY.INVALID);
    }

    return Promise.reject(handleAPIError(error));
  }
);
