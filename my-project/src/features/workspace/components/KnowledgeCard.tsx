import { RiBookLine, RiDeleteBinLine, RiMoreFill } from '@remixicon/react';
import { Tag as TagIcon } from 'lucide-react';
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
  language?: 'en' | 'ko';
}

export function KnowledgeCard({
  knowledge,
  onClick,
  onDelete,
  language: _language = 'ko',
}: KnowledgeCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ko,
      });
    } catch {
      return dateString;
    }
  };


  return (
    <Card
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-[0_20px_60px_rgba(55,53,195,0.16)] hover:-translate-y-2 cursor-pointer h-[190px] bg-white/80 border border-white/70 backdrop-blur-md shadow-[0_15px_50px_rgba(55,53,195,0.08)] gap-0"
      onClick={onClick}
    >
      <div className="absolute inset-x-0 top-0 h-1.5 bg-[#5f5bff]" />
      <div className="p-5 h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#3735c3]/10 text-[#3735c3] shadow-inner">
              <RiBookLine className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base line-clamp-1">
                {knowledge.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {knowledge.document_count}{' '}
                개의 문서
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
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {knowledge.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {knowledge.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-3 mt-auto">
          {knowledge.tags && knowledge.tags.length > 0 ? (
            knowledge.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[11px] px-2 py-0.5 h-5 rounded-full border border-indigo-100 bg-indigo-50/70 text-indigo-700">
                <TagIcon className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))
          ) : (
            <Badge variant="secondary" className="text-[11px] px-2 py-0.5 h-5 rounded-full border border-indigo-100 bg-indigo-50/70 text-indigo-700">
              <TagIcon className="h-3 w-3 mr-1" />
              태그 없음
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-gray-500">
          <span>업데이트 {formatDate(knowledge.updated_at)}</span>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              className="px-3 py-1 rounded-full bg-[#3735c3]/10 text-[#3735c3] font-semibold hover:bg-[#3735c3]/15"
            >
              열기
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 font-semibold hover:bg-rose-100"
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
