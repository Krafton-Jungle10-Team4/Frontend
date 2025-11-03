import { create } from 'zustand';
import type {
  DashboardStats,
  ActivityLog,
  PerformanceMetric,
} from '../types/dashboard.types';

/**
 * Dashboard Store 상태 타입
 */
interface DashboardState {
  // 통계
  stats: DashboardStats | null;

  // 활동 로그
  activities: ActivityLog[];

  // 성능 메트릭
  performanceMetrics: PerformanceMetric[];

  // 로딩 상태
  loading: boolean;
  error: Error | null;

  // Actions - 통계
  setStats: (stats: DashboardStats) => void;

  // Actions - 활동 로그
  setActivities: (activities: ActivityLog[]) => void;
  addActivity: (activity: ActivityLog) => void;

  // Actions - 성능 메트릭
  setPerformanceMetrics: (metrics: PerformanceMetric[]) => void;

  // Actions - 로딩 상태
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;

  // Actions - 초기화
  reset: () => void;
}

/**
 * 초기 상태
 */
const initialState = {
  stats: null,
  activities: [],
  performanceMetrics: [],
  loading: false,
  error: null,
};

/**
 * Dashboard Store
 *
 * 대시보드 관련 상태 관리
 */
export const useDashboardStore = create<DashboardState>((set) => ({
  ...initialState,

  // 통계
  setStats: (stats) => set({ stats }),

  // 활동 로그
  setActivities: (activities) => set({ activities }),

  addActivity: (activity) =>
    set((state) => ({
      activities: [activity, ...state.activities],
    })),

  // 성능 메트릭
  setPerformanceMetrics: (performanceMetrics) => set({ performanceMetrics }),

  // 로딩 상태
  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  // 초기화
  reset: () => set(initialState),
}));
