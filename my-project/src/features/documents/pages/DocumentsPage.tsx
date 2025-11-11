/**
 * Documents Page
 *
 * Main page for document management that switches between
 * the new monitoring dashboard and legacy document list based on feature flag
 */

import React from 'react';
import { useFeatureFlag } from '@/shared/hooks/useFeatureFlag';
import { DocumentMonitoringPage } from '../components/monitoring/DocumentMonitoringPage';
import { DocumentList } from '../components/DocumentList';

export const DocumentsPage: React.FC = () => {
  const useAsyncUpload = useFeatureFlag('async_document_upload');

  return useAsyncUpload ? <DocumentMonitoringPage /> : <DocumentList />;
};
