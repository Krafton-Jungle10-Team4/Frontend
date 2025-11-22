import React from 'react';
import { TableCell, TableRow } from '@/shared/components/table';
import { DocumentWithStatus } from '../../../types/document.types';
import { DocumentStatusBadge } from '../DocumentStatusBadge';
import { DocumentProgressBar } from '../DocumentProgressBar';
import { DocumentActions } from '../DocumentActions';
import { formatBytes, formatTimeAgo } from '@/shared/utils/format';

interface DocumentTableRowProps {
  document: DocumentWithStatus;
  index: number;
  onRetry?: (documentId: string) => void;
  onDelete?: (documentId: string) => void;
  onView?: (documentId: string) => void;
}

export const DocumentTableRow: React.FC<DocumentTableRowProps> = ({
  document,
  index,
  onRetry,
  onDelete,
  onView,
}) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{index}</TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium truncate max-w-md" title={document.originalFilename}>
            {document.originalFilename}
          </span>
          <span className="text-xs text-muted-foreground">.{document.fileExtension}</span>
        </div>
      </TableCell>
      <TableCell>
        <DocumentStatusBadge
          status={document.status}
          errorMessage={document.errorMessage}
        />
      </TableCell>
      <TableCell>
        <DocumentProgressBar document={document} />
      </TableCell>
      <TableCell className="text-right">{formatBytes(document.fileSize)}</TableCell>
      <TableCell className="text-center">
        {document.chunkCount !== undefined ? document.chunkCount : '-'}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatTimeAgo(new Date(document.createdAt), 'ko')}
      </TableCell>
      <TableCell>
        <DocumentActions
          document={document}
          onRetry={onRetry}
          onDelete={onDelete}
          onView={onView}
        />
      </TableCell>
    </TableRow>
  );
};
