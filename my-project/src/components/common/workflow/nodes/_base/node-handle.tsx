import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { BlockEnum, NodeRunningStatus } from '@/types/workflow';
import type { CommonNodeType } from '@/types/workflow';
import clsx from 'clsx';

type NodeHandleProps = {
  data: CommonNodeType;
  handleId: string;
  handleClassName?: string;
};

/**
 * 노드 타겟 핸들 (입력 연결점)
 * 노드의 왼쪽에 위치하여 다른 노드로부터 연결을 받음
 */
export const NodeTargetHandle = memo(
  ({ data, handleId, handleClassName }: NodeHandleProps) => {
    const connected = data._connectedTargetHandleIds?.includes(handleId);

    return (
      <Handle
        id={handleId}
        type="target"
        position={Position.Left}
        className={clsx(
          'z-[1] !h-4 !w-4 !rounded-none !border-none !bg-transparent !outline-none',
          'after:absolute after:left-1.5 after:top-1 after:h-2 after:w-0.5 after:bg-workflow-link-line-handle',
          'transition-all hover:scale-125',
          data._runningStatus === NodeRunningStatus.Succeeded &&
            'after:bg-workflow-link-line-success-handle',
          data._runningStatus === NodeRunningStatus.Failed &&
            'after:bg-workflow-link-line-error-handle',
          data._runningStatus === NodeRunningStatus.Exception &&
            'after:bg-workflow-link-line-failure-handle',
          !connected && 'after:opacity-0',
          data.type === BlockEnum.Start && 'opacity-0',
          handleClassName
        )}
        isConnectable={true}
      />
    );
  }
);
NodeTargetHandle.displayName = 'NodeTargetHandle';

/**
 * 노드 소스 핸들 (출력 연결점)
 * 노드의 오른쪽에 위치하여 다른 노드로 연결을 생성
 */
export const NodeSourceHandle = memo(
  ({ data, handleId, handleClassName }: NodeHandleProps) => {
    const connected = data._connectedSourceHandleIds?.includes(handleId);

    return (
      <Handle
        id={handleId}
        type="source"
        position={Position.Right}
        className={clsx(
          'group/handle z-[1] !h-4 !w-4 !rounded-none !border-none !bg-transparent !outline-none',
          'after:absolute after:right-1.5 after:top-1 after:h-2 after:w-0.5 after:bg-workflow-link-line-handle',
          'transition-all hover:scale-125',
          data._runningStatus === NodeRunningStatus.Succeeded &&
            'after:bg-workflow-link-line-success-handle',
          data._runningStatus === NodeRunningStatus.Failed &&
            'after:bg-workflow-link-line-error-handle',
          data._runningStatus === NodeRunningStatus.Exception &&
            'after:bg-workflow-link-line-failure-handle',
          !connected && 'after:opacity-0',
          handleClassName
        )}
        isConnectable={true}
      />
    );
  }
);
NodeSourceHandle.displayName = 'NodeSourceHandle';
