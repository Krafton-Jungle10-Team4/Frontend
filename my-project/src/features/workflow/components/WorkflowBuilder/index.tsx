
import type React from 'react';
import { useCallback, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  ReactFlowProvider,
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
import {
  AlignHorizontalJustifyCenter,
  Eye,
  EyeOff,
} from 'lucide-react';

import { Button } from '@shared/components/button';
import type { Node, Edge, IfElseCase, Topic, VisionConfig } from '@/shared/types/workflow.types';
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
import { computeWorkflowAutoLayout } from '../../utils/autoLayout';
import { withEdgeMetadata } from '../../utils/edgeHelpers';
import type { NodeTypeResponse } from '../../types/api.types';
import { useWorkflowAutoSave } from '../../hooks/useWorkflowAutoSave';
import { WorkflowSettingsDialog } from '../WorkflowSettingsDialog';
import { clonePortSchema, cloneNodePortSchema } from '@/shared/constants/nodePortSchemas';
import {
  generateIfElsePortSchema,
  createDefaultIfElseCase,
} from '../nodes/if-else/utils/portSchemaGenerator';
import {
  generateQuestionClassifierPortSchema,
  createDefaultQuestionClassifierClasses,
} from '../nodes/question-classifier/utils/portSchemaGenerator';
import { ValidationPanel } from '../ValidationPanel/ValidationPanel';
import { ConversationVariablePanel } from '../ConversationVariablePanel';

// React Flow 노드 타입 매핑 (React Flow가 인식할 수 있는 컴포넌트 매핑)
const REACT_FLOW_NODE_TYPES = {
  custom: CustomNode,
};

// React Flow 엣지 타입 매핑
const REACT_FLOW_EDGE_TYPES = {
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
    reset,
    nodeTypes: availableNodeTypes,  // 백엔드에서 로드한 노드 타입 정의 목록
    loadNodeTypes,
    addEdge: addWorkflowEdge,
    deleteEdge: deleteWorkflowEdge,
    deleteNode: deleteWorkflowNode,
  } = useWorkflowStore();

  const { push } = useHistoryStore();

  // Deployment store는 다이얼로그 컴포넌트 내부에서 사용됨

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [panelWidth, setPanelWidth] = useState(320); // 초기 너비 320px (w-80)
  const [isResizing, setIsResizing] = useState(false);
  const [isConversationPanelOpen, setConversationPanelOpen] = useState(false);
  const { screenToFlowPosition } = useReactFlow();

  // 실시간 검증 비활성화
  useRealtimeValidation(false);

  // 키보드 단축키 (Undo/Redo)
  useKeyboardShortcuts();

  // 게시하기 단축키 (Cmd/Ctrl+Shift+P, E)
  useWorkflowShortcuts(botId || '');

  // 봇 변경 시 상태 초기화 및 워크플로우 로드
  useEffect(() => {
    // 기존 상태 초기화 (선택/미리보기 등 정리)
    reset();

    // botId가 존재할 때만 워크플로우 로드
    if (botId) {
      loadWorkflow(botId);
    }

    // 언마운트 시에도 잔여 상태 정리
    return () => {
      reset();
    };
  }, [botId, loadWorkflow, reset]);

  // 노드 타입 사전 로드
  useEffect(() => {
    if (availableNodeTypes.length === 0) {
      loadNodeTypes().catch((error) => {
        console.error('Failed to load node types:', error);
      });
    }
  }, [availableNodeTypes.length, loadNodeTypes]);

  useWorkflowAutoSave(botId);

  // 패널 리사이즈 핸들러
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); // 텍스트 선택 방지
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    // 리사이즈 중 텍스트 선택 방지
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX - 16; // 16px은 right-4 여백
      // 최소 280px, 최대 600px로 제한
      setPanelWidth(Math.min(Math.max(newWidth, 280), 600));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizing]);

  // React Flow 상태 변경 핸들러
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const newNodes = applyNodeChanges(changes, nodes);
      setNodes(newNodes);
      push(newNodes, edges);

      // 선택 상태 변경 감지하여 selectedNodeId 업데이트
      const selectChange = changes.find((change) => change.type === 'select');
      if (selectChange && 'selected' in selectChange) {
        const selectedNode = newNodes.find((node) => node.selected);
        selectNode(selectedNode?.id || null);
      }
    },
    [nodes, edges, setNodes, push, selectNode]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (!changes.length) return;

      const removals = changes.filter((change) => change.type === 'remove');
      const otherChanges = changes.filter((change) => change.type !== 'remove');

      if (removals.length) {
        removals.forEach((change) => {
          if ('id' in change && change.id) {
            deleteWorkflowEdge(change.id);
          }
        });
      }

      if (otherChanges.length) {
        const currentEdges = useWorkflowStore.getState().edges;
        const nextEdges = applyEdgeChanges(otherChanges, currentEdges);
        setEdges(nextEdges);
      }

      const latestState = useWorkflowStore.getState();
      push(latestState.nodes, latestState.edges);
    },
    [deleteWorkflowEdge, setEdges, push]
  );

  // 노드 연결 처리
  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) {
        return;
      }

      const enriched = withEdgeMetadata(connection, nodes);
      const newEdge: Edge = {
        id: `edge-${enriched.source}-${enriched.target}`,
        source: enriched.source!,
        target: enriched.target!,
        sourceHandle: enriched.sourceHandle,
        targetHandle: enriched.targetHandle,
        type: enriched.type || 'custom',
        data: enriched.data,
      };

      addWorkflowEdge(newEdge);

      const latestState = useWorkflowStore.getState();
      push(latestState.nodes, latestState.edges);
    },
    [nodes, addWorkflowEdge, push]
  );

  const handleAutoLayout = useCallback(() => {
    if (nodes.length === 0) return;

    const laidOutNodes = computeWorkflowAutoLayout(nodes, edges);
    setNodes(laidOutNodes);
    push(laidOutNodes, edges);
  }, [nodes, edges, setNodes, push]);

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
      deleteWorkflowNode(contextMenu.nodeId);
      const latestState = useWorkflowStore.getState();
      push(latestState.nodes, latestState.edges);
    }
    closeContextMenu();
  }, [contextMenu, deleteWorkflowNode, closeContextMenu, push]);

  // 엣지 삭제
  const handleDeleteEdge = useCallback(() => {
    if (contextMenu?.edgeId) {
      deleteWorkflowEdge(contextMenu.edgeId);
      const latestState = useWorkflowStore.getState();
      push(latestState.nodes, latestState.edges);
    }
    closeContextMenu();
  }, [contextMenu, deleteWorkflowEdge, closeContextMenu, push]);

  // 노드 추가
  const handleAddNode = useCallback(
    (nodeType: NodeTypeResponse) => {
      if (!contextMenu) return;

      const position = screenToFlowPosition({
        x: contextMenu.x,
        y: contextMenu.y,
      });

      let portSchema =
        cloneNodePortSchema(nodeType.ports) || clonePortSchema(nodeType.type);

      const defaultData = {
        ...(nodeType.default_data || {}),
      } as Record<string, any>;

      if (nodeType.type === BlockEnum.IfElse) {
        const currentCases = Array.isArray(defaultData.cases)
          ? (defaultData.cases as IfElseCase[])
          : [];
        const ensuredCases =
          currentCases.length > 0 ? currentCases : [createDefaultIfElseCase()];
        defaultData.cases = ensuredCases;
        portSchema = generateIfElsePortSchema(ensuredCases);
      }

      if (nodeType.type === BlockEnum.QuestionClassifier) {
        const currentClasses = Array.isArray(defaultData.classes)
          ? (defaultData.classes as Topic[])
          : [];
        const ensuredClasses =
          currentClasses.length > 0
            ? currentClasses
            : createDefaultQuestionClassifierClasses();
        defaultData.classes = ensuredClasses;
        const vision = defaultData.vision as VisionConfig | undefined;
        portSchema = generateQuestionClassifierPortSchema(ensuredClasses, vision);
      }

      const newNode: Node = {
        id: `${Date.now()}`,
        type: 'custom',
        position,
        data: {
          type: nodeType.type as BlockEnum,
          title: nodeType.label || nodeType.type,
          desc: nodeType.description || getNodeDescription(nodeType.type as BlockEnum),
          ports: portSchema,
          ...defaultData,
          ...(nodeType.type === BlockEnum.LLM && {
            provider: 'openai',
            model: { provider: 'openai', name: 'gpt-4o-mini' },
            prompt: '프롬프트를 입력하세요.',
          }),
          ...(nodeType.type === BlockEnum.KnowledgeRetrieval && {
            dataset: '',
            retrievalMode: 'semantic',
            topK: 5,
            documentIds: [],
          }),
        },
      };

      setNodes((nds) => {
        const updatedNodes = [...nds, newNode];
        push(updatedNodes, edges);
        return updatedNodes;
      });
      closeContextMenu();
    },
    [contextMenu, screenToFlowPosition, setNodes, closeContextMenu, push, edges]
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
        let mutated = false;

        nodes
          .filter((node) => node.selected)
          .forEach((node) => {
            deleteWorkflowNode(node.id);
            mutated = true;
          });

        edges
          .filter((edge) => edge.selected)
          .forEach((edge) => {
            deleteWorkflowEdge(edge.id);
            mutated = true;
          });

        if (mutated) {
          const latestState = useWorkflowStore.getState();
          push(latestState.nodes, latestState.edges);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [nodes, edges, deleteWorkflowNode, deleteWorkflowEdge, push]);

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
    <div className="h-full w-full relative bg-gray-100">
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
          nodeTypes={REACT_FLOW_NODE_TYPES}
          edgeTypes={REACT_FLOW_EDGE_TYPES}
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
            color="#d1d5db"
          />
        </ReactFlow>
      </div>

      {/* 상단 툴바 - 캔버스 위 오버레이 (absolute 고정) */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center pointer-events-none">
        <div className="pointer-events-auto">
          <UndoRedoButtons />
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          <ValidationPanel className="w-72 shrink-0" />

          {/* Preview 버튼 */}
          <Button
            variant="outline"
            onClick={toggleChatVisibility}
            title={isChatVisible ? '채팅 미리보기 숨기기' : '채팅 미리보기 보기'}
            className="!text-blue-600 hover:!text-blue-700"
          >
            {isChatVisible ? (
              <>
                <EyeOff className="w-4 h-4" />
                미리보기
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                미리보기
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={handleAutoLayout}
            disabled={nodes.length === 0}
            title="노드 자동 정렬"
          >
            <AlignHorizontalJustifyCenter className="w-4 h-4" />
            정렬
          </Button>

          <Button
            variant="outline"
            onClick={() => setConversationPanelOpen(true)}
            title="대화 변수 관리"
          >
            대화 변수
          </Button>

          <WorkflowSettingsDialog />

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
        <div
          className="absolute top-20 right-4 bottom-4 border border-gray-300 dark:border-gray-600 border-l-2 bg-white dark:bg-gray-800 overflow-hidden z-20 shadow-2xl rounded-xl"
          style={{ width: `${panelWidth}px` }}
        >
          {/* 리사이즈 핸들 */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors group select-none"
            onMouseDown={handleResizeStart}
          >
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-10 bg-gray-400 dark:bg-gray-500 rounded-full group-hover:bg-blue-500 select-none" />
          </div>
          <NodeConfigPanel />
        </div>
      )}

      {/* 배포 관련 다이얼로그 */}

      <ConversationVariablePanel
        open={isConversationPanelOpen}
        onOpenChange={setConversationPanelOpen}
      />
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

export default Workflow;
