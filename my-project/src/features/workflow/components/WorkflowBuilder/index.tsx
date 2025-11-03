import { memo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
import type { Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { Node, Edge } from '../../types/workflow.types';
import CustomNode from '../nodes';
import CustomEdge from '../edges/custom-edge';

// 노드 타입 매핑
const nodeTypes = {
  custom: CustomNode,
};

// 엣지 타입 매핑
const edgeTypes = {
  custom: CustomEdge,
};

export type WorkflowProps = {
  initialNodes: Node[];
  initialEdges: Edge[];
};

/**
 * Workflow 컴포넌트 (내부)
 * React Flow를 래핑하여 워크플로우 캔버스를 제공
 */
const WorkflowInner = ({ initialNodes, initialEdges }: WorkflowProps) => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // 노드 연결 처리
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, type: 'custom' }, eds));
    },
    [setEdges]
  );

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.25}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'custom',
        }}
      >
        <Background
          gap={14}
          size={2}
          className="bg-workflow-canvas-workflow-bg"
          color="var(--color-workflow-canvas-workflow-dot-color)"
        />
      </ReactFlow>
    </div>
  );
};

/**
 * Workflow 컴포넌트 (외부)
 * ReactFlowProvider로 래핑하여 컨텍스트 제공
 */
const Workflow = (props: WorkflowProps) => {
  return (
    <ReactFlowProvider>
      <WorkflowInner {...props} />
    </ReactFlowProvider>
  );
};

export default memo(Workflow);
