import type { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '@/features/auth';
import { DashboardLayout } from '@/widgets/layouts/DashboardLayout';

/**
 * MCP Feature Routes
 *
 * MCP 키 관리 관련 라우트 정의 (인증 필요)
 */
export const mcpRoutes: RouteObject = {
  path: 'mcp',
  element: (
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  ),
  children: [
    {
      path: 'keys',
      lazy: () =>
        import('./pages/MCPKeyManagementPage').then((module) => ({
          Component: module.MCPKeyManagementPage,
        })),
    },
  ],
};
