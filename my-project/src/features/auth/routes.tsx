import type { RouteObject } from 'react-router-dom';

import { AuthLayout } from '@/widgets/layouts/AuthLayout';

/**
 * Auth Feature 라우트 정의
 * 로그인 및 인증 관련 라우트
 */
export const authRoutes: RouteObject = {
  path: 'login',
  element: <AuthLayout />,
  children: [
    {
      index: true,
      lazy: () =>
        import('./pages/LoginPage').then((module) => ({
          Component: module.LoginPage,
        })),
    },
  ],
};
