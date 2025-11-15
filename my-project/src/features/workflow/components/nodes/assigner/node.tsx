import type { NodeProps, AssignerNodeType } from '@/shared/types/workflow.types';
import { memo } from 'react';
import { Badge } from '@shared/components/badge';
import { WRITE_MODE_LABELS } from './types';

/**
 * Assigner 노드
 * 변수 값을 동적으로 조작하는 노드
 * - 다중 작업 지원 (v2)
 * - 11가지 작업 타입 (덮어쓰기, 산술, 배열 조작 등)
 */
const AssignerNode = ({ data }: NodeProps<AssignerNodeType>) => {
  const validOperations = data.operations?.filter((op) => op.write_mode) || [];

  if (validOperations.length === 0) {
    return (
      <div className="px-3 py-2">
        <div className="text-xs text-muted-foreground">
          작업이 설정되지 않음
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-2 space-y-2">
      {/* 작업 개수 표시 */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-text-secondary">
          {validOperations.length}개 작업
        </span>
      </div>

      {/* 작업 목록 요약 */}
      <div className="space-y-1.5">
        {validOperations.slice(0, 3).map((op, index) => (
          <div
            key={op.id}
            className="rounded-md bg-workflow-block-parma-bg px-2.5 py-1.5"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                {op.target_variable?.port_name && (
                  <div className="system-xs-medium text-text-primary truncate">
                    {op.target_variable.port_name}
                  </div>
                )}
              </div>
              <Badge
                variant="secondary"
                className="text-2xs shrink-0"
              >
                {WRITE_MODE_LABELS[op.write_mode]}
              </Badge>
            </div>
          </div>
        ))}

        {/* 3개 초과 시 더보기 표시 */}
        {validOperations.length > 3 && (
          <div className="text-xs text-muted-foreground text-center">
            +{validOperations.length - 3}개 더보기
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(AssignerNode);
