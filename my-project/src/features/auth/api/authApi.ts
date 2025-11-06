import { apiClient } from '@/shared/api/client';
import { API_BASE_URL,API_ENDPOINTS } from '@/shared/constants/apiEndpoints';
import { STORAGE_KEYS } from '@/shared/constants/storageKeys';
import type { UserResponse } from '@/shared/types/api.types';
import type { LoginRequest, RegisterRequest, TokenResponse } from '../types/auth.types';
/**
 * Auth API (SnapAgent)
 *
 * 인증 방식:
 * 1. Access Token (15분): localStorage 저장, API 요청 시 사용
 * 2. Refresh Token (7일): httpOnly 쿠키로 자동 관리 (XSS 방어)
 *
 * 토큰 갱신:
 * - Access Token 만료 시 axios interceptor가 자동으로 /refresh 호출
 * - Refresh Token은 httpOnly 쿠키로 자동 전송
 */
export const authApi = {
  /**
   * Google OAuth 로그인 시작
   * 백엔드에서 자체적으로 redirect_uri를 관리하므로 프론트엔드에서는 별도로 전달하지 않음
   */
  redirectToGoogleLogin: (): void => {
    const loginUrl = `${API_BASE_URL}${API_ENDPOINTS.AUTH.GOOGLE_LOGIN}`;
    window.location.href = loginUrl;
  },

  /**
   * Google OAuth callback 처리
   * @param callbackUrl callback URL (쿼리 파라미터 포함)
   * @returns Access Token 또는 null
   */
  handleAuthCallback: (callbackUrl: string = window.location.href): string | null => {
    console.log('🔍 [OAuth Callback] Processing:', callbackUrl);

    const url = new URL(callbackUrl);
    const token = url.searchParams.get('token');
    const error = url.searchParams.get('error');

    if (error) {
      console.error('❌ [OAuth Callback] Error:', error);
      return null;
    }

    if (token) {
      console.log('✅ [OAuth Callback] Token received');
      localStorage.setItem(STORAGE_KEYS.JWT_TOKEN, token);
      return token;
    }

    console.warn('⚠️ [OAuth Callback] No token found');
    return null;
  },

  /**
   * 일반 로그인 (이메일/비밀번호)
   * @param credentials 로그인 정보
   * @returns TokenResponse
   */
  login: async (credentials: LoginRequest): Promise<TokenResponse> => {
    console.log('🔐 [Login] Starting login request...');
    console.log('🔐 [Login] API URL:', `${apiClient.defaults.baseURL}${API_ENDPOINTS.AUTH.LOGIN}`);
    console.log('🔐 [Login] Credentials:', { email: credentials.email, password: '***' });

    const { data } = await apiClient.post<TokenResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    console.log('✅ [Login] Success! Access token received');
    console.log('🍪 [Login] Refresh token should be in httpOnly cookie');

    // Access Token 저장 (Refresh Token은 httpOnly 쿠키로 자동 저장됨)
    localStorage.setItem(STORAGE_KEYS.JWT_TOKEN, data.access_token);

    return data;
  },

  /**
   * 회원가입
   * @param userInfo 회원가입 정보
   * @returns TokenResponse
   */
  register: async (userInfo: RegisterRequest): Promise<TokenResponse> => {
    const { data } = await apiClient.post<TokenResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      userInfo
    );

    // Access Token 저장 (Refresh Token은 httpOnly 쿠키로 자동 저장됨)
    localStorage.setItem(STORAGE_KEYS.JWT_TOKEN, data.access_token);

    return data;
  },

  /**
   * 현재 로그인한 사용자 정보 조회
   * @returns UserResponse
   */
  getCurrentUser: async (): Promise<UserResponse> => {
    const { data } = await apiClient.get<UserResponse>(API_ENDPOINTS.AUTH.ME);

    // 사용자 정보 캐싱
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data));

    return data;
  },

  /**
   * 로그아웃
   * - 서버에서 Refresh Token 무효화
   * - httpOnly 쿠키 삭제
   * - 로컬 스토리지 정리
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      // 에러가 발생해도 로컬 정리는 실행
      localStorage.removeItem(STORAGE_KEYS.JWT_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.TEAM);
      localStorage.removeItem(STORAGE_KEYS.API_KEY);

      // 레거시 키 정리
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    }
  },

  /**
   * Access Token 갱신
   * (주의: 일반적으로 axios interceptor가 자동으로 처리하므로 직접 호출할 필요 없음)
   * @returns TokenResponse
   */
  refreshToken: async (): Promise<TokenResponse> => {
    const { data } = await apiClient.post<TokenResponse>(
      API_ENDPOINTS.AUTH.REFRESH,
      {}
    );

    // 새로운 Access Token 저장
    localStorage.setItem(STORAGE_KEYS.JWT_TOKEN, data.access_token);

    return data;
  },

  /**
   * 토큰 유효성 확인
   * @returns Access Token 존재 여부
   */
  hasValidToken: (): boolean => {
    return !!localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
  },
};
