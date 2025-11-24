import type { NodeProps, StartNodeType } from '@/shared/types/workflow.types';
import { memo } from 'react';
import { OutputVarList } from '../../variable/OutputVarList';

/**
 * Start 노드
 * 워크플로우의 시작점
 * - 워크플로우 메타데이터 설정
 * - 입력 포트 표시 (query, session_id 등)
 */
const StartNode = ({ id, data }: NodeProps<StartNodeType>) => {
  // 포트가 정의되어 있고 outputs가 있으면 표시
  if (!data.ports?.outputs || data.ports.outputs.length === 0) {
    return <></>;
  }

  return (
    <div className="px-3 py-2">
      <div className="rounded-md bg-workflow-block-parma-bg px-2.5 py-1.5">
        <div className="system-2xs-regular-uppercase text-text-tertiary mb-2">
          시작값
        </div>
        <div className="space-y-1.5">
          {data.ports.outputs.map((port) => (
            <div
              key={port.name}
              className="flex items-center gap-2 rounded-md bg-gray-100 dark:bg-gray-700 px-2 py-1.5"
            >
              <div className="flex-1">
                <div className="system-xs-semibold text-text-primary">
                  {port.display_name || port.name}
                </div>
                {port.description && (
                  <div className="system-2xs-regular text-text-secondary mt-0.5">
                    {port.description}
                  </div>
                )}
              </div>
              <div className="text-xs text-text-tertiary font-mono">
                {port.type}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(StartNode);
