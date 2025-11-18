import { useEffect, useRef } from 'react';

import { useAuthStore } from '../stores/authStore';

/**
 * 인증 관련 커스텀 훅 (SnapAgent OAuth)
 * Zustand authStore의 wrapper
 */
export const useAuth = () => {
  const {
    user,
    jwtToken,
    isAuthenticated,
    isLoading,
    error,
    redirectToGoogleLogin,
    handleAuthCallback,
    logout,
    setError,
    clearError,
    refreshAuth,
  } = useAuthStore();

  const isRefreshing = useRef(false);

  // 컴포넌트 마운트 시 인증 상태 복원 (중복 호출 방지)
  useEffect(() => {
    if (!isRefreshing.current && isLoading) {
      isRefreshing.current = true;
      refreshAuth().finally(() => {
        isRefreshing.current = false;
      });
    }
  }, [isLoading, refreshAuth]);

  return {
    // State
    user,
    jwtToken,
    isAuthenticated,
    isLoading,
    error,

    // Actions (OAuth 방식)
    redirectToGoogleLogin,
    handleAuthCallback,
    logout,
    setError,
    clearError,
  };
};
