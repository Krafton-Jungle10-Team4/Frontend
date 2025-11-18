import { memo } from 'react';
import { RiCheckboxCircleFill, RiErrorWarningFill, RiLoader2Line } from '@remixicon/react';
import { NodeRunningStatus } from '@/shared/types/workflow.types';

type StatusIndicatorProps = {
  runningStatus?: NodeRunningStatus;
  singleRunningStatus?: NodeRunningStatus;
};

/**
 * StatusIndicator - 노드 실행 상태를 시각적으로 표시하는 컴포넌트
 *
 * BaseNode와 ImportedWorkflowNode에서 재사용 가능하도록 분리된 컴포넌트
 * - Running: 회전하는 로딩 아이콘
 * - Succeeded: 초록색 체크 아이콘
 * - Failed/Exception: 빨간색 경고 아이콘
 */
export const StatusIndicator = memo(({ runningStatus, singleRunningStatus }: StatusIndicatorProps) => {
  const isLoading =
    runningStatus === NodeRunningStatus.Running ||
    singleRunningStatus === NodeRunningStatus.Running;

  if (isLoading) {
    return <RiLoader2Line className="h-3.5 w-3.5 animate-spin text-text-accent" />;
  }

  if (runningStatus === NodeRunningStatus.Succeeded) {
    return <RiCheckboxCircleFill className="h-3.5 w-3.5 text-text-success" />;
  }

  if (
    runningStatus === NodeRunningStatus.Failed ||
    runningStatus === NodeRunningStatus.Exception
  ) {
    return <RiErrorWarningFill className="h-3.5 w-3.5 text-text-destructive" />;
  }

  return null;
});

StatusIndicator.displayName = 'StatusIndicator';
