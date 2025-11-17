import { useState, useMemo, useEffect } from 'react';
import { LeftActionPanel } from '../components/LeftActionPanel';
import { KnowledgeCard } from '../components/KnowledgeCard';
import { SearchBar } from '@shared/components/SearchBar';
import { TagBadge } from '@shared/components/TagBadge';
import { Button } from '@shared/components/button';
import { RiAddLine } from '@remixicon/react';
import type { Knowledge } from '@/data/mockKnowledge';
import { useUIStore } from '@shared/stores/uiStore';
import { DocumentUploadModal } from '@/features/documents/components/monitoring/DocumentUploadModal';
import { knowledgeApi } from '../api/knowledgeApi';

export function KnowledgePage() {
  const { language } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [knowledgeList, setKnowledgeList] = useState<Knowledge[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 지식 목록 조회
  useEffect(() => {
    const fetchKnowledge = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await knowledgeApi.getKnowledgeList({
          search: searchQuery || undefined,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
          include_documents: true,
        });
        setKnowledgeList(data);

        // 태그 목록 추출
        const tagSet = new Set<string>();
        data.forEach((k) => k.tags.forEach((tag) => tagSet.add(tag)));
        setAllTags(Array.from(tagSet));
      } catch (err) {
        console.error('Failed to fetch knowledge:', err);
        setError(
          language === 'ko'
            ? '지식 목록을 불러오는데 실패했습니다.'
            : 'Failed to load knowledge list.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchKnowledge();
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

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleTagRemove = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleCreateKnowledge = () => {
    console.log('Create knowledge');
  };

  const handleImportFromFile = () => {
    setUploadModalOpen(true);
  };

  const handleConnectExternal = () => {
    console.log('Connect external');
  };

  const handleKnowledgeClick = (knowledgeId: string) => {
    console.log('Knowledge clicked:', knowledgeId);
  };

  const handleDeleteKnowledge = (knowledgeId: string) => {
    console.log('Delete knowledge:', knowledgeId);
  };

  return (
    <div className="flex h-full overflow-hidden bg-muted/30 p-6 gap-6">
      <LeftActionPanel
        variant="knowledge"
        onCreateKnowledge={handleCreateKnowledge}
        onImportFromFile={handleImportFromFile}
        onConnectExternal={handleConnectExternal}
      />

      <div className="flex flex-1 flex-col overflow-hidden rounded-lg bg-background p-6 border border-gray-200/60 shadow-sm transition-all duration-200 hover:border-gray-300/80 hover:shadow-md">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {language === 'ko' ? '지식' : 'Knowledge'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'ko'
                ? '지식 베이스를 관리하고 문서를 업로드하세요.'
                : 'Manage your knowledge base and upload documents.'}
            </p>
          </div>

          <Button
            variant="outline"
            className="gap-2"
            onClick={handleConnectExternal}
          >
            <RiAddLine className="h-4 w-4" />
            {language === 'ko' ? '외부 지식 API' : 'External Knowledge API'}
          </Button>
        </div>

        <div className="mb-4 flex flex-col gap-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            className="max-w-md"
          />

          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground self-center">
              {language === 'ko' ? '태그:' : 'Tags:'}
            </span>
            {allTags.map((tag) => (
              <TagBadge
                key={tag}
                tag={tag}
                selected={selectedTags.includes(tag)}
                onClick={handleTagClick}
                onRemove={selectedTags.includes(tag) ? handleTagRemove : undefined}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">
                {language === 'ko' ? '로딩 중...' : 'Loading...'}
              </p>
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  {language === 'ko' ? '다시 시도' : 'Retry'}
                </Button>
              </div>
            </div>
          ) : filteredKnowledge.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  {language === 'ko'
                    ? '지식이 없습니다.'
                    : 'No knowledge found.'}
                </p>
                <Button onClick={handleCreateKnowledge}>
                  <RiAddLine className="mr-2 h-4 w-4" />
                  {language === 'ko' ? '지식 생성' : 'Create Knowledge'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredKnowledge.map((knowledge) => (
                <KnowledgeCard
                  key={knowledge.id}
                  knowledge={knowledge}
                  onClick={() => handleKnowledgeClick(knowledge.id)}
                  onDelete={() => handleDeleteKnowledge(knowledge.id)}
                  language={language}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <DocumentUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />
    </div>
  );
}
