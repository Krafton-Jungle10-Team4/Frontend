import type { RouteObject } from 'react-router-dom';

/**
 * Workflow Feature Routes
 *
 * 워크플로우 빌더 관련 라우트 정의
 */
export const workflowRoutes: RouteObject = {
  path: 'workflow',
  children: [
    {
      index: true,
      lazy: () =>
        import('./pages/WorkflowBuilderPage').then((module) => ({
          Component: module.WorkflowBuilderPage,
        })),
    },
    {
      path: 'builder',
      lazy: () =>
        import('./pages/WorkflowBuilderPage').then((module) => ({
          Component: module.WorkflowBuilderPage,
        })),
    },
  ],
};
