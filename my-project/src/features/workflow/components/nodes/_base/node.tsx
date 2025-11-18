import { memo, useMemo, useCallback } from 'react';
import type { ReactElement } from 'react';
import type { NodeProps } from '@/shared/types/workflow.types';
import { NodeRunningStatus } from '@/shared/types/workflow.types';
import { NodeSourceHandle, NodeTargetHandle } from './node-handle';
import BlockIcon from './block-icon';
import clsx from 'clsx';
import type { NodePortSchema } from '@shared/types/workflow';
import { OutputVarList } from '../../variable/OutputVarList';
import { useWorkflowStore } from '@features/workflow/stores/workflowStore';
import { BlockEnum } from '@/shared/types/workflow.types';
import { StatusIndicator } from './StatusIndicator';
import { getNodeCustomName } from '@features/workflow/utils/nodeCustomNames';

type BaseNodeProps = {
  children: ReactElement;
  data: NodeProps['data'];
  selected?: boolean;
  id: string;
  customHeader?: ReactElement;
  disableDefaultHeader?: boolean;
  suppressDefaultHandles?: boolean;
};

/**
 * 베이스 노드 컴포넌트
 * 모든 워크플로우 노드의 공통 래퍼
 * - 240px 고정 폭
 * - 실행 상태에 따른 테두리 색상
 * - BlockIcon, StatusIcon, NodeHandle 표시
 * - 포트 시스템 지원 (하위 호환)
 */
const BaseNode = ({ id, data, children, selected, customHeader, disableDefaultHeader, suppressDefaultHandles }: BaseNodeProps) => {
  // 포트 데이터를 메모이제이션하여 참조 안정성 보장
  const ports = useMemo(() => data.ports as NodePortSchema | undefined, [data.ports]);

  const botId = useWorkflowStore((state) => state.botId);
  const hasValidationError = useWorkflowStore(
    (state) => state.validationErrorNodeIds.includes(id)
  );
  const nodeType = data.type as BlockEnum;

  // 로컬 스토리지에서 커스텀 이름 가져오기
  const displayTitle = useMemo(() => {
    if (botId) {
      const customName = getNodeCustomName(botId, id);
      if (customName) {
        return customName;
      }
    }
    return data.title;
  }, [botId, id, data.title]);
  const hasInputHandle = nodeType !== BlockEnum.Start && !suppressDefaultHandles;
  const hasOutputHandle = nodeType !== BlockEnum.End && !suppressDefaultHandles;
  const disableDefaultOutputHandle =
    nodeType === BlockEnum.IfElse || nodeType === BlockEnum.QuestionClassifier;

  const pickPortName = useCallback((portList?: NodePortSchema['inputs']) => {
    if (!portList || portList.length === 0) return undefined;
    const requiredPort = portList.find((port) => port.required);
    return requiredPort?.name || portList[0]?.name;
  }, []);

  const defaultInputHandleId = useMemo(() => {
    return pickPortName(ports?.inputs) || 'target';
  }, [pickPortName, ports?.inputs]);

  const defaultOutputHandleId = useMemo(() => {
    return pickPortName(ports?.outputs) || 'source';
  }, [pickPortName, ports?.outputs]);

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
          (data._runningStatus === NodeRunningStatus.Failed ||
            data._runningStatus === NodeRunningStatus.Exception) &&
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
          : hasValidationError
            ? 'border-red-400'
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
      {hasValidationError && !showSelectedBorder && (
        <div className="absolute -top-2 right-3 rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white shadow">
          오류
        </div>
      )}
      <>
        {hasInputHandle && (
          <NodeTargetHandle data={data} handleId={defaultInputHandleId} />
        )}
        {hasOutputHandle && !disableDefaultOutputHandle && (
          <NodeSourceHandle data={data} handleId={defaultOutputHandleId} />
        )}
      </>

      {/* 노드 헤더 - 커스텀 헤더 또는 기본 헤더 */}
      {!disableDefaultHeader && (
        customHeader || (
          <div className="flex items-center rounded-t-2xl px-3 pb-2 pt-3">
            <BlockIcon className="mr-2 shrink-0" type={data.type} size="md" />
            <div
              title={displayTitle}
              className="system-sm-semibold-uppercase mr-1 flex grow items-center truncate text-text-primary"
            >
              {displayTitle}
            </div>

            {/* 상태 아이콘 */}
            <StatusIndicator
              runningStatus={data._runningStatus}
              singleRunningStatus={data._singleRunningStatus}
            />
          </div>
        )
      )}

      {/* 노드 내용 */}
      {children}

      {/* 출력 변수 섹션 (실행 중이거나 완료된 경우) */}
      {ports &&
        (data._runningStatus === NodeRunningStatus.Running ||
          data._runningStatus === NodeRunningStatus.Succeeded ||
          data._runningStatus === NodeRunningStatus.Failed ||
          data._runningStatus === NodeRunningStatus.Exception) && (
          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 px-3 py-2 rounded-b-[13px]">
            <OutputVarList
              nodeId={id}
              showValues={
                data._runningStatus === NodeRunningStatus.Succeeded ||
                data._runningStatus === NodeRunningStatus.Failed ||
                data._runningStatus === NodeRunningStatus.Exception
              }
              showEmptyState={false}
            />
          </div>
        )}
    </div>
  );
};

export default memo(BaseNode, (prevProps, nextProps) => {
  // Custom comparison - only re-render if these key props change
  return (
    prevProps.id === nextProps.id &&
    prevProps.selected === nextProps.selected &&
    prevProps.data === nextProps.data &&
    prevProps.children === nextProps.children
  );
});
