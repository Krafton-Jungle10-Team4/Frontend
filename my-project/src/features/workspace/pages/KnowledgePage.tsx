import { useState, useMemo, useEffect } from 'react';
import { KnowledgeSearchBar } from '@/features/knowledge/components/KnowledgeSearchBar';
import { KnowledgeGrid } from '@/features/knowledge/components/KnowledgeGrid';
import type { Knowledge } from '@/data/mockKnowledge';
import { useUIStore } from '@shared/stores/uiStore';
import { DocumentUploadModal } from '@/features/documents/components/monitoring/DocumentUploadModal';
import { documentsApi } from '@/features/documents/api/documentsApi';

export function KnowledgePage() {
  const { language } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [knowledgeList, setKnowledgeList] = useState<Knowledge[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const activeTagCount = selectedTags.length;

  // 문서 목록 조회 (Document API 사용)
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await documentsApi.listDocuments({
          status: 'done', // 완료된 문서만 조회
          limit: 100,
          offset: 0,
        });

        // Document를 Knowledge 형식으로 변환
        const knowledgeList: Knowledge[] = response.documents.map((doc) => {
          const tags = [doc.status];
          if (doc.file_extension) {
            tags.push(doc.file_extension.toUpperCase());
          }

          return {
            id: doc.document_id,
            user_id: '', // Document API에는 user_id가 없음
            name: doc.original_filename,
            description: `${doc.file_extension.toUpperCase()} 파일 (${(doc.file_size / 1024).toFixed(2)} KB)`,
            tags,
            document_count: 1,
            documents: [doc],
            created_at: doc.created_at,
            updated_at: doc.updated_at || doc.created_at,
          };
        });

        setKnowledgeList(knowledgeList);

        // 태그 목록 추출 (상태 / 파일 확장자)
        const tagSet = new Set<string>();
        knowledgeList.forEach((k) => k.tags.forEach((tag) => tagSet.add(tag)));
        setAllTags(Array.from(tagSet));
      } catch (err) {
        console.error('Failed to fetch documents:', err);
        setError('문서 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [searchQuery, selectedTags, language]);

  const filteredKnowledge = useMemo(() => {
    return knowledgeList.filter((knowledge) => {
      if (
        searchQuery &&
        !knowledge.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !knowledge.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      if (
        selectedTags.length > 0 &&
        !selectedTags.some((tag) => knowledge.tags.includes(tag))
      ) {
        return false;
      }

      return true;
    });
  }, [knowledgeList, searchQuery, selectedTags]);

  const sortedKnowledge = useMemo(() => {
    const sorted = [...filteredKnowledge];
    if (sortBy === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      sorted.sort((a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    }
    return sorted;
  }, [filteredKnowledge, sortBy]);

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleImportFromFile = () => {
    setUploadModalOpen(true);
  };

  const handleKnowledgeClick = (knowledgeId: string) => {
    console.log('Knowledge clicked:', knowledgeId);
  };

  const handleDeleteKnowledge = async (documentId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      await documentsApi.deleteDocument(documentId);
      
      // 목록에서 제거
      setKnowledgeList((prev) => prev.filter((k) => k.id !== documentId));
      
      console.log('Document deleted:', documentId);
    } catch (err) {
      console.error('Failed to delete document:', err);
      alert('문서 삭제에 실패했습니다.');
    }
  };

  return (
    <>
      <div className="relative min-h-[calc(100vh-56px)] bg-gradient-to-b from-[#f7f8fa] via-[#eef0f4] to-[#e8eaee] text-slate-900">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(124,128,148,0.12),transparent_32%),radial-gradient(circle_at_82%_5%,rgba(152,156,172,0.1),transparent_30%),radial-gradient(circle_at_60%_70%,rgba(118,122,142,0.1),transparent_36%)]" />
        <div className="pointer-events-none absolute -left-24 top-12 h-64 w-64 rounded-full bg-slate-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-12 h-72 w-72 rounded-full bg-slate-300/35 blur-3xl" />
        <main className="relative w-full flex-1 flex-col gap-6 px-5 md:px-8 lg:px-10 py-8">
          <div className="relative w-full px-5 py-6">
            <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden>
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />
              <div className="absolute -left-10 top-8 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-100 via-white to-transparent blur-3xl" />
              <div className="absolute -right-6 bottom-6 h-28 w-28 rounded-full bg-gradient-to-br from-sky-100 via-white to-transparent blur-2xl" />
            </div>
            <div className="relative grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-center">
              <div className="space-y-3">
                <p className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-500 shadow-sm">
                  Knowledge
                  <span className="h-1 w-1 rounded-full bg-indigo-400" />
                </p>
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">지식 관리</h1>
                <p className="text-sm text-slate-600">
                  Landing 톤의 밝은 글래스 스타일로 문서를 관리하고 검색하세요.
                </p>
                <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold text-slate-600">
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/80 bg-white px-3 py-1 shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#3735c3]" />
                    정렬 · 태그 · 검색
                  </span>
                  {activeTagCount > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-indigo-700 shadow-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                      선택된 태그 {activeTagCount}개
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 justify-end text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-white px-3 py-1 font-semibold text-slate-700 shadow-[0_10px_28px_rgba(55,53,195,0.12)]">
                    <span className="h-2 w-2 rounded-full bg-[#3735c3]" />
                    Web
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br from-white via-indigo-50/70 to-white p-4 shadow-[0_16px_40px_rgba(55,53,195,0.12)]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.12),transparent_40%)]" />
                    <div className="relative space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-500">Documents</p>
                      <p className="text-2xl font-bold text-slate-900">{sortedKnowledge.length}</p>
                      <p className="text-xs text-slate-600">업로드된 완료 문서</p>
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/80 p-4 shadow-[0_16px_40px_rgba(55,53,195,0.12)]">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-indigo-50/70" />
                    <div className="relative space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Tags</p>
                      <p className="text-xl font-semibold text-slate-900">{allTags.length || 0}개</p>
                      <p className="text-xs text-slate-600">상태 / 확장자 기반 필터</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative w-full space-y-4">
            <div className="relative px-1 md:px-2 lg:px-3 py-3 md:py-4">
              <KnowledgeSearchBar
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                tags={allTags}
                selectedTags={selectedTags}
                onTagToggle={handleTagClick}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-[0_18px_48px_rgba(55,53,195,0.15)] backdrop-blur p-4 md:p-5">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(168,85,247,0.08),transparent_40%)]" />
              <KnowledgeGrid
                knowledgeList={sortedKnowledge}
                loading={loading}
                error={error}
                language={language}
                onImportFromFile={handleImportFromFile}
                onKnowledgeClick={handleKnowledgeClick}
                onDeleteKnowledge={handleDeleteKnowledge}
              />
            </div>
          </div>
        </main>
      </div>

      <DocumentUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />
    </>
  );
}
