/**
 * Auth Store (SnapAgent OAuth)
 * 인증 상태 관리 (Zustand)
 *
 * OAuth 사용 흐름:
 * 1. redirectToGoogleLogin() 호출 → Google 로그인 페이지로 이동
 * 2. OAuth callback URL로 리다이렉트 (토큰 포함)
 * 3. handleAuthCallback() 호출 → 토큰 추출 및 저장
 * 4. 사용자 정보 자동 조회
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/shared/constants/storageKeys';

import type { AuthState, User } from '../types/auth.types';
import { mapUserResponseToUser } from '../types/auth.types';
import { authApi } from '../api/authApi';

interface AuthStore extends AuthState {
  error: string | null;

  // Actions
  redirectToGoogleLogin: (redirectUri?: string) => void;
  handleAuthCallback: (callbackUrl?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState: AuthState = {
  user: null,
  jwtToken: null,
  isAuthenticated: false,
  isLoading: true,
};

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        ...initialState,
        error: null,

        // Google OAuth 로그인 페이지로 리다이렉트
        redirectToGoogleLogin: (redirectUri?: string) => {
          authApi.redirectToGoogleLogin(redirectUri);
        },

        // OAuth callback 처리
        handleAuthCallback: async (callbackUrl?: string) => {
          set({ isLoading: true, error: null });

          try {
            const token = authApi.handleAuthCallback(callbackUrl);

            if (!token) {
              throw new Error('OAuth callback failed: No token received');
            }

            // 사용자 정보 조회
            const userResponse = await authApi.getCurrentUser();
            const user = mapUserResponseToUser(userResponse);

            set({
              user,
              jwtToken: token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
            set({
              error: errorMessage,
              isLoading: false,
              user: null,
              jwtToken: null,
              isAuthenticated: false,
            });
            throw error;
          }
        },

        // 로그아웃
        logout: async () => {
          try {
            await authApi.logout();
          } catch (error) {
            console.error('Logout API failed:', error);
          } finally {
            // 에러가 발생해도 로컬 상태는 정리
            set({
              user: null,
              jwtToken: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        },

        // 인증 상태 복원 (페이지 새로고침 시)
        refreshAuth: async () => {
          if (!authApi.hasValidToken()) {
            set({ isLoading: false });
            return;
          }

          const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
          set({ isLoading: true });

          try {
            const userResponse = await authApi.getCurrentUser();
            const user = mapUserResponseToUser(userResponse);

            set({
              user,
              jwtToken: token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error) {
            console.error('Auth refresh failed:', error);
            // 토큰이 유효하지 않으면 정리
            await authApi.logout();

            set({
              user: null,
              jwtToken: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        },

        // 사용자 정보 설정
        setUser: (user) => set({ user }),

        // 로딩 상태 설정
        setLoading: (isLoading) => set({ isLoading }),

        // 에러 설정
        setError: (error) => set({ error }),

        // 에러 초기화
        clearError: () => set({ error: null }),

        // 상태 초기화
        reset: () =>
          set({
            ...initialState,
            error: null,
            isLoading: false,
          }),
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          jwtToken: state.jwtToken,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'AuthStore',
    }
  )
);

// Selectors
export const selectUser = (state: AuthStore) => state.user;
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
export const selectIsLoading = (state: AuthStore) => state.isLoading;
export const selectError = (state: AuthStore) => state.error;
