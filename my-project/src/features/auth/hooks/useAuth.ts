import { useEffect } from 'react';

import { useAuthStore } from '../stores/authStore';

/**
 * 인증 관련 커스텀 훅 (SnapAgent OAuth)
 * Zustand authStore의 wrapper
 */
export const useAuth = () => {
  const store = useAuthStore();

  // 컴포넌트 마운트 시 인증 상태 복원
  useEffect(() => {
    store.refreshAuth();
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
