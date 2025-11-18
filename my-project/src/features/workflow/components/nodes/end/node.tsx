import type { NodeProps, EndNodeType } from '@/shared/types/workflow.types';

/**
 * End 노드
 * 워크플로우 종료점
 * - 입력 포트 표시 (response)
 */
const EndNode = ({ data }: NodeProps<EndNodeType>) => {
  // 포트가 정의되어 있고 inputs가 있으면 표시
  if (!data.ports?.inputs || data.ports.inputs.length === 0) {
    return <></>;
  }

  return (
    <div className="px-3 py-2">
      <div className="rounded-md bg-workflow-block-parma-bg px-2.5 py-1.5">
        <div className="system-2xs-regular-uppercase text-text-tertiary mb-2">
          출력값
        </div>
        <div className="space-y-1.5">
          {data.ports.inputs.map((port) => (
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

export default EndNode;
