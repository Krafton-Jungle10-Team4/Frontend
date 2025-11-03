/**
 * Auth Store
 * 인증 상태 관리 (Zustand)
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/constants/storageKeys';

import type { AuthState, User } from '../types/auth.types';
import { getCurrentUser, googleLogin, logout as logoutApi } from '../api/authApi';

interface AuthStore extends AuthState {
  error: string | null;

  // Actions
  login: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  reset: () => void;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
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

        // 로그인
        login: async (idToken: string) => {
          set({ isLoading: true, error: null });
          try {
            const response = await googleLogin(idToken);

            // googleLogin이 이미 localStorage에 저장하므로 중복 저장 불필요
            set({
              user: response.user,
              accessToken: response.accessToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed';
            set({
              error: errorMessage,
              isLoading: false,
              user: null,
              accessToken: null,
              isAuthenticated: false,
            });
            throw error;
          }
        },

        // 로그아웃
        logout: async () => {
          try {
            await logoutApi();
          } catch (error) {
            console.error('Logout API failed:', error);
          } finally {
            // 에러가 발생해도 로컬 상태는 정리
            // logoutApi가 이미 localStorage를 정리하므로 중복 제거 불필요
            set({
              user: null,
              accessToken: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        },

        // 인증 상태 복원 (페이지 새로고침 시)
        refreshAuth: async () => {
          const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
          if (!token) {
            set({ isLoading: false });
            return;
          }

          set({ isLoading: true });
          try {
            const user = await getCurrentUser();
            set({
              user,
              accessToken: token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error) {
            console.error('Auth refresh failed:', error);
            // 토큰이 유효하지 않으면 정리
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER_INFO);

            set({
              user: null,
              accessToken: null,
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

        // 상태 초기화
        reset: () => set({
          ...initialState,
          error: null,
          isLoading: false,
        }),
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          accessToken: state.accessToken,
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
