/**
 * ExpandedView - 확장된 상태의 에이전트 노드 (내부 그래프 표시)
 */
import { memo, useCallback, useEffect, useMemo } from 'react';
import { ReactFlow, Background, Controls, ReactFlowProvider, type Node, useReactFlow } from '@xyflow/react';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import type { ExpandedViewProps } from '../../../types/import-node.types';
import { NodeComponentMap } from '../components';
import BaseNode from '../_base/node';
import CustomEdge from '../../edges/custom-edge';
import { ReadOnlyOverlay } from './ReadOnlyOverlay';
import type { CommonNodeType } from '@/shared/types/workflow.types';
import type { NodeProps } from '@xyflow/react';
import { BlockEnum } from '@/shared/types/workflow.types';
import { SUPPORTED_NODE_TYPES } from '../../../constants/templateDefaults';
import { calculateTemplateGraphBounds } from '../../../utils/templateBounds';

const ReadOnlyFlow = memo(
  ({
    nodes,
    edges,
    nodeTypes,
    edgeTypes,
    onNodeClick,
  }: {
    nodes: Node[];
    edges: any[];
    nodeTypes: any;
    edgeTypes: any;
    onNodeClick: (event: React.MouseEvent, node: Node) => void;
  }) => {
    const { fitView } = useReactFlow();

    useEffect(() => {
      if (!nodes.length) return;
      fitView({
        padding: 0.15,
        includeHiddenNodes: true,
        minZoom: 0.2,
        maxZoom: 1.5,
        nodes: nodes.map((n) => ({ id: n.id })),
        duration: 300,
      });
    }, [fitView, nodes]);

    return (
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        nodesDraggable={false}
        nodesConnectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        elementsSelectable={false}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        preventScrolling={true}
        minZoom={0.2}
        maxZoom={1.5}
        defaultEdgeOptions={{ type: 'custom' }}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls showInteractive={false} />
      </ReactFlow>
    );
  }
);
ReadOnlyFlow.displayName = 'ReadOnlyFlow';

export const ExpandedView = memo(
  ({ nodeId, internalGraph, templateId }: ExpandedViewProps) => {
    const resolvedNodeId =
      nodeId || (templateId ? `template-preview-${templateId}` : 'template-preview');
    // Early return with error UI if internal_graph data is missing
    if (!internalGraph || !internalGraph.nodes || !internalGraph.edges) {
      console.error('[ExpandedView] Missing internal_graph data:', {
        nodeId: resolvedNodeId,
        templateId,
        internalGraph,
        hasGraph: !!internalGraph,
        hasNodes: !!(internalGraph && internalGraph.nodes),
        hasEdges: !!(internalGraph && internalGraph.edges),
      });

      return (
        <div className="relative h-[350px] rounded-b-lg overflow-hidden border-t">
          <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-muted/30">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              에이전트 데이터 검증 실패
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              에이전트의 내부 워크플로우 정보가 누락되었습니다.
              <br />
              이 에이전트는 유효하지 않으며 사용할 수 없습니다.
            </p>
            <div className="text-xs bg-muted p-3 rounded-md max-w-md">
              <p className="font-mono">Template ID: {templateId}</p>
              <p className="font-mono">Node ID: {resolvedNodeId}</p>
              <p className="text-destructive mt-2 font-mono">
                Error: {
                  !internalGraph
                    ? 'internal_graph is undefined'
                    : (!internalGraph.nodes || !internalGraph.edges)
                    ? 'missing nodes or edges arrays'
                    : 'unknown validation error'
                }
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Validate node types - reject templates with unsupported node types
    const unsupportedNodes = internalGraph.nodes
      .map((node: any) => ({
        id: node.id,
        type: node.data?.type
      }))
      .filter(({ type }) => type && !SUPPORTED_NODE_TYPES.includes(type as any));

    if (unsupportedNodes.length > 0) {
      const unsupportedTypes = [...new Set(unsupportedNodes.map(n => n.type))];
      console.error('[ExpandedView] Template contains unsupported node types:', {
        nodeId: resolvedNodeId,
        templateId,
        unsupportedTypes,
        unsupportedNodes,
        supportedTypes: SUPPORTED_NODE_TYPES
      });

      return (
        <div className="relative h-[350px] rounded-b-lg overflow-hidden border-t">
          <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-muted/30">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              지원하지 않는 노드 타입 포함
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              이 에이전트는 현재 지원하지 않는 노드 타입을 포함하고 있습니다.
              <br />
              에이전트를 업데이트하거나 다른 에이전트를 사용하세요.
            </p>
            <div className="text-xs bg-muted p-3 rounded-md max-w-md space-y-2">
              <p className="font-mono">Template ID: {templateId}</p>
              <p className="font-mono">Node ID: {resolvedNodeId}</p>
              <div className="text-destructive mt-2">
                <p className="font-semibold mb-1">지원하지 않는 노드 타입:</p>
                <p className="font-mono">{unsupportedTypes.join(', ')}</p>
              </div>
              <div className="text-muted-foreground mt-2">
                <p className="font-semibold mb-1">영향받는 노드 수:</p>
                <p className="font-mono">{unsupportedNodes.length}개</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // CustomNode를 useMemo로 생성
    // NOTE: ImportedWorkflow 노드는 위의 validation에서 이미 거부되므로 여기서는 처리 불필요
    const CustomNode = useMemo(() => {
      return memo((props: NodeProps) => {
        const data = props.data as CommonNodeType;
        const NodeComponent = NodeComponentMap[data.type];

        // 지원하지 않는 노드 컴포넌트인 경우 (예상치 못한 경우)
        if (!NodeComponent) {
          console.error('[ExpandedView] No component found for node type:', data.type);
          return (
            <BaseNode id={props.id} data={data} selected={props.selected}>
              <div className="text-xs text-destructive p-2">
                ERROR: Unknown node type: {data.type}
              </div>
            </BaseNode>
          );
        }

        return (
          <BaseNode id={props.id} data={data} selected={props.selected}>
            <NodeComponent data={data} />
          </BaseNode>
        );
      });
    }, []);

    // ReactFlow에서 사용할 노드/엣지 타입 매핑
    const nodeTypes = useMemo(() => ({
      custom: CustomNode,
    }), [CustomNode]);

    const edgeTypes = useMemo(() => ({
      custom: CustomEdge,
    }), []);

    // Safe access with default empty arrays
    const safeNodes = internalGraph.nodes || [];
    const safeEdges = internalGraph.edges || [];
    const bounds = useMemo(
      () => calculateTemplateGraphBounds(safeNodes),
      [safeNodes]
    );

    // 각 노드의 필수 필드 검증 (디버깅 로그 포함)
    console.log('[ExpandedView] Validating node structures:', {
      nodeId: resolvedNodeId,
      templateId,
      totalNodes: safeNodes.length,
    });

    const invalidNodes = safeNodes.filter((node: any, index: number) => {
      const isInvalid = !node.id ||
             !node.position ||
             typeof node.position.x !== 'number' ||
             typeof node.position.y !== 'number' ||
             !node.data ||
             !node.data.type;

      if (isInvalid) {
        console.error('[ExpandedView] Invalid node detected:', {
          nodeId: resolvedNodeId,
          templateId,
          nodeIndex: index,
          node,
          reasons: {
            missingId: !node.id,
            missingPosition: !node.position,
            invalidPositionX: typeof node.position?.x !== 'number',
            invalidPositionY: typeof node.position?.y !== 'number',
            missingData: !node.data,
            missingType: !node.data?.type,
          }
        });
      }

      return isInvalid;
    });

    if (invalidNodes.length > 0) {
      console.error('[ExpandedView] Template contains invalid nodes:', {
        nodeId: resolvedNodeId,
        templateId,
        invalidNodeCount: invalidNodes.length,
        totalNodeCount: safeNodes.length,
        invalidNodes,
      });

      return (
        <div className="relative h-[350px] rounded-b-lg overflow-hidden border-t">
          <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-muted/30">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              에이전트 데이터 오류
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              에이전트의 일부 노드가 잘못된 형식입니다.
              <br />
              에이전트를 다시 생성하거나 업데이트해주세요.
            </p>
            <div className="text-xs bg-muted p-3 rounded-md max-w-md space-y-2">
              <p className="font-mono">Template ID: {templateId}</p>
              <p className="font-mono">Node ID: {resolvedNodeId}</p>
              <p className="text-destructive mt-2">
                잘못된 노드 개수: {invalidNodes.length}개 / 전체 {safeNodes.length}개
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                콘솔에서 상세 정보를 확인하세요.
              </p>
            </div>
          </div>
        </div>
      );
    }

    console.log('[ExpandedView] All nodes validated successfully');

    // 내부 노드들을 읽기 전용으로 설정 (안전한 매핑)
    const readOnlyNodes: Node[] = useMemo(() => {
      return safeNodes.map((node, index) => {
        try {
          const mappedNode = {
            ...node,
            id: `${resolvedNodeId}_${node.id}`,
            type: 'custom', // ReactFlow에서 인식할 수 있도록 'custom' 타입 명시
            draggable: false,
            connectable: false,
            deletable: false,
            selectable: true, // 선택은 가능 (확인용)
            position: {
              x: (node.position?.x ?? 0) + bounds.offsetX,
              y: (node.position?.y ?? 0) + bounds.offsetY,
            },
            style: {
              ...node.style,
              width: 240, // BaseNode와 동일한 폭
              height: node.style?.height ?? 100, // 기본 높이
              opacity: 0.8,
              filter: 'grayscale(10%)',
            },
          };

          console.log(`[ExpandedView] Node ${index} mapped successfully:`, {
            originalId: node.id,
            mappedId: mappedNode.id,
            type: node.data?.type,
          });

          return mappedNode;
        } catch (error) {
          console.error('[ExpandedView] Error mapping node:', {
            nodeId: resolvedNodeId,
            templateId,
            nodeIndex: index,
            node,
            error: error instanceof Error ? error.message : String(error),
          });

          // 에러 발생 시 기본 노드 반환
          return {
            id: `${resolvedNodeId}_error_${index}_${Date.now()}`,
            type: 'custom',
            position: { x: 0, y: 0 },
            data: {
              type: 'error',
              title: `Error Node #${index}`,
              desc: 'Failed to load this node'
            },
          } as Node;
        }
      });
    }, [safeNodes, resolvedNodeId, templateId]);

    const readOnlyEdges = useMemo(() => {
      return safeEdges.map((edge) => ({
        ...edge,
        id: `${resolvedNodeId}_${edge.id}`,
        source: `${resolvedNodeId}_${edge.source}`,
        target: `${resolvedNodeId}_${edge.target}`,
      }));
    }, [safeEdges, resolvedNodeId]);

    const handleNodeClick = useCallback(
      (event: React.MouseEvent, _node: Node) => {
        event.stopPropagation();
        toast.info('읽기 전용 에이전트', {
          description: '이 노드는 에이전트의 일부로 편집할 수 없습니다.',
        });
      },
      []
    );

    return (
      <div
        className="relative rounded-b-lg overflow-hidden"
        style={{
          width: `${bounds.width}px`,
          height: `${bounds.height}px`,
        }}
      >
        <ReactFlowProvider>
          <ReadOnlyFlow
            nodes={readOnlyNodes}
            edges={readOnlyEdges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodeClick={handleNodeClick}
          />
        </ReactFlowProvider>
      </div>
    );
  }
);

ExpandedView.displayName = 'ExpandedView';
