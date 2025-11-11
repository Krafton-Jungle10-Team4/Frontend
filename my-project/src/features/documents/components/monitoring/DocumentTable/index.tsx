import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/table';
import { Skeleton } from '@/shared/components/skeleton';
import { DocumentWithStatus } from '../../../types/document.types';
import { DocumentTableRow } from './DocumentTableRow';
import { DocumentTableEmpty } from './DocumentTableEmpty';
import { useIsLoading } from '../../../stores/selectors';

interface DocumentTableProps {
  documents: DocumentWithStatus[];
  onRetry?: (documentId: string) => void;
  onDelete?: (documentId: string, botId: string) => void;
  onView?: (documentId: string) => void;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  onRetry,
  onDelete,
  onView,
}) => {
  const isLoading = useIsLoading();

  if (isLoading && documents.length === 0) {
    return (
      <div className="p-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 mb-2" />
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return <DocumentTableEmpty />;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>파일명</TableHead>
            <TableHead className="w-32">상태</TableHead>
            <TableHead className="w-32">진행률</TableHead>
            <TableHead className="w-24 text-right">크기</TableHead>
            <TableHead className="w-20 text-center">청크</TableHead>
            <TableHead className="w-32">업로드</TableHead>
            <TableHead className="w-28">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document, index) => (
            <DocumentTableRow
              key={document.documentId}
              document={document}
              index={index + 1}
              onRetry={onRetry}
              onDelete={onDelete}
              onView={onView}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
