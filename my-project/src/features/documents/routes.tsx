import type { RouteObject } from 'react-router-dom';
import { Suspense } from 'react';
import { isFeatureEnabled } from '@/shared/config/features';

/**
 * Documents Feature Routes
 *
 * Documents management routes (protected)
 * 
 * Uses router-level lazy loading with feature flag check to ensure
 * monitoring dashboard bundle is only loaded when async upload is enabled
 */
export const documentsRoutes: RouteObject = {
  path: 'documents',
  lazy: async () => {
    // Check feature flag at route level
    const useAsyncUpload = isFeatureEnabled('asyncDocumentUpload');
    
    // Dynamically import the appropriate component
    if (useAsyncUpload) {
      const module = await import('./components/monitoring/DocumentMonitoringPage');
      return {
        Component: () => (
          <Suspense fallback={<div>Loading...</div>}>
            <module.DocumentMonitoringPage />
          </Suspense>
        ),
      };
    } else {
      const module = await import('./pages/DocumentsPage');
      return {
        Component: () => (
          <Suspense fallback={<div>Loading...</div>}>
            <module.LegacyDocumentsView />
          </Suspense>
        ),
      };
    }
  },
};
