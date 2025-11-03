import type { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '@/features/auth';
import { DashboardLayout } from '@/widgets/layouts/DashboardLayout';

/**
 * Dashboard Feature Routes
 *
 * 대시보드 관련 라우트 정의 (인증 필요)
 */
export const dashboardRoutes: RouteObject = {
  path: 'dashboard',
  element: (
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  ),
  children: [
    {
      index: true,
      lazy: () =>
        import('./pages/DashboardPage').then((module) => ({
          Component: module.DashboardPage,
        })),
    },
  ],
};
