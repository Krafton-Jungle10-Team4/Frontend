import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from '@/widgets/layouts/RootLayout';
import { AuthLayout } from '@/widgets/layouts/AuthLayout';
import { DashboardLayout } from '@/widgets/layouts/DashboardLayout';
import { RootErrorBoundary } from '@/widgets/layouts/RootErrorBoundary';
import { ProtectedRoute } from '@/components/ProtectedRoute';

/**
 * React Router v7 기반 애플리케이션 라우터 설정
 *
 * 구조:
 * - RootLayout: 전체 앱의 최상위 레이아웃
 *   - Public routes: 인증 불필요 (/, /setup, /preview 등)
 *   - Auth routes: 인증 페이지 (로그인)
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

      // Workflow Builder routes
      {
        path: 'workflow-builder',
        lazy: () => import('@/pages/WorkflowBuilder').then(module => ({
          Component: module.default
        })),
      },
      {
        path: 'workflow',
        lazy: () => import('@/pages/WorkflowBuilder').then(module => ({
          Component: module.default
        })),
      },

      // Auth routes
      {
        path: 'login',
        element: <AuthLayout />,
        children: [
          {
            index: true,
            lazy: () => import('@/pages/LoginPage').then(module => ({
              Component: module.LoginPage
            })),
          },
        ],
      },

      // Protected routes - 인증 필요
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'dashboard',
            element: <DashboardLayout />,
            children: [
              {
                index: true,
                lazy: () => import('@/pages/DashboardPage').then(module => ({
                  Component: module.DashboardPage
                })),
              },
            ],
          },
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
