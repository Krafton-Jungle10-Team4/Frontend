import type {
  NodeProps,
  KnowledgeRetrievalNodeType,
} from '../../../types/workflow.types';
import { memo } from 'react';

/**
 * Knowledge Retrieval 노드
 * 지식 베이스 검색 (RAG)
 */
const KnowledgeRetrievalNode = ({
  data,
}: NodeProps<KnowledgeRetrievalNodeType>) => {
  const { dataset, retrievalMode } = data;

  return (
    <div className="px-3 py-1">
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
            {retrievalMode}
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(KnowledgeRetrievalNode);
