import { Button } from '@shared/components/button';
import type { Knowledge } from '@/data/mockKnowledge';
import type { Language } from '@shared/types';
import { RiBookLine, RiDeleteBinLine, RiMoreFill } from '@remixicon/react';
import { Tag as TagIcon, Upload, Clock, FileText } from 'lucide-react';
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
          <Button onClick={() => window.location.reload()}>다시 시도</Button>
        </div>
      </div>
    );
  }

  const uploadCard = (
    <div
      className="group flex h-full min-h-[150px] w-full flex-col items-center justify-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-4 text-center transition hover:border-indigo-200 hover:bg-slate-50"
      onClick={onImportFromFile}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onImportFromFile();
        }
      }}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-transform group-hover:scale-110">
        <Upload className="h-5 w-5" />
      </div>
      <p className="text-sm font-semibold text-slate-900">파일에서 가져오기</p>
      <p className="text-xs text-slate-600 leading-relaxed">
        완료된 문서를 추가하고 목록을 곧바로 확인하세요.
      </p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {uploadCard}
        {knowledgeList.map((knowledge) => (
          <div
            key={knowledge.id}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
            onClick={() => onKnowledgeClick(knowledge.id)}
          >
            <div className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-indigo-600">
                  <RiBookLine className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">{knowledge.name}</p>
                      <p className="text-xs text-slate-500 line-clamp-2">{knowledge.description}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:border-indigo-300 hover:text-indigo-700"
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
              </div>

                <div className="flex flex-wrap gap-1.5">
                {knowledge.tags && knowledge.tags.length > 0 ? (
                  knowledge.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-700"
                    >
                      <TagIcon className="h-3 w-3" />
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600">
                    <TagIcon className="h-3 w-3" />
                    태그 없음
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 font-semibold text-indigo-700">
                  <FileText className="h-3.5 w-3.5" />
                  {knowledge.document_count} 문서
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  업데이트 {formatDate(knowledge.updated_at)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
