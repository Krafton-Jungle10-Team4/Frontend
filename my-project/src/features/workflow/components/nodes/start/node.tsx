import type { NodeProps, StartNodeType } from '@/shared/types/workflow.types';
import { memo } from 'react';

/**
 * Start 노드
 * 워크플로우의 시작점
 * - 워크플로우 메타데이터 설정
 */
const StartNode = ({ data }: NodeProps<StartNodeType>) => {
  return <></>;
};

export default memo(StartNode);
