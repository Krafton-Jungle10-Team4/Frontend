import type { NodeProps, IfElseNodeType } from '@/shared/types/workflow.types';
import { memo } from 'react';

/**
 * IF-ELSE 노드
 * 조건 분기 처리
 */
const IfElseNode = ({ data }: NodeProps<IfElseNodeType>) => {
  const { cases = [] } = data;

  return (
    <div className="px-3 py-2 space-y-2">
      {/* 케이스 요약 */}
      {cases.length === 0 ? (
        <div className="text-xs text-gray-400 italic">조건 없음</div>
      ) : (
        <div className="space-y-1.5">
          {cases.map((caseItem, idx) => (
            <div
              key={caseItem.case_id}
              className="rounded-md bg-workflow-block-parma-bg px-2.5 py-1.5"
            >
              <div className="system-2xs-regular-uppercase text-text-tertiary">
                {idx === 0 ? 'IF' : `ELIF ${idx}`}
              </div>
              <div className="system-xs-medium text-text-primary mt-1">
                {caseItem.conditions.length === 0 ? (
                  <span className="text-gray-400">조건 없음</span>
                ) : (
                  <>
                    {caseItem.conditions.length}개 조건
                    <span className="text-xs text-gray-500 ml-1">
                      ({caseItem.logical_operator.toUpperCase()})
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}

          {/* ELSE 표시 */}
          <div className="rounded-md bg-workflow-block-parma-bg px-2.5 py-1.5">
            <div className="system-2xs-regular-uppercase text-text-tertiary">
              ELSE
            </div>
            <div className="system-xs-medium text-gray-400 mt-1">
              기본 경로
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(IfElseNode);
