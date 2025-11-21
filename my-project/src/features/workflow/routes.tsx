import type { RouteObject } from 'react-router-dom';

/**
 * Workflow Feature Routes
 *
 * 워크플로우 빌더 관련 라우트 정의
 */
export const workflowRoutes: RouteObject = {
  path: 'bot',
  children: [
    {
      path: ':botId/workflow/logs',
      lazy: () =>
        import('./pages/WorkflowLogsPage').then((module) => ({
          Component: module.WorkflowLogsPage,
        })),
    },
    {
      path: ':botId/workflow',
      lazy: () =>
        import('./pages/WorkflowBuilderPage').then((module) => ({
          Component: module.WorkflowBuilderPage,
        })),
    },
  ],
};

/**
 * Template Preview Routes
 *
 * 읽기 전용 템플릿 미리보기 라우트
 */
export const templatePreviewRoutes: RouteObject = {
  path: 'template',
  children: [
    {
      path: ':templateId/preview',
      lazy: () =>
        import('./pages/TemplatePreviewPage').then((module) => ({
          Component: module.TemplatePreviewPage,
        })),
    },
  ],
};
