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
      <div className="flex flex-col h-[calc(100vh-56px)]">
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 via-white to-indigo-50/40">
          <div className="mx-auto max-w-7xl px-6 pt-10 pb-12 space-y-8">
            <div className="rounded-3xl border border-white/70 bg-white/80 backdrop-blur-xl shadow-[0_18px_60px_rgba(55,53,195,0.12)] px-6 py-6 lg:px-8 lg:py-7 space-y-4">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3735c3]">Knowledge</p>
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">Knowledge Base</h1>
                <p className="text-gray-600">연결된 소스의 문서를 한 곳에서 정리하고 관리하세요.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Notion', 'Google Drive', 'Web'].map((source) => (
                  <span
                    key={source}
                    className="inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50/70 px-3 py-1 text-xs font-semibold text-[#3735c3] shadow-sm"
                  >
                    <span className="h-2 w-2 rounded-full bg-[#3735c3]" />
                    {source}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
              <div className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur-xl shadow-[0_16px_50px_rgba(55,53,195,0.1)] p-5">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">필터 & 정렬</h3>
                  <p className="text-sm text-gray-600">소스, 태그, 상태별로 필요한 지식을 빠르게 찾아보세요.</p>
                </div>
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

              <div className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur-xl shadow-[0_16px_50px_rgba(55,53,195,0.1)] p-5">
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
