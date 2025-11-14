import { create } from 'zustand';
import type { Node, Edge } from '@/shared/types/workflow.types';
import { workflowApi } from '../api/workflowApi';
import { transformFromBackend } from '@/shared/utils/workflowTransform';
import { DEFAULT_WORKFLOW } from '@/shared/constants/defaultWorkflow';
import type {
  NodeTypeResponse,
  WorkflowValidationMessage,
  WorkflowVersionSummary,
} from '../types/api.types';

/**
 * 워크플로우 실행 상태
 */
export interface ExecutionState {
  status: 'idle' | 'running' | 'success' | 'error';
  currentNodeId: string | null;
  executedNodes: string[];
  /**
   * Real-time output values from executed nodes
   * Format: { [nodeId]: { [portName]: value } }
   */
  nodeOutputs: Record<string, Record<string, unknown>>;
  error?: string;
}

/**
 * Workflow Store 상태 타입
 */
interface WorkflowState {
  // 상태
  botId: string | null;
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  isLoading: boolean;
  isSaving: boolean;
  validationErrors: WorkflowValidationMessage[];
  validationWarnings: WorkflowValidationMessage[];
  isChatVisible: boolean;
  executionState: ExecutionState | null;
  draftVersionId: string | null;
  environmentVariables: Record<string, unknown>;
  conversationVariables: Record<string, unknown>;
  nodeTypes: NodeTypeResponse[];
  nodeTypesLoading: boolean;
  lastSavedAt: string | null;

  // 노드 관리
  setNodes: (nodesOrUpdater: Node[] | ((nodes: Node[]) => Node[])) => void;
  addNode: (node: Node) => void;
  updateNode: (id: string, data: Partial<Node['data']>) => void;
  deleteNode: (id: string) => void;

  // 엣지 관리
  setEdges: (edgesOrUpdater: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  addEdge: (edge: Edge) => void;
  deleteEdge: (id: string) => void;

  // 워크플로우 CRUD
  loadWorkflow: (botId: string) => Promise<void>;
  saveWorkflow: (botId: string) => Promise<WorkflowVersionSummary | null>;
  publishWorkflow: (botId: string) => Promise<WorkflowVersionSummary | null>;

  // 검증 (두 가지 방식)
  validateWorkflow: () => Promise<boolean>; // 일반 검증 (실시간 검증용)
  validateBotWorkflow: (botId: string) => Promise<boolean>; // 봇 전용 검증 (저장 전)

  // 실행 상태 관리
  updateExecutionState: (updates: Partial<ExecutionState>) => void;
  onNodeExecutionComplete: (
    nodeId: string,
    outputs: Record<string, unknown>
  ) => void;
  startExecution: () => void;
  completeExecution: () => void;
  failExecution: (error: string) => void;

  // 선택
  selectNode: (id: string | null) => void;

  // UI 제어
  toggleChatVisibility: () => void;

  // 워크플로우 설정
  setEnvironmentVariables: (vars: Record<string, unknown>) => void;
  setConversationVariables: (vars: Record<string, unknown>) => void;

  // 노드 타입
  loadNodeTypes: () => Promise<NodeTypeResponse[]>;

  // 리셋
  reset: () => void;
}

/**
 * 초기 상태
 */
const initialState = {
  botId: null,
  nodes: [],
  edges: [],
  selectedNodeId: null,
  isLoading: false,
  isSaving: false,
  validationErrors: [],
  validationWarnings: [],
  isChatVisible: false,
  executionState: null,
  draftVersionId: null,
  environmentVariables: {},
  conversationVariables: {},
  nodeTypes: [],
  nodeTypesLoading: false,
  lastSavedAt: null,
};

/**
 * Workflow Store
 *
 * React Flow 기반 워크플로우 빌더의 상태 관리 및 API 통합
 */
export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  // 초기 상태
  ...initialState,

  // 노드 관리
  setNodes: (nodesOrUpdater) => {
    if (typeof nodesOrUpdater === 'function') {
      set((state) => ({ nodes: nodesOrUpdater(state.nodes) }));
    } else {
      set({ nodes: nodesOrUpdater });
    }
  },

  addNode: (node) => {
    const currentState = get();
    const newNodes = [...currentState.nodes, node];
    set({ nodes: newNodes });
  },

  updateNode: (id, data) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      ),
    })),

  deleteNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter(
        (edge) => edge.source !== id && edge.target !== id
      ),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    })),

  // 엣지 관리
  setEdges: (edgesOrUpdater) => {
    if (typeof edgesOrUpdater === 'function') {
      set((state) => ({ edges: edgesOrUpdater(state.edges) }));
    } else {
      set({ edges: edgesOrUpdater });
    }
  },

  addEdge: (edge) =>
    set((state) => ({
      edges: [...state.edges, edge],
    })),

  deleteEdge: (id) =>
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== id),
    })),

  // 워크플로우 불러오기
  loadWorkflow: async (botId: string) => {
    set({ isLoading: true, botId });
    try {
      const state = get();
      if (!state.nodeTypes.length) {
        await get().loadNodeTypes();
      }

      const versions = await workflowApi.listWorkflowVersions(botId, {
        status: 'draft',
      });

      if (versions.length > 0) {
        const draft = versions[0];
        const detail = await workflowApi.getWorkflowVersionDetail(
          botId,
          draft.id
        );
        const graph = transformFromBackend(detail.graph);

        set({
          nodes: graph.nodes,
          edges: graph.edges,
          draftVersionId: detail.id,
          environmentVariables: detail.environment_variables || {},
          conversationVariables: detail.conversation_variables || {},
          lastSavedAt: detail.updated_at,
        });
      } else {
        const clonedNodes = DEFAULT_WORKFLOW.nodes.map((node) => ({
          ...node,
          data: { ...node.data },
        }));
        const clonedEdges = DEFAULT_WORKFLOW.edges.map((edge) => ({ ...edge }));

        set({
          nodes: clonedNodes,
          edges: clonedEdges,
          draftVersionId: null,
          environmentVariables: {},
          conversationVariables: {},
          lastSavedAt: null,
        });
      }
    } catch (error) {
      console.error('Failed to load workflow:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // 워크플로우 저장
  saveWorkflow: async (botId: string) => {
    set({ isSaving: true });
    try {
      const { nodes, edges, environmentVariables, conversationVariables } = get();
      const result = await workflowApi.upsertDraftWorkflow(
        botId,
        nodes,
        edges,
        {
          environment_variables: environmentVariables,
          conversation_variables: conversationVariables,
        }
      );

      set({
        draftVersionId: result.id,
        lastSavedAt: result.updated_at ?? new Date().toISOString(),
      });

      return result;
    } catch (error) {
      console.error('Failed to save workflow:', error);
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  publishWorkflow: async (botId: string) => {
    const { draftVersionId } = get();
    if (!draftVersionId) {
      console.warn('No draft version available to publish');
      return null;
    }

    await get().saveWorkflow(botId);
    const result = await workflowApi.publishWorkflowVersion(
      botId,
      draftVersionId
    );
    return result;
  },

  // 일반 검증 (실시간 검증용 - 팀 권한 체크 없음)
  validateWorkflow: async () => {
    const { nodes, edges } = get();

    try {
      const result = await workflowApi.validate(nodes, edges);
      set({
        validationErrors: result.errors,
        validationWarnings: result.warnings,
      });
      return result.is_valid;
    } catch (error) {
      console.error('Failed to validate workflow:', error);
      return false;
    }
  },

  // 봇 전용 검증 (저장 전 - 팀 권한/봇 존재 여부 체크)
  validateBotWorkflow: async (botId: string) => {
    const { nodes, edges } = get();

    try {
      const result = await workflowApi.validateBotWorkflow(botId, nodes, edges);
      set({
        validationErrors: result.errors,
        validationWarnings: result.warnings,
      });
      return result.is_valid;
    } catch (error) {
      console.error('Failed to validate bot workflow:', error);
      return false;
    }
  },

  // 실행 상태 관리
  updateExecutionState: (updates) => {
    set((state) => ({
      executionState: state.executionState
        ? { ...state.executionState, ...updates }
        : null,
    }));
  },

  onNodeExecutionComplete: (nodeId, outputs) => {
    set((state) => ({
      executionState: state.executionState
        ? {
            ...state.executionState,
            executedNodes: [...state.executionState.executedNodes, nodeId],
            nodeOutputs: {
              ...state.executionState.nodeOutputs,
              [nodeId]: outputs,
            },
          }
        : null,
    }));
  },

  startExecution: () => {
    set({
      executionState: {
        status: 'running',
        currentNodeId: null,
        executedNodes: [],
        nodeOutputs: {},
      },
    });
  },

  completeExecution: () => {
    set((state) => ({
      executionState: state.executionState
        ? { ...state.executionState, status: 'success', currentNodeId: null }
        : null,
    }));
  },

  failExecution: (error) => {
    set((state) => ({
      executionState: state.executionState
        ? {
            ...state.executionState,
            status: 'error',
            currentNodeId: null,
            error,
          }
        : null,
    }));
  },

  // 선택 (React Flow가 nodes[].selected를 자동 관리하므로 selectedNodeId만 업데이트)
  selectNode: (id) => set({ selectedNodeId: id }),

  // UI 제어
  toggleChatVisibility: () =>
    set((state) => ({ isChatVisible: !state.isChatVisible })),

  setEnvironmentVariables: (vars) => set({ environmentVariables: vars }),

  setConversationVariables: (vars) =>
    set({ conversationVariables: vars }),

  loadNodeTypes: async () => {
    const state = get();
    if (state.nodeTypes.length) {
      return state.nodeTypes;
    }

    set({ nodeTypesLoading: true });
    try {
      const nodeTypes = await workflowApi.getNodeTypes();
      set({ nodeTypes, nodeTypesLoading: false });
      return nodeTypes;
    } catch (error) {
      set({ nodeTypesLoading: false });
      throw error;
    }
  },

  // 리셋
  reset: () =>
    set((state) => ({
      ...initialState,
      nodeTypes: state.nodeTypes,
      nodeTypesLoading: state.nodeTypesLoading,
    })),
}));
