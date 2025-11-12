import React from 'react';
import { Button } from '@/shared/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu';
import { MoreHorizontal, RefreshCw, Trash2, Eye } from 'lucide-react';
import { DocumentWithStatus, DocumentStatus } from '../../../types/document.types';

interface DocumentActionsProps {
  document: DocumentWithStatus;
  onRetry?: (documentId: string) => void;
  onDelete?: (documentId: string, botId: string) => void;
  onView?: (documentId: string) => void;
}

export const DocumentActions: React.FC<DocumentActionsProps> = ({
  document,
  onRetry,
  onDelete,
  onView,
}) => {
  const canRetry = document.status === DocumentStatus.FAILED;
  const canDelete = document.status !== DocumentStatus.PROCESSING;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">작업 메뉴 열기</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onView && (
          <DropdownMenuItem onClick={() => onView(document.documentId)}>
            <Eye className="mr-2 h-4 w-4" />
            상세보기
          </DropdownMenuItem>
        )}
        {canRetry && onRetry && (
          <DropdownMenuItem onClick={() => onRetry(document.documentId)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            재처리
          </DropdownMenuItem>
        )}
        {canDelete && onDelete && (
          <DropdownMenuItem
            onClick={() => onDelete(document.documentId, document.botId)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            삭제
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
