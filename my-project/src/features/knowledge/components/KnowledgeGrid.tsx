import { Button } from '@shared/components/button';
import { Badge } from '@shared/components/badge';
import { cn } from '@/shared/components/utils';
import type { Knowledge } from '@/data/mockKnowledge';
import type { Language } from '@shared/types';
import { RiBookLine, RiDeleteBinLine, RiMoreFill } from '@remixicon/react';
import { Tag as TagIcon, Clock, FileText, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shared/components/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface KnowledgeGridProps {
  knowledgeList: Knowledge[];
  loading: boolean;
  error: string | null;
  language?: Language;
  onKnowledgeClick: (knowledgeId: string) => void;
  onDeleteKnowledge: (knowledgeId: string) => void;
}

export function KnowledgeGrid({
  knowledgeList,
  loading,
  error,
  language: _language = 'ko',
  onKnowledgeClick,
  onDeleteKnowledge,
}: KnowledgeGridProps) {
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

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>다시 시도</Button>
        </div>
      </div>
    );
  }

  if (knowledgeList.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-sm text-gray-500">등록된 문서가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {knowledgeList.map((knowledge) => (
        <div
          key={knowledge.id}
          className={cn(
            'group relative bg-white rounded-lg border border-gray-200 p-4',
            'shadow-sm transition-all duration-200 cursor-pointer',
            'hover:border-gray-300 hover:shadow-sm'
          )}
          onClick={() => onKnowledgeClick(knowledge.id)}
        >
          {/* 헤더: 아이콘 + 제목 + 시간 + 메뉴 */}
          <div className="flex justify-between items-start mb-2 gap-2">
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border border-indigo-100 bg-indigo-50">
                <RiBookLine className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold leading-tight text-gray-900 line-clamp-1">
                  {knowledge.name}
                </h3>
                <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                  <span>{formatDate(knowledge.updated_at)}</span>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors -mr-1 -mt-1 opacity-0 group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteKnowledge(knowledge.id);
                  }}
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <RiDeleteBinLine className="mr-2 h-4 w-4" />
                  삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* 설명 */}
          <p className="text-xs text-gray-500 line-clamp-2 mb-3 min-h-[32px]">
            {knowledge.description || '설명이 없습니다.'}
          </p>

          {/* 하단: 문서 수 + 태그 */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-50 text-[10px] font-semibold text-indigo-700">
              <FileText className="h-3.5 w-3.5" />
              {knowledge.document_count} 문서
            </span>
            <div className="flex flex-wrap gap-1 justify-end">
              {knowledge.tags && knowledge.tags.length > 0 ? (
                <>
                  {knowledge.tags.slice(0, 2).map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0.5 rounded cursor-default bg-gray-100 text-gray-700 border border-gray-200"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {knowledge.tags.length > 2 && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0.5 rounded cursor-default bg-gray-100 text-gray-700 border border-gray-200"
                    >
                      +{knowledge.tags.length - 2}
                    </Badge>
                  )}
                </>
              ) : (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0.5 rounded cursor-default bg-gray-100 text-gray-600 border border-gray-200"
                >
                  태그 없음
                </Badge>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
