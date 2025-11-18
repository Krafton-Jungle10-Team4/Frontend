/**
 * Document Status Card Component
 *
 * Displays aggregate document counts by status
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/card';
import { useDocumentsByStatus } from '../../stores/selectors';
import { DocumentStatus } from '../../types/document.types';

export const DocumentStatusCard: React.FC = () => {
  const queuedDocs = useDocumentsByStatus(DocumentStatus.QUEUED);
  const processingDocs = useDocumentsByStatus(DocumentStatus.PROCESSING);
  const doneDocs = useDocumentsByStatus(DocumentStatus.DONE);
  const failedDocs = useDocumentsByStatus(DocumentStatus.FAILED);

  const stats = [
    {
      label: '대기 중',
      count: queuedDocs.length,
      status: DocumentStatus.QUEUED,
      color: 'text-muted-foreground',
    },
    {
      label: '처리 중',
      count: processingDocs.length,
      status: DocumentStatus.PROCESSING,
      color: 'text-blue-600',
    },
    {
      label: '완료',
      count: doneDocs.length,
      status: DocumentStatus.DONE,
      color: 'text-green-600',
    },
    {
      label: '실패',
      count: failedDocs.length,
      status: DocumentStatus.FAILED,
      color: 'text-destructive',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">문서 처리 현황</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.status} className="text-center">
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className={`text-2xl font-semibold ${stat.color}`}>{stat.count}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
