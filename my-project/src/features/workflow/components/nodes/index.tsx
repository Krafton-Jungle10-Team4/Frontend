import { memo, useMemo } from 'react';
import type { NodeProps } from '@xyflow/react';
import type { CommonNodeType } from '@/shared/types/workflow.types';
import { NodeComponentMap } from './components';
import BaseNode from './_base/node';

/**
 * CustomNode - 모든 워크 플로우 노드의 래퍼
 * BaseNode로 공통 UI를 제공하고, 노드 타입에 따라 적절한 컴포넌트를 렌더링
 */
const CustomNode = (props: NodeProps) => {
  const data = props.data as CommonNodeType;

  // 노드 타입에 맞는 컴포넌트 선택
  const NodeComponent = useMemo(() => NodeComponentMap[data.type], [data.type]);

  return (
    <BaseNode data={data}>
      <NodeComponent data={data} />
    </BaseNode>
  );
};

CustomNode.displayName = 'CustomNode';

export default memo(CustomNode);
