import { RouteObject } from 'react-router-dom';

export const promptEngineeringStudioRoutes: RouteObject = {
  path: 'prompt-studio',
  children: [
    {
      index: true,
      lazy: () =>
        import('./pages/PromptStudioPage').then((module) => ({
          Component: module.PromptStudioPage,
        })),
    },
    {
      path: 'test-sets',
      children: [
        {
          index: true,
          lazy: () =>
            import('./pages/TestSetListPage').then((module) => ({
              Component: module.TestSetListPage,
            })),
        },
        {
          path: ':testSetId',
          lazy: () =>
            import('./pages/TestSetHistoryPage').then((module) => ({
              Component: module.TestSetHistoryPage,
            })),
        },
      ],
    },
    {
      path: 'results/validation',
      lazy: () =>
        import('./pages/ResultsValidationPage').then((module) => ({
          Component: module.ResultsValidationPage,
        })),
    },
  ],
};
