import { apiClient } from '@/shared/api/client';
import { API_ENDPOINTS } from '@/shared/constants/apiEndpoints';
import { STORAGE_KEYS } from '@/shared/constants/storageKeys';

import type {
  AuthResponse,
  GoogleLoginDto,
  LogoutResponse,
  User,
} from '../types/auth.types';

/**
 * 구글 로그인
 * @param idToken 구글 ID Token
 * @returns 인증 응답 (백엔드 JWT + 사용자 정보)
 */
export const googleLogin = async (
  idToken: string
): Promise<AuthResponse> => {
  const payload: GoogleLoginDto = { idToken };

  const response = await apiClient.post<AuthResponse>(
    API_ENDPOINTS.AUTH.GOOGLE_LOGIN,
    payload
  );

  // 토큰 및 사용자 정보 저장
  if (response.data.accessToken) {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.accessToken);
  }
  if (response.data.refreshToken) {
    localStorage.setItem(
      STORAGE_KEYS.REFRESH_TOKEN,
      response.data.refreshToken
    );
  }
  if (response.data.user) {
    localStorage.setItem(
      STORAGE_KEYS.USER_INFO,
      JSON.stringify(response.data.user)
    );
  }

  return response.data;
};

/**
 * 로그아웃
 */
export const logout = async (): Promise<LogoutResponse> => {
  try {
    const response = await apiClient.post<LogoutResponse>(
      API_ENDPOINTS.AUTH.LOGOUT
    );

    // 로컬 스토리지 정리
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);

    return response.data;
  } catch (error) {
    // 에러가 발생해도 로컬 스토리지는 정리
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    throw error;
  }
};

/**
 * 현재 로그인한 사용자 정보 조회
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
  return response.data;
};

/**
 * 토큰 갱신
 */
export const refreshToken = async (): Promise<AuthResponse> => {
  const refreshTokenValue = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

  const response = await apiClient.post<AuthResponse>(
    API_ENDPOINTS.AUTH.REFRESH,
    { refreshToken: refreshTokenValue }
  );

  // 새 토큰 저장
  if (response.data.accessToken) {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.accessToken);
  }

  return response.data;
};
