import { useState, useMemo, useEffect, useCallback } from 'react';
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

  const fetchDocuments = useCallback(async () => {
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
  }, []);

  // 문서 목록 조회 (Document API 사용)
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments, searchQuery, selectedTags, language]);

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

  const handleUploadComplete = () => {
    void fetchDocuments();
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
      <div className="relative min-h-[calc(100vh-56px)] bg-[#f7f8fa] text-slate-900">
        <main className="relative w-full flex-1 flex-col gap-6 px-5 md:px-8 lg:px-10 py-8">
          <div className="relative w-full px-5 py-6">
            <div className="relative grid gap-6 items-start lg:items-start lg:grid-cols-[1.4fr_1fr]">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-gray-900 tracking-tight">KNOWLEDGE</span>
                  <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 shadow-sm">
                    {sortedKnowledge.length} 문서
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  업로드된 지식을 한곳에서 관리하고 빠르게 검색하세요.
                </p>
              </div>

              <div className="space-y-3 self-start w-full">
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-white p-2.5 shadow-[0_8px_20px_rgba(55,53,195,0.12)] min-h-[96px] flex flex-col justify-between">
                    <div className="relative space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-500">문서</p>
                      <p className="text-2xl font-bold text-slate-900">{sortedKnowledge.length}</p>
                      <p className="text-xs text-slate-500">업로드된 완료 문서</p>
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/80 p-2.5 shadow-[0_8px_20px_rgba(55,53,195,0.12)] min-h-[96px] flex flex-col justify-between">
                    <div className="relative space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-500">태그</p>
                      <p className="text-2xl font-bold text-slate-900">{allTags.length || 0}개</p>
                      <p className="text-xs text-slate-500">상태 / 확장자 기반 필터</p>
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

            <div className="relative overflow-hidden rounded-3xl p-4 md:p-5">
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
        onUploadComplete={handleUploadComplete}
      />
    </>
  );
}
