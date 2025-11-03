import { apiClient } from '@/shared/api/client';
import type { DashboardData } from '../types/dashboard.types';

/**
 * Dashboard API
 *
 * 대시보드 데이터 조회 관련 API
 */
export const dashboardApi = {
  /**
   * 대시보드 전체 데이터 조회
   */
  getDashboardData: async (): Promise<DashboardData> => {
    const { data } = await apiClient.get('/dashboard');
    return data;
  },

  /**
   * 통계 데이터 조회
   */
  getStats: async () => {
    const { data } = await apiClient.get('/dashboard/stats');
    return data;
  },

  /**
   * 최근 활동 로그 조회
   */
  getRecentActivities: async (limit = 10) => {
    const { data } = await apiClient.get('/dashboard/activities', {
      params: { limit },
    });
    return data;
  },

  /**
   * 성능 메트릭 조회
   */
  getPerformanceMetrics: async (days = 7) => {
    const { data } = await apiClient.get('/dashboard/metrics', {
      params: { days },
    });
    return data;
  },
};
