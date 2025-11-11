/**
 * Processing Queue Panel Component
 *
 * Shows real-time list of documents being processed
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/card';
import { useDocumentsByStatus } from '../../stores/selectors';
import { DocumentStatus } from '../../types/document.types';
import { Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export const ProcessingQueuePanel: React.FC = () => {
  const queuedDocs = useDocumentsByStatus(DocumentStatus.QUEUED);
  const processingDocs = useDocumentsByStatus(DocumentStatus.PROCESSING);

  const allProcessing = [...processingDocs, ...queuedDocs].slice(0, 5); // Show top 5

  if (allProcessing.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">처리 대기열</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            현재 처리 중인 문서가 없습니다
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">처리 대기열</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {allProcessing.map((doc) => (
            <div
              key={doc.documentId}
              className="flex items-center justify-between p-2 rounded-md bg-secondary/50"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {doc.originalFilename}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {doc.status === DocumentStatus.PROCESSING
                      ? '처리 중'
                      : '대기 중'}{' '}
                    •{' '}
                    {formatDistanceToNow(new Date(doc.createdAt), {
                      addSuffix: true,
                      locale: ko,
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {allProcessing.length >= 5 && (
            <p className="text-xs text-muted-foreground text-center pt-2">
              + {queuedDocs.length + processingDocs.length - 5}개 더 대기 중
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
