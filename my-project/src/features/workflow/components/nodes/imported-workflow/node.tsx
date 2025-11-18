/**
 * ImportedWorkflowNode - 템플릿을 표현하는 노드
 */
import { memo, useCallback, useEffect, useMemo } from 'react';
import { Handle, Position, type NodeProps, useUpdateNodeInternals } from '@xyflow/react';
import { ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { cn } from '@/shared/utils/cn';
import type { ImportedWorkflowNodeData } from '../../../types/import-node.types';
import { CollapsedView } from './CollapsedView';
import { ExpandedView } from './ExpandedView';
import { useWorkflowStore } from '../../../stores/workflowStore';
import { StatusIndicator } from '../_base/StatusIndicator';
import { IMPORTED_NODE_SIZE } from '../../../constants/templateDefaults';
import { NodeRunningStatus } from '@/shared/types/workflow.types';

export const ImportedWorkflowNode = memo(
  ({ id, data, selected }: NodeProps<ImportedWorkflowNodeData>) => {
    const updateNode = useWorkflowStore((state) => state.updateNode);
    const updateNodeInternals = useUpdateNodeInternals();
    const isExpanded = data.is_expanded ?? false;

    const handleToggleExpand = useCallback(() => {
      updateNode(id, {
        is_expanded: !isExpanded,
      });
    }, [id, isExpanded, updateNode]);

    // 노드 크기 계산
    const size = isExpanded
      ? IMPORTED_NODE_SIZE.expanded
      : IMPORTED_NODE_SIZE.collapsed;

    // React Flow에 핸들 변경 알림 (초기 마운트 시, 포트 변경 시, 확장/축소 시)
    useEffect(() => {
      updateNodeInternals(id);
    }, [id, data.ports, isExpanded, updateNodeInternals]);

    // 실행 상태에 따른 테두리 색상 계산
    const { showRunningBorder, showSuccessBorder, showFailedBorder } = useMemo(() => {
      return {
        showRunningBorder:
          data._runningStatus === NodeRunningStatus.Running && !selected,
        showSuccessBorder:
          data._runningStatus === NodeRunningStatus.Succeeded && !selected,
        showFailedBorder:
          (data._runningStatus === NodeRunningStatus.Failed ||
            data._runningStatus === NodeRunningStatus.Exception) &&
          !selected,
      };
    }, [data._runningStatus, selected]);

    return (
      <div
        className={cn(
          'relative rounded-lg border-2 border-dashed',
          'bg-background/80 backdrop-blur',
          'shadow-md transition-all duration-200',
          // 선택 상태
          selected && 'ring-2 ring-primary shadow-lg',
          // 실행 상태에 따른 테두리 색상
          showRunningBorder && '!border-primary',
          showSuccessBorder && '!border-green-500',
          showFailedBorder && '!border-red-500',
          // 호버 효과
          !data._runningStatus && 'hover:shadow-lg',
          // Opacity 조정
          data._waitingRun && 'opacity-70',
          data._dimmed && 'opacity-30'
        )}
        style={{
          width: size.width,
          minHeight: isExpanded ? size.minHeight : 'auto',
        }}
      >
        {/* Read-only indicator */}
        <div className="absolute top-2 left-2 z-10">
          <Lock className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b bg-muted/50 rounded-t-lg">
          <div className="flex-1 pr-2 pl-6">
            <h3 className="font-semibold text-sm truncate">{data.title}</h3>
            <p className="text-xs text-muted-foreground">
              v{data.template_version}
            </p>
          </div>

          {/* 상태 아이콘 (실행 상태 피드백) */}
          <StatusIndicator
            runningStatus={data._runningStatus}
            singleRunningStatus={data._singleRunningStatus}
          />

          <Button
            size="sm"
            variant="ghost"
            onClick={handleToggleExpand}
            className="h-8 w-8 p-0 ml-1"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Content */}
        <div className="p-3">
          {isExpanded ? (
            <ExpandedView
              nodeId={id}
              internalGraph={data.internal_graph}
              templateId={data.template_id}
            />
          ) : (
            <CollapsedView ports={data.ports} description={data.desc} />
          )}
        </div>

        {/* Input Handles - 첫 번째는 "input" ID, 나머지는 포트 이름 */}
        {data.ports?.inputs && data.ports.inputs.length > 0 ? (
          data.ports.inputs.map((input, index) => (
            <Handle
              key={`input-${input.name}`}
              type="target"
              position={Position.Left}
              id={index === 0 ? 'input' : input.name}
              className="!bg-blue-500 !border-2 !border-white !w-3 !h-3"
              style={{ top: `${60 + index * 30}px` }}
            />
          ))
        ) : (
          // 포트가 없어도 기본 'input' 핸들 제공 (엣지 연결을 위해)
          <Handle
            type="target"
            position={Position.Left}
            id="input"
            className="!bg-blue-500 !border-2 !border-white !w-3 !h-3"
            style={{ top: '60px' }}
          />
        )}

        {/* Output Handles - 첫 번째는 "output" ID, 나머지는 포트 이름 */}
        {data.ports?.outputs && data.ports.outputs.length > 0 ? (
          data.ports.outputs.map((output, index) => (
            <Handle
              key={`output-${output.name}`}
              type="source"
              position={Position.Right}
              id={index === 0 ? 'output' : output.name}
              className="!bg-green-500 !border-2 !border-white !w-3 !h-3"
              style={{ top: `${60 + index * 30}px` }}
            />
          ))
        ) : (
          // 포트가 없어도 기본 'output' 핸들 제공 (엣지 연결을 위해)
          <Handle
            type="source"
            position={Position.Right}
            id="output"
            className="!bg-green-500 !border-2 !border-white !w-3 !h-3"
            style={{ top: '60px' }}
          />
        )}
      </div>
    );
  }
);

ImportedWorkflowNode.displayName = 'ImportedWorkflowNode';
