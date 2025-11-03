/**
 * Dashboard Feature - Public API
 *
 * Feature 외부에서 사용할 수 있는 공개 인터페이스
 */

// Components
export { DashboardHeader } from './components/DashboardHeader';
export { DashboardStats } from './components/DashboardStats';
export { DashboardContent } from './components/DashboardContent';

// Hooks
export { useDashboard } from './hooks/useDashboard';

// Store
export { useDashboardStore } from './stores/dashboardStore';

// Types
export type {
  DashboardStats as DashboardStatsType,
  ActivityLog,
  PerformanceMetric,
  DashboardData,
} from './types/dashboard.types';

// Pages (Router에서만 사용)
export { DashboardPage } from './pages/DashboardPage';

// Routes (Router에서만 사용)
export { dashboardRoutes } from './routes';
