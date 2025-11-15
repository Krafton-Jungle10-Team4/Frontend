import type { NodeProps, IfElseNodeType } from '@/shared/types/workflow.types';
import { memo } from 'react';
import { NodeSourceHandle } from '../_base/node-handle';

/**
 * IF-ELSE 노드
 * 조건 분기 처리
 */
const IfElseNode = ({ data }: NodeProps<IfElseNodeType>) => {
  // 안전한 데이터 접근
  const cases = data?.cases ?? [];

  return (
    <div className="px-3 py-2 space-y-2">
      {/* 케이스 요약 */}
      {cases.length === 0 ? (
        <div className="text-xs text-gray-400 italic">조건 없음</div>
      ) : (
        <div className="space-y-1.5">
          {cases.map((caseItem, idx) => {
            const handleId = idx === 0 ? 'if' : `elif_${idx}`;
            const label = idx === 0 ? 'IF' : `ELIF ${idx}`;
            return (
              <div
                key={caseItem.case_id}
                className="relative rounded-md bg-workflow-block-parma-bg px-2.5 py-1.5 pr-8"
              >
                <NodeSourceHandle
                  data={data}
                  handleId={handleId}
                  handleClassName="!absolute -right-3 top-1/2 -translate-y-1/2"
                  label={label}
                />
                <div className="system-2xs-regular-uppercase text-text-tertiary">
                  {label}
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
            );
          })}

          {/* ELSE 표시 */}
          <div className="relative rounded-md bg-workflow-block-parma-bg px-2.5 py-1.5 pr-8">
            <NodeSourceHandle
              data={data}
              handleId="else"
              handleClassName="!absolute -right-3 top-1/2 -translate-y-1/2"
              label="ELSE"
            />
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
