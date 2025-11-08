import { create } from 'zustand';
import type { Node, Edge } from '@/shared/types/workflow.types';

/**
 * Workflow Store 상태 타입
 */
interface WorkflowState {
  // 상태
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  isLoading: boolean;
  isSaving: boolean;
  validationErrors: string[];
  validationWarnings: string[];
  isChatVisible: boolean;

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
  saveWorkflow: (botId: string) => Promise<void>;

  // 검증 (두 가지 방식)
  validateWorkflow: () => Promise<boolean>; // 일반 검증 (실시간 검증용)
  validateBotWorkflow: (botId: string) => Promise<boolean>; // 봇 전용 검증 (저장 전)

  // 선택
  selectNode: (id: string | null) => void;

  // UI 제어
  toggleChatVisibility: () => void;

  // 리셋
  reset: () => void;
}

/**
 * 초기 상태
 */
const initialState = {
  nodes: [],
  edges: [],
  selectedNodeId: null,
  isLoading: false,
  isSaving: false,
  validationErrors: [],
  validationWarnings: [],
  isChatVisible: false,
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
    set({ isLoading: true });
    try {
      const { botApi } = await import('@/features/bot/api/botApi');
      const bot = await botApi.getById(botId);

      if (bot.workflow) {
        const { nodes, edges } = bot.workflow;
        set({ nodes, edges });
      } else {
        set({ nodes: [], edges: [] });
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
      const { nodes, edges } = get();
      const { workflowApi } = await import('../../workflow/api/workflowApi');
      await workflowApi.saveBotWorkflow(botId, nodes, edges);
    } catch (error) {
      console.error('Failed to save workflow:', error);
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  // 일반 검증 (실시간 검증용 - 팀 권한 체크 없음)
  validateWorkflow: async () => {
    const { nodes, edges } = get();

    try {
      const { workflowApi } = await import('../../workflow/api/workflowApi');
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
      const { workflowApi } = await import('../../workflow/api/workflowApi');
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

  // 선택
  selectNode: (id) => set({ selectedNodeId: id }),

  // UI 제어
  toggleChatVisibility: () =>
    set((state) => ({ isChatVisible: !state.isChatVisible })),

  // 리셋
  reset: () => set(initialState),
}));
