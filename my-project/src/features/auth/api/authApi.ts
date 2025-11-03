import { apiClient } from '@/shared/api/client';
import { API_ENDPOINTS } from '@/shared/constants/apiEndpoints';
import { STORAGE_KEYS } from '@/shared/constants/storageKeys';
import type { UserResponse } from '@/shared/types/api.types';

/**
 * Auth API (SnapAgent)
 * Google OAuth 로그인 및 사용자 인증
 *
 * OAuth 흐름:
 * 1. redirectToGoogleLogin() → Google 로그인 페이지로 이동
 * 2. Google 인증 완료 → 백엔드 /callback으로 리다이렉트
 * 3. 백엔드가 JWT 토큰을 쿼리 파라미터로 전달
 * 4. handleAuthCallback() → 토큰 저장
 * 5. getCurrentUser() → 사용자 정보 조회
 */
export const authApi = {
  /**
   * Google OAuth 로그인 페이지로 리다이렉트
   * @param redirectUri 인증 완료 후 돌아올 프론트엔드 URL
   */
  redirectToGoogleLogin: (redirectUri?: string): void => {
    const loginUrl = `${apiClient.defaults.baseURL}${API_ENDPOINTS.AUTH.GOOGLE_LOGIN}`;
    const url = redirectUri
      ? `${loginUrl}?redirect_uri=${encodeURIComponent(redirectUri)}`
      : loginUrl;
    window.location.href = url;
  },

  /**
   * OAuth callback 처리 (쿼리 파라미터에서 토큰 추출 및 저장)
   * @param callbackUrl callback URL (쿼리 파라미터 포함)
   * @returns JWT 토큰 (성공 시) 또는 null (실패 시)
   */
  handleAuthCallback: (
    callbackUrl: string = window.location.href
  ): string | null => {
    const url = new URL(callbackUrl);
    const token = url.searchParams.get('token');
    const error = url.searchParams.get('error');

    if (error) {
      console.error('OAuth callback error:', error);
      return null;
    }

    if (token) {
      localStorage.setItem(STORAGE_KEYS.JWT_TOKEN, token);
      return token;
    }

    return null;
  },

  /**
   * 현재 로그인한 사용자 정보 조회
   * @returns UserResponse
   */
  getCurrentUser: async (): Promise<UserResponse> => {
    const { data } = await apiClient.get<UserResponse>(API_ENDPOINTS.AUTH.ME);

    // 사용자 정보를 localStorage에 저장
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data));

    return data;
  },

  /**
   * 로그아웃 (서버 세션 무효화 + 로컬 스토리지 정리)
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      // 에러가 발생해도 로컬 스토리지는 정리
      localStorage.removeItem(STORAGE_KEYS.JWT_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.TEAM);
      localStorage.removeItem(STORAGE_KEYS.API_KEY);

      // 레거시 키도 정리 (호환성)
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    }
  },

  /**
   * 토큰 유효성 확인 (localStorage에 JWT 토큰이 있는지)
   */
  hasValidToken: (): boolean => {
    return !!localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
  },
};
