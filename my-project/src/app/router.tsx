import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from '@/widgets/layouts/RootLayout';
import { RootErrorBoundary } from '@/widgets/layouts/RootErrorBoundary';
import { ProtectedRoute, authRoutes } from '@/features/auth';
import { workflowRoutes } from '@/features/workflow';
import { dashboardRoutes } from '@/features/dashboard';
import { mcpRoutes } from '@/features/mcp';
import { promptEngineeringStudioRoutes } from '@/features/prompt-engineering-studio';

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

      // OAuth Callback - Public (no layout)
      {
        path: 'auth/callback',
        lazy: () =>
          import('@/features/auth').then((module) => ({
            Component: module.AuthCallbackPage,
          })),
      },

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
      // MCP routes - MCP 키 관리
      mcpRoutes,
      // Prompt Engineering Studio routes - 프롬프트 스튜디오 관리
      promptEngineeringStudioRoutes,

      // Protected routes - 인증 필요
      {
        element: <ProtectedRoute />,
        children: [
          // Workspace routes - 새로운 워크스페이스 레이아웃
          {
            path: 'workspace',
            lazy: () =>
              import('@/features/workspace').then((module) => ({
                Component: module.WorkspaceLayout,
              })),
            children: [
              // Default redirect to studio
              {
                index: true,
                element: <Navigate to="/workspace/studio" replace />,
              },
              // Explore (마켓플레이스)
              {
                path: 'explore',
                lazy: () =>
                  import('@/features/workspace').then((module) => ({
                    Component: module.ExplorePage,
                  })),
              },
              // Studio (봇 관리)
              {
                path: 'studio',
                lazy: () =>
                  import('@/features/workspace').then((module) => ({
                    Component: module.StudioPage,
                  })),
              },
              // Knowledge (지식 관리)
              {
                path: 'knowledge',
                lazy: () =>
                  import('@/features/workspace').then((module) => ({
                    Component: module.KnowledgePage,
                  })),
              },
              // Library (라이브러리)
              {
                path: 'library',
                lazy: () =>
                  import('@/features/library').then((module) => ({
                    Component: module.LibraryPage,
                  })),
              },
            ],
          },
          // Home - Bot 목록 페이지 (기존 유지, 추후 deprecated)
          {
            path: 'home',
            lazy: () =>
              import('@/features/bot').then((module) => ({
                Component: module.HomePage,
              })),
          },
          // Dashboard routes - Feature 기반
          dashboardRoutes,
          // MCP routes - MCP 키 관리
          mcpRoutes,
          // Billing Settings Page
          {
            path: 'billing-settings',
            lazy: () =>
              import('@/features/billing').then((module) => ({
                Component: module.BillingSettingsPage,
              })),
          },
          // Pricing Page
          {
            path: 'pricing',
            lazy: () =>
              import('@/features/billing').then((module) => ({
                Component: module.PricingPage,
              })),
          },
          // Deployment routes - 배포 관리
          {
            path: 'deployment/:botId',
            lazy: () =>
              import('@/features/deployment').then((module) => ({
                Component: module.DeploymentPage,
              })),
          },
        ],
      },

      // Fallback - 404
      {
        path: '*',
        element: <Navigate to="/landing" replace />,
      },
    ],
  },

  // Widget Chat - 독립 페이지 (RootLayout 없음)
  {
    path: '/widget/chat/:widgetKey',
    lazy: () =>
      import('@/features/widget').then((module) => ({
        Component: module.WidgetChatPage,
      })),
  },

  // Standalone App - 독립 실행형 챗봇 페이지 (RootLayout 없음)
  {
    path: '/app/:widgetKey',
    lazy: () =>
      import('@/features/app').then((module) => ({
        Component: module.StandaloneAppPage,
      })),
  },
]);
