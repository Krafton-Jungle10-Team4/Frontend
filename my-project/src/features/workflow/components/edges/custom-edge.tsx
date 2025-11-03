import { memo, useMemo } from 'react';
import type { EdgeProps } from '@xyflow/react';
import { BaseEdge, Position, getBezierPath } from '@xyflow/react';
import type { CommonEdgeType } from '../../types/workflow.types';
import { NodeRunningStatus } from '../../types/workflow.types';

/**
 *  노드 실행 상태에 따른 엣지 색상 반환
 */
const getEdgeColor = (status?: NodeRunningStatus): string => {
  if (!status || status === NodeRunningStatus.NotStart) {
    return '#d0d5dc';
  }

  switch (status) {
    case NodeRunningStatus.Waiting:
      return '#F79009'; // 주황 (대기)
    case NodeRunningStatus.Running:
      return '#2970FF'; // 파랑 (실행 중)
    case NodeRunningStatus.Succeeded:
      return '#17B26A'; // 초록 (성공)
    case NodeRunningStatus.Failed:
    case NodeRunningStatus.Exception:
      return '#EF4444'; // 빨강 (실패/예외)
    case NodeRunningStatus.Stopped:
      return '#98A2B3'; // 회색 (중단)
    default:
      return '#d0d5dc';
  }
};

/**
 * 커스텀 엣지 컴포넌트
 * React Flow의 배지어 곡선 엣지를 사용하며, 노드 실행 상태에 따라 색상이 변경됨
 */
const CustomEdge = ({
  id,
  data,
  sourceX,
  sourceY,
  targetX,
  targetY,
  selected,
}: EdgeProps) => {
  const [edgePath] = getBezierPath({
    sourceX: sourceX - 8,
    sourceY,
    sourcePosition: Position.Right,
    targetX: targetX + 8,
    targetY,
    targetPosition: Position.Left,
    curvature: 0.16,
  });

  // 타입 단언
  const edgeData = data as CommonEdgeType | undefined;

  const { _sourceRunningStatus, _connectedNodeIsHovering, _waitingRun } =
    edgeData || {};

  const stroke = useMemo(() => {
    if (selected) {
      return getEdgeColor(NodeRunningStatus.Running); // 선택 시 파란색
    }

    if (_connectedNodeIsHovering) {
      return getEdgeColor(NodeRunningStatus.Running); // 호버 시 파란색
    }

    return getEdgeColor(_sourceRunningStatus); // 소스 노드 상태에 따른 색상
  }, [selected, _connectedNodeIsHovering, _sourceRunningStatus]);

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{ stroke, strokeWidth: 2, opacity: _waitingRun ? 0.7 : 1 }}
    />
  );
};

export default memo(CustomEdge);
