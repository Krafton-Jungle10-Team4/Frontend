/**
 * ImportedWorkflowNode - 에이전트를 표현하는 노드
 */
import { memo, useCallback, useEffect, useMemo } from 'react';
import { Handle, Position, type NodeProps, useUpdateNodeInternals } from '@xyflow/react';
import { ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { cn } from '@/shared/utils/cn';
import type { ImportedWorkflowNodeData } from '../../../types/import-node.types';
import { CollapsedView } from './CollapsedView';
import { ExpandedView } from './ExpandedView';
import { StatusIndicator } from '../_base/StatusIndicator';
import { IMPORTED_NODE_SIZE } from '../../../constants/templateDefaults';
import { NodeRunningStatus } from '@/shared/types/workflow.types';
import { calculateTemplateGraphBounds, TEMPLATE_HEADER_OFFSET } from '../../../utils/templateBounds';
import { isNodeInTemplate } from '../../../utils/templateImporter';
import { useWorkflowStore } from '../../../stores/workflowStore';

const LAYOUT_PADDING = 60;
const DEFAULT_NODE_WIDTH = 320;
const DEFAULT_NODE_HEIGHT = 180;

type LayoutShift = { nodeId: string; dx: number; dy: number };

const estimateNodeBounds = (node: any) => {
  const width =
    typeof node?.style?.width === 'number'
      ? node.style.width
      : (node?.data?.width as number) || DEFAULT_NODE_WIDTH;
  const height =
    typeof node?.style?.height === 'number'
      ? node.style.height
      : (node?.data?.height as number) || DEFAULT_NODE_HEIGHT;

  return { width, height };
};

const rectsOverlap = (
  a: { left: number; right: number; top: number; bottom: number },
  b: { left: number; right: number; top: number; bottom: number }
) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

export const ImportedWorkflowNode = memo(
  ({ id, data, selected, xPos, yPos }: NodeProps<ImportedWorkflowNodeData>) => {
    const updateNode = useWorkflowStore((state) => state.updateNode);
    const setNodes = useWorkflowStore((state) => state.setNodes);
    const updateNodeInternals = useUpdateNodeInternals();
    const isExpanded = data.is_expanded ?? false;

    // 중복 포트 제거 헬퍼 함수
    const uniquePorts = useCallback((ports: any[], type: 'input' | 'output') => {
      console.log(`[ImportedWorkflowNode] Before uniquePorts (${type}):`, ports);
      const seen = new Set<string>();
      const result = ports.filter(port => {
        if (seen.has(port.name)) {
          console.log(`[ImportedWorkflowNode] Duplicate ${type} port detected:`, port.name);
          return false;
        }
        seen.add(port.name);
        return true;
      });
      console.log(`[ImportedWorkflowNode] After uniquePorts (${type}):`, result);
      return result;
    }, []);

    // BaseNode 패턴: 대표 포트 선택 (required 우선, 없으면 첫 번째)
    const pickPortName = useCallback((portList?: any[]) => {
      if (!portList || portList.length === 0) return undefined;
      const requiredPort = portList.find((port) => port.required);
      return requiredPort?.name || portList[0]?.name;
    }, []);

    // 대표 입력/출력 포트 선택 (1개의 Handle만 렌더링하기 위함)
    const defaultInputHandleId = useMemo(() => {
      const portName = pickPortName(data.ports?.inputs);
      console.log('[ImportedWorkflowNode] Selected input port:', portName || 'input');
      return portName || 'input';
    }, [pickPortName, data.ports?.inputs]);

    const defaultOutputHandleId = useMemo(() => {
      const portName = pickPortName(data.ports?.outputs);
      console.log('[ImportedWorkflowNode] Selected output port:', portName || 'output');
      return portName || 'output';
    }, [pickPortName, data.ports?.outputs]);

    // 노드 크기 계산 (확장 시 동적 계산)
    const size = useMemo(() => {
      if (!isExpanded) {
        return IMPORTED_NODE_SIZE.collapsed;
      }

      const bounds = calculateTemplateGraphBounds(data.internal_graph?.nodes);

      console.log('[ImportedWorkflowNode] Calculated expanded size:', {
        nodeId: id,
        nodeCount: data.internal_graph?.nodes?.length || 0,
        bounds,
      });

      return {
        width: bounds.width,
        minHeight: bounds.height + TEMPLATE_HEADER_OFFSET, // 헤더와 패딩 추가
      };
    }, [isExpanded, data.internal_graph, id]);

    const handleToggleExpand = useCallback(() => {
      // 이미 확장된 상태 -> 접기: 이전에 밀어낸 노드를 원래 위치로 복원
      if (isExpanded) {
        const shiftInfo = data._layoutShift;
        if (shiftInfo?.shifts?.length) {
          const shiftMap = new Map<string, LayoutShift>();
          shiftInfo.shifts.forEach((s) => shiftMap.set(s.nodeId, s));

          setNodes((prev) =>
            prev.map((node) => {
              const shift = shiftMap.get(node.id);
              if (!shift) return node;
              return {
                ...node,
                position: {
                  x: node.position.x - (shift.dx ?? 0),
                  y: node.position.y - (shift.dy ?? 0),
                },
              };
            })
          );
        }

        updateNode(id, {
          is_expanded: false,
          _layoutShift: undefined,
        });
        return;
      }

      // 확장: 영역 확장분을 계산하여 겹치는 노드를 밀어냄
      const expandedHeight = size.minHeight ?? IMPORTED_NODE_SIZE.expanded.minHeight;
      const collapsedHeight = IMPORTED_NODE_SIZE.collapsed.minHeight;

      const collapsedBounds = {
        left: xPos,
        right: xPos + IMPORTED_NODE_SIZE.collapsed.width,
        top: yPos,
        bottom: yPos + collapsedHeight,
      };
      const expandedBounds = {
        left: xPos,
        right: xPos + size.width,
        top: yPos,
        bottom: yPos + expandedHeight,
      };

      const horizontalGrowth = expandedBounds.right - collapsedBounds.right;
      const verticalGrowth = expandedBounds.bottom - collapsedBounds.bottom;

      const extraRightArea = {
        left: collapsedBounds.right,
        right: expandedBounds.right,
        top: expandedBounds.top,
        bottom: expandedBounds.bottom,
      };
      const extraBottomArea = {
        left: expandedBounds.left,
        right: expandedBounds.right,
        top: collapsedBounds.bottom,
        bottom: expandedBounds.bottom,
      };

      const shifts: LayoutShift[] = [];
      setNodes((prev) =>
        prev.map((node) => {
          if (node.id === id || node.parentNode || isNodeInTemplate(node)) {
            return node;
          }

          const { width, height } = estimateNodeBounds(node);
          const nodeBounds = {
            left: node.position.x,
            right: node.position.x + width,
            top: node.position.y,
            bottom: node.position.y + height,
          };

          const overlapsRight =
            horizontalGrowth > 0 && rectsOverlap(nodeBounds, extraRightArea);
          const overlapsBottom =
            verticalGrowth > 0 && rectsOverlap(nodeBounds, extraBottomArea);

          if (!overlapsRight && !overlapsBottom) {
            return node;
          }

          const dx = overlapsRight ? horizontalGrowth + LAYOUT_PADDING : 0;
          const dy = overlapsBottom ? verticalGrowth + LAYOUT_PADDING : 0;
          shifts.push({ nodeId: node.id, dx, dy });

          return {
            ...node,
            position: {
              x: node.position.x + dx,
              y: node.position.y + dy,
            },
          };
        })
      );

      updateNode(id, {
        is_expanded: true,
        _layoutShift: shifts.length ? { shifts } : undefined,
      });
    }, [
      data._layoutShift,
      id,
      isExpanded,
      setNodes,
      size.minHeight,
      size.width,
      updateNode,
      xPos,
      yPos,
    ]);

    // React Flow에 핸들 변경 알림 (초기 마운트 시, 포트 변경 시, 확장/축소 시)
    // 단, internal_graph가 유효한 경우에만 실행
    useEffect(() => {
      // internal_graph 유효성 검증
      const isInternalGraphValid =
        data.internal_graph &&
        data.internal_graph.nodes &&
        Array.isArray(data.internal_graph.nodes) &&
        data.internal_graph.edges &&
        Array.isArray(data.internal_graph.edges);

      if (isInternalGraphValid) {
        console.log('[ImportedWorkflowNode] Updating node internals:', {
          nodeId: id,
          isExpanded,
          nodeCount: data.internal_graph.nodes.length,
          edgeCount: data.internal_graph.edges.length,
        });
        updateNodeInternals(id);
      } else {
        console.warn('[ImportedWorkflowNode] Skipping updateNodeInternals - invalid internal_graph:', {
          nodeId: id,
          isExpanded,
          hasInternalGraph: !!data.internal_graph,
          hasNodes: !!data.internal_graph?.nodes,
          hasEdges: !!data.internal_graph?.edges,
          isNodesArray: Array.isArray(data.internal_graph?.nodes),
          isEdgesArray: Array.isArray(data.internal_graph?.edges),
        });
      }
    }, [id, data.ports, isExpanded, updateNodeInternals, data.internal_graph]);

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
          'bg-white',
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
            />
          ) : (
            <CollapsedView ports={data.ports} description={data.desc} />
          )}
        </div>

        {/* Input Handle - BaseNode 패턴: 1개만 렌더링 */}
        <Handle
          type="target"
          position={Position.Left}
          id={defaultInputHandleId}
          className="!bg-blue-500 !border-2 !border-white !w-3 !h-3"
          style={{ top: '50%', transform: 'translateY(-50%)' }}
        />

        {/* Output Handle - BaseNode 패턴: 1개만 렌더링 */}
        <Handle
          type="source"
          position={Position.Right}
          id={defaultOutputHandleId}
          className="!bg-green-500 !border-2 !border-white !w-3 !h-3"
          style={{ top: '50%', transform: 'translateY(-50%)' }}
        />
      </div>
    );
  }
);

ImportedWorkflowNode.displayName = 'ImportedWorkflowNode';
