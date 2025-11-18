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
import { BlockEnum } from '@/shared/types/workflow.types';
import { SUPPORTED_NODE_TYPES } from '../../../constants/templateDefaults';

export const ExpandedView = memo(
  ({ nodeId, internalGraph }: ExpandedViewProps) => {
    // CustomNode를 useMemo로 생성하여 순환 참조 방지
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
      (event: React.MouseEvent, _node: Node) => {
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
