import { RiBookLine, RiDeleteBinLine, RiMoreFill, RiFileLine } from '@remixicon/react';
import { Knowledge } from '@/data/mockKnowledge';
import { Card } from '@shared/components/card';
import { Badge } from '@shared/components/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shared/components/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useState } from 'react';

interface KnowledgeCardProps {
  knowledge: Knowledge;
  onClick: () => void;
  onDelete: () => void;
  language: 'en' | 'ko';
}

export function KnowledgeCard({
  knowledge,
  onClick,
  onDelete,
  language,
}: KnowledgeCardProps) {
  const [showDocuments, setShowDocuments] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: language === 'ko' ? ko : undefined,
      });
    } catch {
      return dateString;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const documents = knowledge.documents || [];

  return (
    <Card
      className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer"
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <RiBookLine className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg line-clamp-1">
                {knowledge.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {knowledge.document_count}{' '}
                {language === 'ko' ? '개의 문서' : 'documents'}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              onClick={(e) => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted">
                <RiMoreFill className="h-4 w-4" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-destructive"
              >
                <RiDeleteBinLine className="mr-2 h-4 w-4" />
                {language === 'ko' ? '삭제' : 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {knowledge.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {knowledge.description}
          </p>
        )}

        {/* 문서 목록 표시 */}
        {documents.length > 0 && (
          <div className="mb-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDocuments(!showDocuments);
              }}
              className="text-sm text-primary hover:underline mb-2"
            >
              {showDocuments
                ? language === 'ko'
                  ? '문서 목록 숨기기'
                  : 'Hide documents'
                : language === 'ko'
                  ? '문서 목록 보기'
                  : 'Show documents'}
            </button>
            {showDocuments && (
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                {documents.map((doc) => (
                  <div
                    key={doc.document_id}
                    className="flex items-center gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <RiFileLine className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {doc.original_filename}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={
                            doc.status === 'done'
                              ? 'default'
                              : doc.status === 'processing'
                              ? 'secondary'
                              : 'destructive'
                          }
                          className="text-xs"
                        >
                          {doc.status === 'done'
                            ? language === 'ko'
                              ? '완료'
                              : 'Done'
                            : doc.status === 'processing'
                            ? language === 'ko'
                              ? '처리중'
                              : 'Processing'
                            : language === 'ko'
                            ? '실패'
                            : 'Failed'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(doc.file_size)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-3">
          {knowledge.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="text-xs text-muted-foreground">
          {language === 'ko' ? '업데이트' : 'Updated'}{' '}
          {formatDate(knowledge.updated_at)}
        </div>
      </div>
    </Card>
  );
}
