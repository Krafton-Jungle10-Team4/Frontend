import type { NodeProps, TavilySearchNodeType } from '@/shared/types/workflow.types';
import { memo } from 'react';

/**
 * Tavily Search 노드
 * 실시간 웹 검색 (Tavily API)
 */
const TavilySearchNode = ({ data }: NodeProps<TavilySearchNodeType>) => {
  return (
    <div className="px-3 py-1">
      {/* 검색 옵션 정보 */}
      {(data.search_depth || data.topic) && (
        <div className="mb-1 rounded-md bg-workflow-block-parma-bg px-2 py-1">
          <div className="system-2xs-regular-uppercase text-text-tertiary">
            SEARCH OPTIONS
          </div>
          <div className="system-xs-regular text-text-secondary mt-0.5 space-y-0.5">
            {data.search_depth && (
              <div>
                Depth: {data.search_depth === 'basic' ? 'Basic' : 'Advanced'}
              </div>
            )}
            {data.topic && (
              <div>
                Topic: {data.topic.charAt(0).toUpperCase() + data.topic.slice(1)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 결과 개수 */}
      {data.max_results !== undefined && (
        <div>
          <div className="system-2xs-regular-uppercase text-text-tertiary">
            MAX RESULTS
          </div>
          <div className="system-xs-regular text-text-secondary mt-0.5">
            {data.max_results}개
          </div>
        </div>
      )}

      {/* 추가 옵션 표시 */}
      {(data.include_answer || data.include_raw_content) && (
        <div className="mt-1">
          <div className="system-2xs-regular-uppercase text-text-tertiary">
            CONTENT
          </div>
          <div className="system-xs-regular text-text-secondary mt-0.5">
            {data.include_answer && <div>• AI Answer</div>}
            {data.include_raw_content && <div>• Raw Content</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(TavilySearchNode);
