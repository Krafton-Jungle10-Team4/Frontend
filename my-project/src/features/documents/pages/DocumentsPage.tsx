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
import { useDocumentStore } from '../stores/documentStore';

/**
 * Legacy Documents View
 * Wraps DocumentList with legacy document store data
 */
const LegacyDocumentsView: React.FC = () => {
  const documents = useDocumentStore((state) => state.documents);

  return <DocumentList documents={documents} />;
};

export const DocumentsPage: React.FC = () => {
  const useAsyncUpload = useFeatureFlag('async_document_upload');

  return useAsyncUpload ? <DocumentMonitoringPage /> : <LegacyDocumentsView />;
};
