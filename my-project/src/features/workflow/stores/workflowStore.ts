import { create } from 'zustand';
import type { Node, Edge } from '@xyflow/react';

/**
 * Workflow Store 상태 타입
 */
interface WorkflowState {
  // 노드 및 엣지
  nodes: Node[];
  edges: Edge[];

  // 선택된 노드/엣지
  selectedNode: Node | null;
  selectedEdge: Edge | null;

  // 워크플로우 메타데이터
  workflowName: string;
  workflowDescription: string;

  // 실행 상태
  isRunning: boolean;

  // Actions - 노드 관리
  setNodes: (nodes: Node[]) => void;
  addNode: (node: Node) => void;
  updateNode: (id: string, data: Partial<Node>) => void;
  deleteNode: (id: string) => void;

  // Actions - 엣지 관리
  setEdges: (edges: Edge[]) => void;
  addEdge: (edge: Edge) => void;
  updateEdge: (id: string, data: Partial<Edge>) => void;
  deleteEdge: (id: string) => void;

  // Actions - 선택 관리
  selectNode: (node: Node | null) => void;
  selectEdge: (edge: Edge | null) => void;

  // Actions - 워크플로우 메타데이터
  setWorkflowName: (name: string) => void;
  setWorkflowDescription: (description: string) => void;

  // Actions - 실행 상태
  setIsRunning: (isRunning: boolean) => void;

  // Actions - 초기화
  reset: () => void;
}

/**
 * 초기 상태
 */
const initialState = {
  nodes: [],
  edges: [],
  selectedNode: null,
  selectedEdge: null,
  workflowName: '',
  workflowDescription: '',
  isRunning: false,
};

/**
 * Workflow Store
 *
 * React Flow 기반 워크플로우 빌더의 상태 관리
 */
export const useWorkflowStore = create<WorkflowState>((set) => ({
  ...initialState,

  // 노드 관리
  setNodes: (nodes) => set({ nodes }),

  addNode: (node) =>
    set((state) => ({
      nodes: [...state.nodes, node],
    })),

  updateNode: (id, data) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, ...data } : node
      ),
    })),

  deleteNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter(
        (edge) => edge.source !== id && edge.target !== id
      ),
      selectedNode: state.selectedNode?.id === id ? null : state.selectedNode,
    })),

  // 엣지 관리
  setEdges: (edges) => set({ edges }),

  addEdge: (edge) =>
    set((state) => ({
      edges: [...state.edges, edge],
    })),

  updateEdge: (id, data) =>
    set((state) => ({
      edges: state.edges.map((edge) =>
        edge.id === id ? { ...edge, ...data } : edge
      ),
    })),

  deleteEdge: (id) =>
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== id),
      selectedEdge: state.selectedEdge?.id === id ? null : state.selectedEdge,
    })),

  // 선택 관리
  selectNode: (node) => set({ selectedNode: node }),

  selectEdge: (edge) => set({ selectedEdge: edge }),

  // 워크플로우 메타데이터
  setWorkflowName: (name) => set({ workflowName: name }),

  setWorkflowDescription: (description) =>
    set({ workflowDescription: description }),

  // 실행 상태
  setIsRunning: (isRunning) => set({ isRunning }),

  // 초기화
  reset: () => set(initialState),
}));
