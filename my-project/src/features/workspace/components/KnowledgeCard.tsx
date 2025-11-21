import { RiBookLine, RiDeleteBinLine, RiMoreFill } from '@remixicon/react';
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


  return (
    <Card
      className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer h-[160px]"
      onClick={onClick}
    >
      <div className="p-5 h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <RiBookLine className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base line-clamp-1">
                {knowledge.name}
              </h3>
              <p className="text-xs text-muted-foreground">
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
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
            {knowledge.description}
          </p>
        )}

        <div className="flex flex-wrap gap-1 mb-2 mt-auto">
          {knowledge.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0 h-4">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="text-[10px] text-muted-foreground">
          {language === 'ko' ? '업데이트' : 'Updated'}{' '}
          {formatDate(knowledge.updated_at)}
        </div>
      </div>
    </Card>
  );
}
