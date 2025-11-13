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
import { NodePort } from './NodePort';
import BlockIcon from './block-icon';
import clsx from 'clsx';
import { useNodeOutput } from '@features/workflow/hooks/useNodeOutput';
import { usePortConnection } from '@features/workflow/hooks/usePortConnection';
import type { NodePortSchema } from '@shared/types/workflow';
import { OutputVarList } from '../../variable/OutputVarList';

type BaseNodeProps = {
  children: ReactElement;
  data: NodeProps['data'];
  selected?: boolean;
  id: string;
};

/**
 * 베이스 노드 컴포넌트
 * 모든 워크플로우 노드의 공통 래퍼
 * - 240px 고정 폭
 * - 실행 상태에 따른 테두리 색상
 * - BlockIcon, StatusIcon, NodeHandle 표시
 * - 포트 시스템 지원 (하위 호환)
 */
const BaseNode = ({ id, data, children, selected }: BaseNodeProps) => {
  const ports = data.ports as NodePortSchema | undefined;
  const nodeOutputs = useNodeOutput(id);
  const { isPortConnected } = usePortConnection();
  const isLoading =
    data._runningStatus === NodeRunningStatus.Running ||
    data._singleRunningStatus === NodeRunningStatus.Running;

  const showSelectedBorder = selected;

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
        'group relative w-[240px] rounded-[15px] border-2 pb-1',
        // 배경색
        'bg-white dark:bg-gray-800',
        // 선택 상태에 따른 테두리 색상
        showSelectedBorder
          ? 'border-blue-500'
          : 'border-gray-200 dark:border-gray-700',
        // 선택 상태에 따른 그림자
        showSelectedBorder ? 'shadow-xl' : 'shadow-md',
        !data._runningStatus &&
          'hover:shadow-lg transition-shadow duration-200',
        // 실행 상태에 따른 테두리
        showRunningBorder && '!border-primary',
        showSuccessBorder && '!border-green-500',
        showFailedBorder && '!border-red-500',
        // Opacity 조정
        data._waitingRun && 'opacity-70',
        data._dimmed && 'opacity-30'
      )}
    >
      {/* 포트 시스템 (새로운 워크플로우) */}
      {ports && (
        <>
          {/* 입력 포트 */}
          {ports.inputs.map((port, index) => (
            <NodePort
              key={`input-${port.name}`}
              port={port}
              nodeId={id}
              direction="input"
              index={index}
              totalPorts={ports.inputs.length}
              isConnected={isPortConnected(id, port.name, 'input')}
            />
          ))}

          {/* 출력 포트 */}
          {ports.outputs.map((port, index) => (
            <NodePort
              key={`output-${port.name}`}
              port={port}
              nodeId={id}
              direction="output"
              index={index}
              totalPorts={ports.outputs.length}
              isConnected={isPortConnected(id, port.name, 'output')}
              currentValue={nodeOutputs[port.name]}
            />
          ))}
        </>
      )}

      {/* 레거시 핸들 (포트 없는 기존 노드) */}
      {!ports && (
        <>
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
        </>
      )}

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

      {/* 출력 변수 섹션 (실행 중이거나 완료된 경우) */}
      {ports &&
        (data._runningStatus === NodeRunningStatus.Running ||
          data._runningStatus === NodeRunningStatus.Succeeded ||
          data._runningStatus === NodeRunningStatus.Failed) && (
          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 px-3 py-2 rounded-b-[13px]">
            <OutputVarList
              nodeId={id}
              showValues={
                data._runningStatus === NodeRunningStatus.Succeeded ||
                data._runningStatus === NodeRunningStatus.Failed
              }
              showEmptyState={false}
            />
          </div>
        )}
    </div>
  );
};

export default BaseNode;
