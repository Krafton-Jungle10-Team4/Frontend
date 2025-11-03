import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from '@/widgets/layouts/RootLayout';
import { RootErrorBoundary } from '@/widgets/layouts/RootErrorBoundary';
import { ProtectedRoute, authRoutes } from '@/features/auth';
import { workflowRoutes } from '@/features/workflow';
import { dashboardRoutes } from '@/features/dashboard';

/**
 * React Router v7 기반 애플리케이션 라우터 설정
 *
 * 구조:
 * - RootLayout: 전체 앱의 최상위 레이아웃
 *   - Public routes: 인증 불필요 (Bot 홈, setup, preview 등)
 *   - Auth routes: 인증 페이지 (로그인)
 *   - Workflow routes: 워크플로우 빌더
 *   - Protected routes: 인증 필요 (대시보드 등)
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RootErrorBoundary />,
    children: [
      // Root - Redirect to Landing
      {
        index: true,
        element: <Navigate to="/landing" replace />,
      },

      // Landing Page
      {
        path: 'landing',
        lazy: () =>
          import('@/features/landing').then((module) => ({
            Component: module.LandingPage,
          })),
      },

      // Auth routes - Public
      authRoutes,

      // Bot Setup routes - Public (인증 불필요)
      {
        path: 'setup',
        lazy: () =>
          import('@/features/bot').then((module) => ({
            Component: module.BotSetupPage,
          })),
      },
      {
        path: 'setup/complete',
        lazy: () =>
          import('@/features/bot').then((module) => ({
            Component: module.SetupCompletePage,
          })),
      },
      {
        path: 'preview',
        lazy: () =>
          import('@/features/bot').then((module) => ({
            Component: module.BotPreviewPage,
          })),
      },

      // Workflow routes - Feature 기반
      workflowRoutes,

      // Protected routes - 인증 필요
      {
        element: <ProtectedRoute />,
        children: [
          // Home (Bot List) - 인증 필요
          {
            path: 'home',
            lazy: () =>
              import('@/features/bot').then((module) => ({
                Component: module.HomePage,
              })),
          },

          // Dashboard routes - Feature 기반
          dashboardRoutes,
        ],
      },

      // Fallback - 404
      {
        path: '*',
        element: <Navigate to="/landing" replace />,
      },
    ],
  },
]);
