import { apiClient } from '@/shared/api/client';
import { API_ENDPOINTS } from '@/shared/constants/apiEndpoints';
import type { UserResponse } from '@/shared/types/api.types';

/**
 * Auth API (SnapAgent)
 * Google OAuth 로그인 및 사용자 인증
 */
export const authApi = {
  /**
   * Google OAuth 로그인 URL 가져오기
   * 프론트엔드에서 이 URL로 리다이렉트하면 Google 로그인 시작
   * @returns Google OAuth 로그인 URL
   */
  getGoogleLoginUrl: (): string => {
    return `${apiClient.defaults.baseURL}${API_ENDPOINTS.AUTH.GOOGLE_LOGIN}`;
  },

  /**
   * 현재 로그인한 사용자 정보 조회
   * @returns UserResponse
   */
  getCurrentUser: async (): Promise<UserResponse> => {
    const { data } = await apiClient.get<UserResponse>(API_ENDPOINTS.AUTH.ME);
    return data;
  },

  /**
   * 로그아웃
   */
  logout: async (): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },
};
