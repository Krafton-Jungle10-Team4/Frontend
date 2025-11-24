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
      <div className="relative min-h-[calc(100vh-56px)] bg-gradient-to-b from-white via-slate-50 to-indigo-50/35 text-slate-900">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(99,102,241,0.14),transparent_32%),radial-gradient(circle_at_82%_5%,rgba(14,165,233,0.12),transparent_30%),radial-gradient(circle_at_60%_70%,rgba(168,85,247,0.14),transparent_36%)]" />
        <main className="relative w-full flex-1 flex-col gap-6 px-4 md:px-8 py-8">
          <div className="flex flex-wrap items-center gap-3 px-2">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-500">Knowledge</p>
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">Knowledge Base</h1>
              <p className="text-sm text-slate-600">Landing 톤의 밝은 글래스 스타일로 문서를 관리하고 검색하세요.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 ml-auto text-xs">
              {['Notion', 'Google Drive', 'Web'].map((source) => (
                <span
                  key={source}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-semibold text-slate-700"
                >
                  <span className="h-2 w-2 rounded-full bg-[#3735c3]" />
                  {source}
                </span>
              ))}
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-semibold text-slate-700">
                총 {sortedKnowledge.length}개
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/70 bg-white/85 shadow-[0_14px_40px_rgba(55,53,195,0.12)] backdrop-blur px-4 py-4">
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

          <div className="rounded-2xl border border-white/70 bg-white/85 shadow-[0_14px_40px_rgba(55,53,195,0.12)] backdrop-blur p-4 md:p-5">
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
        </main>
      </div>

      <DocumentUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />
    </>
  );
}
