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
 *   - Public routes: 인증 불필요 (/, /setup, /preview 등)
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
      // Public routes - 홈 및 Bot Setup 관련
      {
        index: true,
        lazy: () => import('@/pages/HomePage').then(module => ({
          Component: module.HomePage
        })),
      },
      {
        path: 'setup',
        lazy: () => import('@/pages/BotSetupPage').then(module => ({
          Component: module.BotSetupPage
        })),
      },
      {
        path: 'setup/complete',
        lazy: () => import('@/pages/SetupCompletePage').then(module => ({
          Component: module.SetupCompletePage
        })),
      },
      {
        path: 'preview',
        lazy: () => import('@/pages/BotPreviewPage').then(module => ({
          Component: module.BotPreviewPage
        })),
      },

      // Auth routes
      authRoutes,

      // Workflow routes - Feature 기반
      workflowRoutes,

      // Protected routes - 인증 필요
      {
        element: <ProtectedRoute />,
        children: [
          // Dashboard routes - Feature 기반
          dashboardRoutes,
        ],
      },

      // Fallback - 404
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
