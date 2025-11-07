import { memo, useMemo } from 'react';
import type { ReactElement } from 'react';
import {
  RiCheckboxCircleFill,
  RiErrorWarningFill,
  RiLoader2Line,
} from '@remixicon/react';
import type { NodeProps } from '@/shared/types/workflow.types';
import { NodeRunningStatus } from '@/shared/types/workflow.types';
import { NodeSourceHandle, NodeTargetHandle } from './node-handle';
import BlockIcon from './block-icon';
import clsx from 'clsx';

type BaseNodeProps = {
  children: ReactElement;
  data: NodeProps['data'];
};

/**
 * 베이스 노드 컴포넌트
 * 모든 워크플로우 노드의 공통 래퍼
 * - 240px 고정 폭
 * - 실행 상태에 따른 테두리 색상
 * - BlockIcon, StatusIcon, NodeHandle 표시
 */
const BaseNode = ({ data, children }: BaseNodeProps) => {
  const isLoading =
    data._runningStatus === NodeRunningStatus.Running ||
    data._singleRunningStatus === NodeRunningStatus.Running;

  const showSelectedBorder = data.selected;

  const { showRunningBorder, showSuccessBorder, showFailedBorder } =
    useMemo(() => {
      return {
        showRunningBorder:
          data._runningStatus === NodeRunningStatus.Running &&
          !showSelectedBorder,
        showSuccessBorder:
          data._runningStatus === NodeRunningStatus.Succeeded &&
          !showSelectedBorder,
        showFailedBorder:
          data._runningStatus === NodeRunningStatus.Failed &&
          !showSelectedBorder,
      };
    }, [data._runningStatus, showSelectedBorder]);

  return (
    <div
      className={clsx(
        'relative flex rounded-2xl border-2',
        showSelectedBorder
          ? 'border-components-option-card-option-selected-border'
          : 'border-transparent',
        data._waitingRun && 'opacity-70',
        data._dimmed && 'opacity-30'
      )}
    >
      <div
        className={clsx(
          'group relative w-[240px] rounded-[15px] border-2 bg-workflow-block-bg pb-1 shadow-xs',
          'border-transparent',
          !data._runningStatus && 'hover:shadow-lg',
          showRunningBorder && '!border-state-accent-solid',
          showSuccessBorder && '!border-state-success-solid',
          showFailedBorder && '!border-state-destructive-solid'
        )}
      >
        {/* Target Handle (왼쪽 입력) */}
        <NodeTargetHandle
          data={data}
          handleClassName="!top-4 !-left-[9px] !translate-y-0"
          handleId="target"
        />

        {/* Source Handle (오른쪽 출력) */}
        <NodeSourceHandle
          data={data}
          handleClassName="!top-4 !-right-[9px] !translate-y-0"
          handleId="source"
        />

        {/* 노드 헤더 */}
        <div className="flex items-center rounded-t-2xl px-3 pb-2 pt-3">
          <BlockIcon className="mr-2 shrink-0" type={data.type} size="md" />
          <div
            title={data.title}
            className="system-sm-semibold-uppercase mr-1 flex grow items-center truncate text-text-primary"
          >
            {data.title}
          </div>

          {/* 상태 아이콘 */}
          {isLoading && (
            <RiLoader2Line className="h-3.5 w-3.5 animate-spin text-text-accent" />
          )}
          {!isLoading &&
            data._runningStatus === NodeRunningStatus.Succeeded && (
              <RiCheckboxCircleFill className="h-3.5 w-3.5 text-text-success" />
            )}
          {data._runningStatus === NodeRunningStatus.Failed && (
            <RiErrorWarningFill className="h-3.5 w-3.5 text-text-destructive" />
          )}
        </div>

        {/* 노드 내용 */}
        {children}

        {/* 노드 설명 */}
        {data.desc && (
          <div className="system-xs-regular whitespace-pre-line break-words px-3 pb-2 pt-1 text-text-tertiary">
            {data.desc}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(BaseNode);
