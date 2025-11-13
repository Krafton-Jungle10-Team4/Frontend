import type {
  NodeProps,
  KnowledgeRetrievalNodeType,
} from '@/shared/types/workflow.types';
import { memo, useMemo } from 'react';
import { useDocumentsArray } from '@/features/documents/stores/selectors';

type RetrievalModeValue = 'semantic' | 'keyword' | 'hybrid';

const RETRIEVAL_MODE_LABELS: Record<RetrievalModeValue, string> = {
  semantic: 'Semantic Search',
  keyword: 'Keyword Search',
  hybrid: 'Hybrid Search',
};

const formatRetrievalMode = (mode?: string): string => {
  const normalized = (mode || '').toLowerCase();
  if (normalized.startsWith('keyword')) return RETRIEVAL_MODE_LABELS.keyword;
  if (normalized.startsWith('hybrid')) return RETRIEVAL_MODE_LABELS.hybrid;
  return RETRIEVAL_MODE_LABELS.semantic;
};

/**
 * Knowledge Retrieval 노드
 * 지식 베이스 검색 (RAG)
 */
const KnowledgeRetrievalNode = ({
  data,
}: NodeProps<KnowledgeRetrievalNodeType>) => {
  const { dataset, retrievalMode, documentIds } = data;
  const documents = useDocumentsArray();

  // documentIds로 실제 문서 정보 찾기 (null 체크 포함)
  const selectedDocuments = useMemo(() => {
    if (!documentIds || documentIds.length === 0) return [];
    return documents.filter((doc) => documentIds.includes(doc.id));
  }, [documentIds, documents]);

  return (
    <div className="px-3 py-1">
      {/* 선택된 문서 정보 */}
      {selectedDocuments.length > 0 && (
        <div className="mb-1 rounded-md bg-workflow-block-parma-bg px-2 py-1">
          <div className="system-2xs-regular-uppercase text-text-tertiary">
            DOCUMENTS
          </div>
          <div className="system-xs-medium text-text-primary mt-0.5">
            {selectedDocuments.length}개 선택
          </div>
          <div className="text-xs text-gray-500 mt-0.5 space-y-0.5">
            {selectedDocuments.slice(0, 2).map((doc) => (
              <div key={doc.id} className="truncate">
                • {doc.filename}
              </div>
            ))}
            {selectedDocuments.length > 2 && (
              <div>외 {selectedDocuments.length - 2}개</div>
            )}
          </div>
        </div>
      )}

      {/* 데이터셋 정보 */}
      {dataset && (
        <div className="mb-1 rounded-md bg-workflow-block-parma-bg px-2 py-1">
          <div className="system-2xs-regular-uppercase text-text-tertiary">
            DATASET
          </div>
          <div className="system-xs-medium text-text-primary mt-0.5">
            {dataset}
          </div>
        </div>
      )}

      {/* 검색 모드 */}
      {retrievalMode && (
        <div>
          <div className="system-2xs-regular-uppercase text-text-tertiary">
            MODE
          </div>
          <div className="system-xs-regular text-text-secondary mt-0.5">
            {formatRetrievalMode(retrievalMode)}
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeRetrievalNode;
