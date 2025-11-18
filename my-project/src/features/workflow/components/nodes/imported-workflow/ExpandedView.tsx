/**
 * ExpandedView - 확장된 상태의 템플릿 노드 (내부 그래프 표시)
 */
import { memo, useCallback, useMemo } from 'react';
import { ReactFlow, Background, Controls, type Node } from '@xyflow/react';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import type { ExpandedViewProps } from '../../../types/import-node.types';
import { NodeComponentMap } from '../components';
import BaseNode from '../_base/node';
import { ReadOnlyOverlay } from './ReadOnlyOverlay';
import type { CommonNodeType } from '@/shared/types/workflow.types';
import type { NodeProps } from '@xyflow/react';

export const ExpandedView = memo(
  ({ nodeId, internalGraph, templateId }: ExpandedViewProps) => {
    // Early return with error UI if internal_graph data is missing
    if (!internalGraph || !internalGraph.nodes || !internalGraph.edges) {
      console.error('[ExpandedView] Missing internal_graph data:', {
        nodeId,
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
              템플릿 데이터를 불러올 수 없습니다
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              템플릿의 내부 워크플로우 정보가 누락되었습니다.
              <br />
              템플릿을 다시 가져오거나 관리자에게 문의하세요.
            </p>
            <div className="text-xs bg-muted p-3 rounded-md max-w-md">
              <p className="font-mono">Template ID: {templateId}</p>
              <p className="font-mono">Node ID: {nodeId}</p>
              <p className="text-destructive mt-2 font-mono">
                internal_graph: {
                  !internalGraph
                    ? 'undefined'
                    : (!internalGraph.nodes || !internalGraph.edges)
                    ? 'partial data (missing nodes or edges)'
                    : 'unknown error'
                }
              </p>
            </div>
          </div>
        </div>
      );
    }

    // CustomNode를 useMemo로 생성하여 순환 참조 방지
    const CustomNode = useMemo(() => {
      return memo((props: NodeProps) => {
        const data = props.data as CommonNodeType;
        const NodeComponent = NodeComponentMap[data.type];

        return (
          <BaseNode id={props.id} data={data} selected={props.selected}>
            <NodeComponent data={data} />
          </BaseNode>
        );
      });
    }, []);

    // ReactFlow에서 사용할 노드 타입 매핑
    const nodeTypes = useMemo(() => ({
      custom: CustomNode,
    }), [CustomNode]);

    // Safe access with default empty arrays
    const safeNodes = internalGraph.nodes || [];
    const safeEdges = internalGraph.edges || [];

    // 내부 노드들을 읽기 전용으로 설정
    const readOnlyNodes: Node[] = safeNodes.map((node) => ({
      ...node,
      id: `${nodeId}_${node.id}`,
      type: 'custom', // ReactFlow에서 인식할 수 있도록 'custom' 타입 명시
      draggable: false,
      connectable: false,
      deletable: false,
      selectable: true, // 선택은 가능 (확인용)
      parentNode: nodeId,
      style: {
        ...node.style,
        opacity: 0.8,
        filter: 'grayscale(10%)',
      },
    }));

    const readOnlyEdges = safeEdges.map((edge) => ({
      ...edge,
      id: `${nodeId}_${edge.id}`,
      source: `${nodeId}_${edge.source}`,
      target: `${nodeId}_${edge.target}`,
    }));

    const handleNodeClick = useCallback(
      (event: React.MouseEvent, node: Node) => {
        event.stopPropagation();
        toast.info('읽기 전용 템플릿', {
          description: '이 노드는 템플릿의 일부로 편집할 수 없습니다.',
        });
      },
      []
    );

    return (
      <div className="relative h-[350px] rounded-b-lg overflow-hidden border-t">
        <ReactFlow
          nodes={readOnlyNodes}
          edges={readOnlyEdges}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          nodesDraggable={false}
          nodesConnectable={false}
          nodesFocusable={false}
          edgesFocusable={false}
          elementsSelectable={false}
          panOnDrag={true}
          zoomOnScroll={true}
          zoomOnPinch={true}
          preventScrolling={true}
          fitView
          fitViewOptions={{ padding: 0.2 }}
        >
          <Background />
          <Controls showInteractive={false} />
        </ReactFlow>

        {/* Read-only overlay */}
        <ReadOnlyOverlay />
      </div>
    );
  }
);

ExpandedView.displayName = 'ExpandedView';
