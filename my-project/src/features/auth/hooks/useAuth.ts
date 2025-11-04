import { useEffect, useRef } from 'react';

import { useAuthStore } from '../stores/authStore';

/**
 * 인증 관련 커스텀 훅 (SnapAgent OAuth)
 * Zustand authStore의 wrapper
 */
export const useAuth = () => {
  const store = useAuthStore();
  const isRefreshing = useRef(false);

  // 컴포넌트 마운트 시 인증 상태 복원 (중복 호출 방지)
  useEffect(() => {
    if (!isRefreshing.current && store.isLoading) {
      isRefreshing.current = true;
      store.refreshAuth().finally(() => {
        isRefreshing.current = false;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // State
    user: store.user,
    jwtToken: store.jwtToken,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,

    // Actions (OAuth 방식)
    redirectToGoogleLogin: store.redirectToGoogleLogin,
    handleAuthCallback: store.handleAuthCallback,
    logout: store.logout,
    setError: store.setError,
    clearError: store.clearError,
  };
};
