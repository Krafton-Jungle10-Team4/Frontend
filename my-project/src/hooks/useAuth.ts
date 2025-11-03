import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

/**
 * 인증 관련 커스텀 훅
 * Zustand authStore의 wrapper로 기존 API 호환성 유지
 */
export const useAuth = () => {
  const store = useAuthStore();

  // 컴포넌트 마운트 시 인증 상태 복원
  useEffect(() => {
    store.refreshAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    user: store.user,
    accessToken: store.accessToken,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    login: store.login,
    logout: store.logout,
  };
};
