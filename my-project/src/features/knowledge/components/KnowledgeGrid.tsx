import { CreateKnowledgeCard } from './CreateKnowledgeCard';
import { Button } from '@shared/components/button';
import type { Knowledge } from '@/data/mockKnowledge';
import type { Language } from '@shared/types';
import { RiBookLine, RiDeleteBinLine, RiMoreFill } from '@remixicon/react';
import { Tag as TagIcon } from 'lucide-react';
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
  onImportFromFile: () => void;
  onKnowledgeClick: (knowledgeId: string) => void;
  onDeleteKnowledge: (knowledgeId: string) => void;
}

export function KnowledgeGrid({
  knowledgeList,
  loading,
  error,
  language: _language = 'ko',
  onImportFromFile,
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
          <Button onClick={() => window.location.reload()}>
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CreateKnowledgeCard onImportFromFile={onImportFromFile} />

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_12px_40px_rgba(55,53,195,0.08)]">
        <div className="grid grid-cols-2 gap-3 border-b border-slate-100 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 md:grid-cols-[1.5fr_1fr_0.8fr_0.8fr_auto]">
          <span>지식</span>
          <span className="hidden md:block">태그</span>
          <span className="hidden md:block">문서 수</span>
          <span className="hidden md:block">업데이트</span>
          <span className="hidden md:block text-right">작업</span>
        </div>
        <div className="divide-y divide-slate-100">
          {knowledgeList.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-slate-500">
              업로드된 지식이 없습니다. 파일을 가져와 지식을 추가하세요.
            </div>
          ) : (
            knowledgeList.map((knowledge) => (
              <div
                key={knowledge.id}
                className="grid grid-cols-1 gap-3 px-4 py-3 transition hover:bg-indigo-50/50 md:grid-cols-[1.5fr_1fr_0.8fr_0.8fr_auto]"
                onClick={() => onKnowledgeClick(knowledge.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-slate-100">
                    <RiBookLine className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">{knowledge.name}</p>
                    <p className="text-xs text-slate-500 line-clamp-1">{knowledge.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {knowledge.tags && knowledge.tags.length > 0 ? (
                    knowledge.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-700"
                      >
                        <TagIcon className="h-3 w-3" />
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-600">
                      <TagIcon className="h-3 w-3" />
                      태그 없음
                    </span>
                  )}
                </div>

                <div className="text-sm text-slate-700">{knowledge.document_count} 문서</div>
                <div className="text-xs text-slate-500">업데이트 {formatDate(knowledge.updated_at)}</div>

                <div className="flex items-center justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:border-indigo-300 hover:text-indigo-700"
                    >
                      <RiMoreFill className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteKnowledge(knowledge.id);
                        }}
                        className="text-rose-600 focus:text-rose-600"
                      >
                        <RiDeleteBinLine className="mr-2 h-4 w-4" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
