import { useState, useEffect, useCallback } from 'react';

import type { User, AuthState } from '@/types/auth';
import { googleLogin, logout as logoutApi, getCurrentUser } from '@api/authApi';
import { STORAGE_KEYS } from '@constants/storageKeys';

/**
 * 인증 관련 커스텀 훅
 */
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  /**
   * 로컬 스토리지에서 사용자 정보 복원
   */
  useEffect(() => {
    const restoreAuth = async () => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const userInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO);

        if (token && userInfo) {
          const user: User = JSON.parse(userInfo);

          // 토큰이 유효한지 백엔드에 확인 (선택사항)
          try {
            const currentUser = await getCurrentUser();
            setAuthState({
              user: currentUser,
              accessToken: token,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch {
            // 토큰이 만료되었거나 유효하지 않으면 로컬 스토리지 정리
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER_INFO);

            setAuthState({
              user: null,
              accessToken: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } else {
          setAuthState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Failed to restore auth state:', error);
        setAuthState({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    restoreAuth();
  }, []);

  /**
   * 구글 로그인 처리
   */
  const handleGoogleLogin = useCallback(async (idToken: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      const response = await googleLogin(idToken);

      setAuthState({
        user: response.user,
        accessToken: response.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });

      return response;
    } catch (error) {
      setAuthState({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
      throw error;
    }
  }, []);

  /**
   * 로그아웃 처리
   */
  const handleLogout = useCallback(async () => {
    try {
      await logoutApi();

      setAuthState({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Logout failed:', error);
      // 로그아웃 실패해도 로컬 상태는 정리
      setAuthState({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
      throw error;
    }
  }, []);

  return {
    user: authState.user,
    accessToken: authState.accessToken,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    login: handleGoogleLogin,
    logout: handleLogout,
  };
};
