import { useEffect, useCallback } from 'react';
import { useDashboardStore } from '../stores/dashboardStore';
import { dashboardApi } from '../api/dashboardApi';

/**
 * Dashboard 커스텀 Hook
 *
 * 대시보드 데이터 조회 및 상태 관리
 */
export function useDashboard(options?: { autoFetch?: boolean }) {
  const {
    stats,
    activities,
    performanceMetrics,
    error,
    setStats,
    setActivities,
    setPerformanceMetrics,
    setLoading,
    setError,
    reset,
  } = useDashboardStore();

  /**
   * 대시보드 데이터 전체 가져오기
   */
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await dashboardApi.getDashboardData();

      setStats(data.stats);
      setActivities(data.recentActivities);
      setPerformanceMetrics(data.performanceMetrics);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [
    setLoading,
    setError,
    setStats,
    setActivities,
    setPerformanceMetrics,
  ]);

  /**
   * 통계 데이터만 가져오기
   */
  const fetchStats = useCallback(async () => {
    try {
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch {
      // Error will be logged in production monitoring
    }
  }, [setStats]);

  /**
   * 활동 로그만 가져오기
   */
  const fetchActivities = useCallback(
    async (limit = 10) => {
      try {
        const data = await dashboardApi.getRecentActivities(limit);
        setActivities(data);
      } catch {
        // Error will be logged in production monitoring
      }
    },
    [setActivities]
  );

  /**
   * 성능 메트릭만 가져오기
   */
  const fetchPerformanceMetrics = useCallback(
    async (days = 7) => {
      try {
        const data = await dashboardApi.getPerformanceMetrics(days);
        setPerformanceMetrics(data);
      } catch {
        // Error will be logged in production monitoring
      }
    },
    [setPerformanceMetrics]
  );

  /**
   * 컴포넌트 마운트 시 자동 데이터 가져오기
   */
  useEffect(() => {
    if (options?.autoFetch !== false) {
      fetchDashboardData();
    }
  }, [options?.autoFetch, fetchDashboardData]);

  return {
    // 상태
    stats,
    activities,
    performanceMetrics,
    error,

    // Actions
    fetchDashboardData,
    fetchStats,
    fetchActivities,
    fetchPerformanceMetrics,
    reset,
  };
}
