import { memo, useCallback, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  ReactFlowProvider,
  addEdge,
  useReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import type {
  Connection,
  NodeMouseHandler,
  EdgeMouseHandler,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Eye, EyeOff } from 'lucide-react';

import type { Node, Edge } from '@/shared/types/workflow.types';
import { BlockEnum } from '@/shared/types/workflow.types';
import CustomNode from '../nodes';
import CustomEdge from '../edges/custom-edge';
import ContextMenu from './ContextMenu';
import { useWorkflowStore } from '../../stores/workflowStore';
import { useHistoryStore } from '../../stores/historyStore';
import { SaveButton } from '../SaveButton';
import { UndoRedoButtons } from '../UndoRedoButtons';
import { NodeConfigPanel } from '../NodeConfigPanel';
import { useRealtimeValidation } from '../../hooks/useRealtimeValidation';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useWorkflowShortcuts } from '../../hooks/useWorkflowShortcuts';
import { PublishDropdown } from '../PublishDropdown';
import { EmbedWebsiteDialog, ApiReferenceDialog } from '@features/deployment';

// 노드 타입 매핑
const nodeTypes = {
  custom: CustomNode,
};

// 엣지 타입 매핑
const edgeTypes = {
  custom: CustomEdge,
};

export type WorkflowProps = {
  initialNodes?: Node[];
  initialEdges?: Edge[];
};

interface ContextMenuState {
  x: number;
  y: number;
  nodeId?: string;
  edgeId?: string;
}

/**
 * Workflow 컴포넌트 (내부)
 * React Flow를 래핑하여 워크플로우 캔버스를 제공
 */
const WorkflowInner = () => {
  const { botId } = useParams<{ botId: string }>();

  // Zustand 스토어 사용
  const {
    nodes,
    edges,
    isLoading,
    selectedNodeId,
    isChatVisible,
    setNodes,
    setEdges,
    loadWorkflow,
    selectNode,
    toggleChatVisibility,
  } = useWorkflowStore();

  const { push } = useHistoryStore();

  // Deployment store는 다이얼로그 컴포넌트 내부에서 사용됨

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const { screenToFlowPosition } = useReactFlow();

  // 실시간 검증 비활성화
  useRealtimeValidation(false);

  // 키보드 단축키 (Undo/Redo)
  useKeyboardShortcuts();

  // 게시하기 단축키 (Cmd/Ctrl+Shift+P, E)
  useWorkflowShortcuts(botId || '');

  // 워크플로우 로드
  useEffect(() => {
    if (botId) {
      loadWorkflow(botId);
    }
  }, [botId, loadWorkflow]);

  // React Flow 상태 변경 핸들러
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const newNodes = applyNodeChanges(changes, nodes);
      setNodes(newNodes);
      push(newNodes, edges);
    },
    [nodes, edges, setNodes, push]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const newEdges = applyEdgeChanges(changes, edges);
      setEdges(newEdges);
      push(nodes, newEdges);
    },
    [nodes, edges, setEdges, push]
  );

  // 노드 연결 처리
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, type: 'custom' }, eds));
    },
    [setEdges]
  );

  // 노드 클릭 핸들러 (선택)
  const onNodeClick: NodeMouseHandler = useCallback(
    (event, node) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  // 빈 공간 클릭 핸들러 (선택 해제 및 채팅창 숨기기)
  const onPaneClick = useCallback(() => {
    selectNode(null);
    if (isChatVisible) {
      toggleChatVisibility();
    }
  }, [selectNode, isChatVisible, toggleChatVisibility]);

  // 노드 우클릭 핸들러
  const onNodeContextMenu: NodeMouseHandler = useCallback((event, node) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      nodeId: node.id,
    });
  }, []);

  // 엣지 우클릭 핸들러
  const onEdgeContextMenu: EdgeMouseHandler = useCallback((event, edge) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      edgeId: edge.id,
    });
  }, []);

  // 캔버스 우클릭 핸들러 (노드 추가)
  const onPaneContextMenu = useCallback(
    (event: MouseEvent | React.MouseEvent) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
      });
    },
    []
  );

  // 컨텍스트 메뉴 닫기
  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // 노드 삭제
  const handleDeleteNode = useCallback(() => {
    if (contextMenu?.nodeId) {
      setNodes((nds) => nds.filter((node) => node.id !== contextMenu.nodeId));
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            edge.source !== contextMenu.nodeId &&
            edge.target !== contextMenu.nodeId
        )
      );
    }
    closeContextMenu();
  }, [contextMenu, setNodes, setEdges, closeContextMenu]);

  // 엣지 삭제
  const handleDeleteEdge = useCallback(() => {
    if (contextMenu?.edgeId) {
      setEdges((eds) => eds.filter((edge) => edge.id !== contextMenu.edgeId));
    }
    closeContextMenu();
  }, [contextMenu, setEdges, closeContextMenu]);

  // 노드 추가
  const handleAddNode = useCallback(
    (nodeType: BlockEnum) => {
      if (!contextMenu) return;

      const position = screenToFlowPosition({
        x: contextMenu.x,
        y: contextMenu.y,
      });

      const newNode: Node = {
        id: `${Date.now()}`,
        type: 'custom',
        position,
        data: {
          type: nodeType,
          title: nodeType,
          desc: getNodeDescription(nodeType),
          ...(nodeType === BlockEnum.LLM && {
            model: { provider: 'OpenAI', name: 'GPT-4' },
            prompt: '프롬프트를 입력하세요.',
          }),
          ...(nodeType === BlockEnum.KnowledgeRetrieval && {
            dataset: 'Dataset',
            retrievalMode: 'Semantic Search',
            topK: 5,
            documentIds: [],
          }),
        },
      };

      setNodes((nds) => [...nds, newNode]);
      closeContextMenu();
    },
    [contextMenu, screenToFlowPosition, setNodes, closeContextMenu]
  );

  // 키보드 이벤트 (Delete/Backspace)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isInputElement =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable;

      if (isInputElement) {
        return;
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        setNodes(nodes.filter((node) => !node.selected));
        setEdges(edges.filter((edge) => !edge.selected));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [nodes, edges, setNodes, setEdges]);

  // 로딩 상태 UI
  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-2 text-sm text-gray-600">
            워크플로우를 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative bg-gray-50">
      {/* ReactFlow 캔버스 - 전체 영역 차지 */}
      <div className="absolute inset-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onNodeContextMenu={onNodeContextMenu}
          onEdgeContextMenu={onEdgeContextMenu}
          onPaneContextMenu={onPaneContextMenu}
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

      {/* 상단 툴바 - 캔버스 위 오버레이 (absolute 고정) */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center pointer-events-none">
        <div className="pointer-events-auto">
          <UndoRedoButtons />
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Preview 버튼 */}
          <button
            onClick={toggleChatVisibility}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
            title={isChatVisible ? '채팅 미리보기 숨기기' : '채팅 미리보기 보기'}
          >
            {isChatVisible ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span className="text-sm font-medium">미리보기</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">미리보기</span>
              </>
            )}
          </button>

          <SaveButton />

          {/* 게시하기 드롭다운 */}
          {botId && <PublishDropdown botId={botId} />}
        </div>
      </div>

      {/* 컨텍스트 메뉴 백드롭 */}
      {contextMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={closeContextMenu}
          onContextMenu={(event) => {
            event.preventDefault();
            closeContextMenu();
          }}
        />
      )}

      {/* 컨텍스트 메뉴 */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={closeContextMenu}
          onDeleteNode={contextMenu.nodeId ? handleDeleteNode : undefined}
          onDeleteEdge={contextMenu.edgeId ? handleDeleteEdge : undefined}
          onAddNode={
            !contextMenu.nodeId && !contextMenu.edgeId
              ? handleAddNode
              : undefined
          }
        />
      )}

      {/* 우측 노드 설정 패널 - absolute 오버레이 (노드 선택 시에만 표시) */}
      {selectedNodeId && (
        <div className="absolute top-20 right-0 bottom-0 w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto z-20 shadow-lg">
          <NodeConfigPanel />
        </div>
      )}

      {/* 배포 관련 다이얼로그 */}
      {botId && (
        <>
          <EmbedWebsiteDialog botId={botId} />
          <ApiReferenceDialog botId={botId} />
        </>
      )}
    </div>
  );
};

// 노드 타입별 설명
function getNodeDescription(nodeType: BlockEnum): string {
  switch (nodeType) {
    case BlockEnum.Start:
      return '시작 노드';
    case BlockEnum.LLM:
      return 'AI 응답 생성';
    case BlockEnum.KnowledgeRetrieval:
      return '지식 검색';
    case BlockEnum.End:
      return '종료 노드';
    default:
      return '';
  }
}

/**
 * Workflow 컴포넌트 (외부)
 * ReactFlowProvider로 래핑하여 컨텍스트 제공
 */
const Workflow = () => {
  return (
    <ReactFlowProvider>
      <WorkflowInner />
    </ReactFlowProvider>
  );
};

export default memo(Workflow);
