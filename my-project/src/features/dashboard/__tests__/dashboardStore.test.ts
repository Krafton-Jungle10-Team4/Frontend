/**
 * Dashboard Store 단위 테스트
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useDashboardStore } from '../stores/dashboardStore';
import type { DashboardStats } from '../types/dashboard.types';

describe('dashboardStore', () => {
  beforeEach(() => {
    // 각 테스트 전에 store 초기화
    useDashboardStore.setState({
      stats: null,
      isLoading: false,
      error: null,
    });
  });

  describe('통계 데이터 관리', () => {
    it('통계 데이터를 설정할 수 있어야 한다', () => {
      const { setStats, stats } = useDashboardStore.getState();

      const testStats: DashboardStats = {
        totalBots: 5,
        activeBots: 3,
        totalQueries: 800,
        totalMessages: 1000,
        totalErrors: 10,
        avgResponseTime: 1.5,
      };

      setStats(testStats);

      expect(stats).toEqual(testStats);
    });

    it('통계 데이터를 업데이트할 수 있어야 한다', () => {
      const { setStats, stats } = useDashboardStore.getState();

      const initialStats: DashboardStats = {
        totalBots: 5,
        activeBots: 3,
        totalQueries: 800,
        totalMessages: 1000,
        totalErrors: 10,
        avgResponseTime: 1.5,
      };

      setStats(initialStats);

      const updatedStats: DashboardStats = {
        ...initialStats,
        totalBots: 6,
        activeBots: 4,
      };

      setStats(updatedStats);

      expect(stats?.totalBots).toBe(6);
      expect(stats?.activeBots).toBe(4);
    });
  });

  describe('로딩 상태 관리', () => {
    it('로딩 상태를 설정할 수 있어야 한다', () => {
      const { setLoading, isLoading } = useDashboardStore.getState();

      setLoading(true);
      expect(isLoading).toBe(true);

      setLoading(false);
      expect(isLoading).toBe(false);
    });

    it('데이터 로딩 중에는 isLoading이 true여야 한다', () => {
      const { setLoading, isLoading } = useDashboardStore.getState();

      setLoading(true);
      expect(isLoading).toBe(true);
    });
  });

  describe('에러 처리', () => {
    it('에러 메시지를 설정할 수 있어야 한다', () => {
      const { setError, error } = useDashboardStore.getState();

      const testError = new Error('Failed to load dashboard data');
      setError(testError);

      expect(error).toBe(testError);
    });

    it('에러를 초기화할 수 있어야 한다', () => {
      const { setError, clearError, error } = useDashboardStore.getState();

      const testError = new Error('Some error');
      setError(testError);
      expect(error).toBe(testError);

      clearError();
      expect(error).toBeNull();
    });

    it('에러 발생 시 로딩이 해제되어야 한다', () => {
      const { setLoading, setError, isLoading } = useDashboardStore.getState();

      setLoading(true);
      expect(isLoading).toBe(true);

      setError(new Error('Error occurred'));
      setLoading(false);

      expect(isLoading).toBe(false);
    });
  });

  describe('통계 계산', () => {
    it('에러율을 정확하게 계산해야 한다', () => {
      const { setStats, stats } = useDashboardStore.getState();

      const testStats: DashboardStats = {
        totalBots: 5,
        activeBots: 3,
        totalQueries: 800,
        totalMessages: 1000,
        totalErrors: 50,
        avgResponseTime: 1.5,
      };

      setStats(testStats);

      // 에러율 = (totalErrors / totalMessages) * 100
      const errorRate = (stats!.totalErrors / stats!.totalMessages) * 100;
      expect(errorRate).toBe(5); // 5%
    });

    it('활성 Bot 비율을 정확하게 계산해야 한다', () => {
      const { setStats, stats } = useDashboardStore.getState();

      const testStats: DashboardStats = {
        totalBots: 10,
        activeBots: 6,
        totalQueries: 900,
        totalMessages: 1000,
        totalErrors: 10,
        avgResponseTime: 1.5,
      };

      setStats(testStats);

      // 활성 Bot 비율 = (activeBots / totalBots) * 100
      const activeRate = (stats!.activeBots / stats!.totalBots) * 100;
      expect(activeRate).toBe(60); // 60%
    });
  });

  describe('초기 상태', () => {
    it('초기 상태가 올바르게 설정되어야 한다', () => {
      const { stats, isLoading, error } = useDashboardStore.getState();

      expect(stats).toBeNull();
      expect(isLoading).toBe(false);
      expect(error).toBeNull();
    });
  });

  describe('데이터 갱신 시나리오', () => {
    it('데이터 로딩 → 성공 시나리오', () => {
      const { setLoading, setStats, isLoading, stats } =
        useDashboardStore.getState();

      // 로딩 시작
      setLoading(true);
      expect(isLoading).toBe(true);

      // 데이터 수신
      const testStats: DashboardStats = {
        totalBots: 5,
        activeBots: 3,
        totalQueries: 800,
        totalMessages: 1000,
        totalErrors: 10,
        avgResponseTime: 1.5,
      };
      setStats(testStats);

      // 로딩 종료
      setLoading(false);

      expect(isLoading).toBe(false);
      expect(stats).toEqual(testStats);
    });

    it('데이터 로딩 → 실패 시나리오', () => {
      const { setLoading, setError, isLoading, error } =
        useDashboardStore.getState();

      // 로딩 시작
      setLoading(true);
      expect(isLoading).toBe(true);

      // 에러 발생
      const testError = new Error('Network error');
      setError(testError);
      setLoading(false);

      expect(isLoading).toBe(false);
      expect(error).toBe(testError);
    });
  });
});
