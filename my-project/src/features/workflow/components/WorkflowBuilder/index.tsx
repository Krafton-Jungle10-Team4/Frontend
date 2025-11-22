import type React from 'react';
import { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
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
import { AlignHorizontalJustifyCenter, MessageSquare, Download, CheckCircle2, Lock, Variable } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@shared/components/badge';

import { Button } from '@shared/components/button';
import type {
  Node,
  Edge,
  IfElseCase,
  Topic,
  VisionConfig,
} from '@/shared/types/workflow.types';
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
import { sanitizeConnectionForLogicalTargets } from '../../utils/logicalNodeGuards';
import type { NodeTypeResponse } from '../../types/api.types';
import { useWorkflowAutoSave } from '../../hooks/useWorkflowAutoSave';
import { WorkflowSettingsDialog } from '../WorkflowSettingsDialog';
import {
  clonePortSchema,
  cloneNodePortSchema,
} from '@/shared/constants/nodePortSchemas';
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
import { BotImportAsNodeDialog } from '../dialogs/BotImportAsNodeDialog';
import { ImportedWorkflowNode } from '../nodes/imported-workflow/node';

// React Flow 노드 타입 매핑 (React Flow가 인식할 수 있는 컴포넌트 매핑)
const REACT_FLOW_NODE_TYPES = {
  custom: CustomNode,
  'imported-workflow': ImportedWorkflowNode,
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // versionId를 쿼리 파라미터에서 추출
  const versionId = useMemo(() => searchParams.get('versionId') || undefined, [searchParams]);

  // readonly 모드와 source 확인
  const isReadonly = useMemo(() => searchParams.get('mode') === 'readonly', [searchParams]);
  const source = useMemo(() => searchParams.get('source'), [searchParams]);

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
    nodeTypes: availableNodeTypes, // 백엔드에서 로드한 노드 타입 정의 목록
    loadNodeTypes,
    addEdge: addWorkflowEdge,
    deleteEdge: deleteWorkflowEdge,
    deleteNode: deleteWorkflowNode,
  } = useWorkflowStore();

  const { push } = useHistoryStore();

  // Deployment store는 다이얼로그 컴포넌트 내부에서 사용됨

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [panelWidth, setPanelWidth] = useState(360); // 초기 너비 360px
  const [isResizing, setIsResizing] = useState(false);
  const [isConversationPanelOpen, setConversationPanelOpen] = useState(false);
  const [isBotImportDialogOpen, setIsBotImportDialogOpen] = useState(false);
  const { screenToFlowPosition, fitView, getNodes } = useReactFlow();
  const prevBotIdRef = useRef<string | undefined>();
  const initialFitViewDoneRef = useRef(false);

  // 실시간 검증 비활성화
  useRealtimeValidation(false);

  // 키보드 단축키 (Undo/Redo)
  useKeyboardShortcuts();

  // 게시하기 단축키 (Cmd/Ctrl+Shift+P, E)
  useWorkflowShortcuts(botId || '');

  // 버전 선택 핸들러
  const handleSelectVersion = useCallback(() => {
    if (!botId || !versionId) return;

    console.log('[WorkflowBuilder] Navigating to deployment page with versionId:', versionId);
    console.log('[WorkflowBuilder] botId:', botId);

    // 배포 페이지로 이동하면서 선택된 버전 ID를 state로 전달
    navigate(`/workspace/deployment/${botId}`, {
      state: { selectedVersionId: versionId }
    });

    // 토스트는 배포 페이지에서만 표시하므로 여기서는 제거
  }, [botId, versionId, navigate]);

  // 마켓플레이스에서 가져오기 핸들러
  const handleImportFromMarketplace = useCallback(async () => {
    const marketplaceItemId = searchParams.get('marketplaceItemId');

    if (!marketplaceItemId) {
      toast.error('마켓플레이스 아이템 정보가 없습니다.');
      return;
    }

    const toastId = toast.loading('워크플로우를 가져오는 중...');

    try {
      const { importMarketplaceWorkflow } = await import('@/features/marketplace/api/marketplaceApi');
      const result = await importMarketplaceWorkflow(marketplaceItemId);

      toast.success('워크플로우를 내 스튜디오로 가져왔습니다.', { id: toastId });

      // 스튜디오 페이지로 이동
      navigate('/workspace/studio');
    } catch (error) {
      console.error('[WorkflowBuilder] Failed to import workflow:', error);
      toast.error('워크플로우 가져오기에 실패했습니다.', { id: toastId });
    }
  }, [searchParams, navigate]);

  // 봇 또는 버전 변경 시 상태 초기화 및 워크플로우 로드
  useEffect(() => {
    // 기존 상태 초기화 (선택/미리보기 등 정리)
    reset();

    // botId가 존재할 때만 워크플로우 로드
    if (botId) {
      console.log('[WorkflowBuilder] Loading workflow:', { botId, versionId });
      loadWorkflow(botId, versionId);
    }

    // 언마운트 시에도 잔여 상태 정리
    return () => {
      reset();
    };
  }, [botId, versionId, loadWorkflow, reset]);

  // 노드 타입 사전 로드
  useEffect(() => {
    if (availableNodeTypes.length === 0) {
      loadNodeTypes().catch((error) => {
        console.error('Failed to load node types:', error);
      });
    }
  }, [availableNodeTypes.length, loadNodeTypes]);

  // 워크플로우 로드 완료 후 fitView 호출
  useEffect(() => {
    const botIdChanged = prevBotIdRef.current !== botId;
    if (botIdChanged) {
      initialFitViewDoneRef.current = false;
    }
    prevBotIdRef.current = botId;

    console.log('[WorkflowBuilder] fitView useEffect triggered:', {
      botIdChanged,
      isLoading,
      nodesLength: nodes.length,
      initialFitViewDone: initialFitViewDoneRef.current,
    });

    if (!isLoading && nodes.length > 0 && !initialFitViewDoneRef.current) {
      console.log('[WorkflowBuilder] Setting timeout for fitView');
      // React Flow의 DOM이 완전히 렌더링될 때까지 대기
      const timer = setTimeout(() => {
        console.log('[WorkflowBuilder] Calling fitView now');
        fitView({ padding: 0.15, duration: 300 });
        initialFitViewDoneRef.current = true;
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [botId, isLoading, nodes.length, fitView]);

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
      // 최소 280px, 최대 450px로 제한
      setPanelWidth(Math.min(Math.max(newWidth, 280), 450));
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

      // 노드 삭제 시 선택 상태 초기화
      const removedIds = changes
        .filter((change) => change.type === 'remove' && 'id' in change)
        .map((change) => change.id)
        .filter((id): id is string => Boolean(id));
      if (removedIds.length) {
        const currentSelected = useWorkflowStore.getState().selectedNodeId;
        if (currentSelected && removedIds.includes(currentSelected)) {
          selectNode(null);
        }
      }

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

      const sanitizedConnection = sanitizeConnectionForLogicalTargets(connection, nodes);
      const enriched = withEdgeMetadata(sanitizedConnection, nodes);
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
    // getNodes()를 사용하여 measured 정보가 포함된 실제 렌더링된 노드를 가져옵니다
    const renderedNodes = getNodes();
    if (renderedNodes.length === 0) return;

    const laidOutNodes = computeWorkflowAutoLayout(renderedNodes, edges);
    setNodes(laidOutNodes);
    push(laidOutNodes, edges);
  }, [getNodes, edges, setNodes, push]);

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

  /**
   * 노드 타입을 기반으로 읽기 쉬운 노드 ID를 생성합니다.
   * @param nodeType - 노드 타입 (BlockEnum)
   * @param existingNodes - 기존 노드 배열
   * @returns 읽기 쉬운 형식의 노드 ID
   */
  const generateReadableNodeId = useCallback(
    (nodeType: BlockEnum, existingNodes: Node[]): string => {
      // 노드 타입별 베이스 ID 매핑
      const typeToBaseId: Record<BlockEnum, string> = {
        [BlockEnum.Start]: 'start',
        [BlockEnum.End]: 'end',
        [BlockEnum.LLM]: 'llm',
        [BlockEnum.Answer]: 'answer',
        [BlockEnum.KnowledgeRetrieval]: 'knowledge',
        [BlockEnum.KnowledgeBase]: 'knowledgeBase',
        [BlockEnum.MCP]: 'mcp',
        [BlockEnum.Code]: 'code',
        [BlockEnum.TemplateTransform]: 'template',
        [BlockEnum.IfElse]: 'condition',
        [BlockEnum.VariableAssigner]: 'varAssigner',
        [BlockEnum.Assigner]: 'assigner',
        [BlockEnum.Http]: 'http',
        [BlockEnum.QuestionClassifier]: 'classifier',
        [BlockEnum.TavilySearch]: 'tavilySearch',
      };

      const baseId = typeToBaseId[nodeType] || nodeType.replace(/-/g, '');

      // 같은 베이스 ID를 가진 노드들 찾기
      const sameTypeNodes = existingNodes.filter((node) => {
        // 정확한 베이스 ID로 시작하고, 바로 뒤에 숫자가 오거나 끝나는 경우만
        const pattern = new RegExp(`^${baseId}(\\d+)?$`);
        return pattern.test(node.id);
      });

      // 첫 번째 노드인 경우 숫자 없이 반환
      if (sameTypeNodes.length === 0) {
        return baseId;
      }

      // 사용 중인 숫자 찾기
      const usedNumbers = sameTypeNodes
        .map((node) => {
          const match = node.id.match(new RegExp(`^${baseId}(\\d+)?$`));
          if (match) {
            return match[1] ? parseInt(match[1], 10) : 1;
          }
          return 0;
        })
        .filter((num) => num > 0);

      // 다음 사용 가능한 숫자 찾기
      if (usedNumbers.length === 0) {
        return `${baseId}2`;
      }

      const maxNumber = Math.max(...usedNumbers);
      return `${baseId}${maxNumber + 1}`;
    },
    []
  );

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
        portSchema = generateQuestionClassifierPortSchema(
          ensuredClasses,
          vision
        );
      }

      const newNode: Node = {
        id: generateReadableNodeId(nodeType.type as BlockEnum, nodes),
        type: 'custom',
        position,
        data: {
          type: nodeType.type as BlockEnum,
          title: nodeType.label || nodeType.type,
          desc:
            nodeType.description ||
            getNodeDescription(nodeType.type as BlockEnum),
          ports: portSchema,
          ...defaultData,
        },
      };

      setNodes((nds) => {
        const updatedNodes = [...nds, newNode];
        push(updatedNodes, edges);
        return updatedNodes;
      });
      closeContextMenu();
    },
    [contextMenu, screenToFlowPosition, setNodes, closeContextMenu, push, edges, generateReadableNodeId, nodes]
  );

  // ReactFlow 초기화 완료 콜백
  const handleReactFlowInit = useCallback(() => {
    console.log('[WorkflowBuilder] ReactFlow onInit called, nodes:', nodes.length);
    if (nodes.length > 0 && !initialFitViewDoneRef.current) {
      setTimeout(() => {
        console.log('[WorkflowBuilder] onInit: Calling fitView');
        fitView({ padding: 0.15, duration: 300 });
        initialFitViewDoneRef.current = true;
      }, 100);
    }
  }, [nodes.length, fitView]);

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
          onNodesChange={(versionId || isReadonly) ? undefined : onNodesChange}
          onEdgesChange={(versionId || isReadonly) ? undefined : onEdgesChange}
          onConnect={(versionId || isReadonly) ? undefined : onConnect}
          onNodeClick={(versionId || isReadonly) ? undefined : onNodeClick}
          onPaneClick={onPaneClick}
          onNodeContextMenu={(versionId || isReadonly) ? undefined : onNodeContextMenu}
          onEdgeContextMenu={(versionId || isReadonly) ? undefined : onEdgeContextMenu}
          onPaneContextMenu={(versionId || isReadonly) ? undefined : onPaneContextMenu}
          onInit={handleReactFlowInit}
          nodeTypes={REACT_FLOW_NODE_TYPES}
          edgeTypes={REACT_FLOW_EDGE_TYPES}
          minZoom={0.25}
          maxZoom={2}
          nodesDraggable={!(versionId || isReadonly)}
          nodesConnectable={!(versionId || isReadonly)}
          nodesFocusable={!(versionId || isReadonly)}
          edgesFocusable={!(versionId || isReadonly)}
          elementsSelectable={!(versionId || isReadonly)}
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

      {/* 하단 Undo/Redo 버튼 - 왼쪽 하단 고정 */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
        <div className="pointer-events-auto">
          <UndoRedoButtons />
        </div>
      </div>

      {/* 상단 툴바 - 캔버스 위 오버레이 (absolute 고정) */}
      <div className="absolute top-4 left-4 right-2 z-10 flex justify-end items-center pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* 읽기 전용 모드 (versionId가 있거나 readonly 모드일 때) */}
          {(versionId || isReadonly) ? (
            <>
              {/* 읽기 전용 뱃지 */}
              <Badge
                variant="secondary"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 border border-gray-300"
              >
                <Lock className="w-4 h-4" />
                읽기 전용
              </Badge>

              {/* 버전 선택/가져오기 버튼 */}
              <Button
                onClick={source === 'marketplace' ? handleImportFromMarketplace : handleSelectVersion}
                className="!text-white rounded-none"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #000000, #3735c3)',
                }}
              >
                <CheckCircle2 className="w-4 h-4" />
                {source === 'marketplace' ? '이 버전 가져오기' : '이 버전 선택'}
              </Button>
            </>
          ) : (
            <>
              {/* 일반 모드 - 모든 편집 버튼 표시 */}
              <ValidationPanel className="w-72 shrink-0" />

              {/* 정렬 버튼 */}
              <Button
                variant="outline"
                onClick={handleAutoLayout}
                disabled={nodes.length === 0}
                title="노드 자동 정렬"
                className="!gap-2 relative overflow-hidden transition-all duration-300 hover:scale-105 before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-500 before:to-blue-600 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 before:-z-10 hover:!text-white hover:!border-blue-500"
              >
                <AlignHorizontalJustifyCenter className="w-4 h-4 flex-shrink-0 relative z-10" />
                <span className="whitespace-nowrap relative z-10">
                  정렬
                </span>
              </Button>

              {/* 미리보기 버튼 */}
              <Button
                variant="outline"
                onClick={toggleChatVisibility}
                title={
                  isChatVisible ? '채팅 미리보기 숨기기' : '채팅 미리보기 보기'
                }
                className="!gap-2 relative overflow-hidden transition-all duration-300 hover:scale-105 before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-500 before:to-blue-600 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 before:-z-10 hover:!text-white hover:!border-blue-500"
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0 relative z-10" />
                <span className="whitespace-nowrap relative z-10">
                  미리보기
                </span>
              </Button>

              {/* 대화 변수 버튼 */}
              <Button
                variant="outline"
                onClick={() => setConversationPanelOpen(true)}
                title="대화 변수 관리"
                className="!gap-2 relative overflow-hidden transition-all duration-300 hover:scale-105 before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-500 before:to-blue-600 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 before:-z-10 hover:!text-white hover:!border-blue-500"
              >
                <Variable className="w-4 h-4 flex-shrink-0 relative z-10" />
                <span className="whitespace-nowrap relative z-10">
                  대화 변수
                </span>
              </Button>

              {/* 가져오기 버튼 */}
              <Button
                variant="outline"
                onClick={() => setIsBotImportDialogOpen(true)}
                title="다른 봇의 워크플로우 가져오기"
                className="!gap-2 relative overflow-hidden transition-all duration-300 hover:scale-105 before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-500 before:to-blue-600 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 before:-z-10 hover:!text-white hover:!border-blue-500"
              >
                <Download className="w-4 h-4 flex-shrink-0 relative z-10" />
                <span className="whitespace-nowrap relative z-10">
                  가져오기
                </span>
              </Button>

              <SaveButton />

              {/* 게시하기 드롭다운 */}
              {botId && <PublishDropdown botId={botId} />}
            </>
          )}
        </div>
      </div>

      {/* 컨텍스트 메뉴 백드롭 - 읽기 전용 모드에서는 비활성화 */}
      {contextMenu && !versionId && (
        <div
          className="fixed inset-0 z-40"
          onClick={closeContextMenu}
          onContextMenu={(event) => {
            event.preventDefault();
            closeContextMenu();
          }}
        />
      )}

      {/* 컨텍스트 메뉴 - 읽기 전용 모드에서는 비활성화 */}
      {contextMenu && !versionId && (
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

      {/* 우측 노드 설정 패널 - absolute 오버레이 (노드 선택 시에만 표시, 읽기 전용 모드에서는 비활성화) */}
      {selectedNodeId && !versionId && (
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

      <BotImportAsNodeDialog
        open={isBotImportDialogOpen}
        onOpenChange={setIsBotImportDialogOpen}
        onImportSuccess={() => {
          // 성공 시 처리 (노드가 이미 추가됨)
        }}
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
