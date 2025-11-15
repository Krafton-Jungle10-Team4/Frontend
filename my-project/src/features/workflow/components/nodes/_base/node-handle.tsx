import { memo } from 'react';
import type { CSSProperties } from 'react';
import { Handle, Position } from '@xyflow/react';
import { BlockEnum } from '@/shared/types/workflow.types';
import type { CommonNodeType } from '@/shared/types/workflow.types';
import clsx from 'clsx';

type NodeHandleProps = {
  data: CommonNodeType;
  handleId: string;
  handleClassName?: string;
  style?: CSSProperties;
  label?: string;
};

/**
 * 노드 타겟 핸들 (입력 연결점)
 * 노드의 왼쪽에 위치하여 다른 노드로부터 연결을 받음
 */
export const NodeTargetHandle = memo(
  ({ data, handleId, handleClassName, style }: NodeHandleProps) => {
    const connected = data._connectedTargetHandleIds?.includes(handleId);

    return (
      <Handle
        id={handleId}
        type="target"
        position={Position.Left}
        className={clsx(
          'z-[1] !h-3 !w-3 !rounded-full !border-2 !border-gray-400 !bg-white !outline-none shadow-md',
          'transition-all hover:scale-125 hover:!border-blue-500 hover:!bg-blue-100',
          connected && '!border-teal-500 !bg-teal-100',
          data.type === BlockEnum.Start && 'opacity-0',
          handleClassName
        )}
        style={style}
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
  ({ data, handleId, handleClassName, style, label }: NodeHandleProps) => {
    const connected = data._connectedSourceHandleIds?.includes(handleId);

    return (
      <Handle
        id={handleId}
        type="source"
        position={Position.Right}
        className={clsx(
          'z-[1] !h-3 !w-3 !rounded-full !border-2 !border-gray-400 !bg-white !outline-none shadow-md',
          'transition-all hover:scale-125 hover:!border-blue-500 hover:!bg-blue-100',
          connected && '!border-teal-500 !bg-teal-100',
          handleClassName
        )}
        style={style}
        title={label}
        isConnectable={true}
      />
    );
  }
);
NodeSourceHandle.displayName = 'NodeSourceHandle';
