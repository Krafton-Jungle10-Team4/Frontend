import type { RouteObject } from 'react-router-dom';

/**
 * Documents Feature Routes
 *
 * Documents management routes (protected)
 */
export const documentsRoutes: RouteObject = {
  path: 'documents',
  lazy: () =>
    import('./pages/DocumentsPage').then((module) => ({
      Component: module.DocumentsPage,
    })),
};
