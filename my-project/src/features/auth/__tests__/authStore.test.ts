/**
 * Auth Store 단위 테스트
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../stores/authStore';
import type { User } from '../types/auth.types';

describe('authStore', () => {
  beforeEach(() => {
    // 각 테스트 전에 store 초기화
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  describe('로그인', () => {
    it('로그인 성공 시 사용자 정보가 저장되어야 한다', () => {
      const { setUser, user, isAuthenticated } = useAuthStore.getState();

      const testUser: User = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
      };

      setUser(testUser);

      expect(user).toEqual(testUser);
      expect(isAuthenticated).toBe(true);
    });

    it('로그인 로딩 상태가 올바르게 관리되어야 한다', () => {
      const { setLoading, isLoading } = useAuthStore.getState();

      setLoading(true);
      expect(isLoading).toBe(true);

      setLoading(false);
      expect(isLoading).toBe(false);
    });

    it('로그인 에러가 올바르게 저장되어야 한다', () => {
      const { setError, error } = useAuthStore.getState();

      const errorMessage = 'Invalid credentials';
      setError(errorMessage);

      expect(error).toBe(errorMessage);
    });
  });

  describe('로그아웃', () => {
    it('로그아웃 시 사용자 정보가 초기화되어야 한다', () => {
      const { setUser, logout, user, isAuthenticated } = useAuthStore.getState();

      const testUser: User = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
      };

      setUser(testUser);
      expect(isAuthenticated).toBe(true);

      logout();

      expect(user).toBeNull();
      expect(isAuthenticated).toBe(false);
    });

    it('로그아웃 시 에러 상태도 초기화되어야 한다', () => {
      const { setError, logout, error } = useAuthStore.getState();

      setError('Some error');
      expect(error).toBe('Some error');

      logout();
      expect(error).toBeNull();
    });
  });

  describe('인증 상태', () => {
    it('user가 null이면 isAuthenticated는 false여야 한다', () => {
      const { isAuthenticated } = useAuthStore.getState();
      expect(isAuthenticated).toBe(false);
    });

    it('user가 있으면 isAuthenticated는 true여야 한다', () => {
      const { setUser, isAuthenticated } = useAuthStore.getState();

      const testUser: User = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
      };

      setUser(testUser);
      expect(isAuthenticated).toBe(true);
    });
  });

  describe('에러 처리', () => {
    it('에러 메시지를 설정하고 초기화할 수 있어야 한다', () => {
      const { setError, clearError, error } = useAuthStore.getState();

      setError('Test error');
      expect(error).toBe('Test error');

      clearError();
      expect(error).toBeNull();
    });

    it('로그인 시도 중 에러가 발생하면 로딩이 해제되어야 한다', () => {
      const { setLoading, setError, isLoading } = useAuthStore.getState();

      setLoading(true);
      expect(isLoading).toBe(true);

      setError('Login failed');
      setLoading(false);

      expect(isLoading).toBe(false);
    });
  });
});
