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
        <main className="flex-1 overflow-y-auto bg-gray-100">
          <div className="px-10 pt-8 pb-6">
            <div className="mb-6">
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
