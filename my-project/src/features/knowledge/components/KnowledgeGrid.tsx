import { CreateKnowledgeCard } from './CreateKnowledgeCard';
import { KnowledgeCard } from '@/features/workspace/components/KnowledgeCard';
import { Button } from '@shared/components/button';
import type { Knowledge } from '@/data/mockKnowledge';
import type { Language } from '@shared/types';

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      <CreateKnowledgeCard onImportFromFile={onImportFromFile} />

      {knowledgeList.map((knowledge) => (
        <KnowledgeCard
          key={knowledge.id}
          knowledge={knowledge}
          onClick={() => onKnowledgeClick(knowledge.id)}
          onDelete={() => onDeleteKnowledge(knowledge.id)}
          language={_language}
        />
      ))}
    </div>
  );
}
