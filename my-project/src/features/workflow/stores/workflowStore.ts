import { create } from 'zustand';
import type { Node, Edge } from '@/shared/types/workflow.types';
import { BlockEnum } from '@/shared/types/workflow.types';
import { workflowApi } from '../api/workflowApi';
import { transformFromBackend } from '@/shared/utils/workflowTransform';
import { DEFAULT_WORKFLOW } from '@/shared/constants/defaultWorkflow';
import { APIError } from '@/shared/api/errorHandler';
import type {
  NodeTypeResponse,
  WorkflowValidationMessage,
  WorkflowVersionSummary,
} from '../types/api.types';
import type { NodePortSchema } from '@/shared/types/workflow';
import { PortType } from '@/shared/types/workflow';
import { clonePortSchema, cloneNodePortSchema } from '@/shared/constants/nodePortSchemas';
import { withEdgeMetadata } from '../utils/edgeHelpers';
import type { Connection } from '@xyflow/react';

type ValidationPayload = {
  errors?: unknown;
  warnings?: unknown;
};

const stringifyValue = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return '';
    }
  }
  return String(value);
};

const normalizeValidationMessages = (
  messages: unknown,
  severity: 'error' | 'warning'
): WorkflowValidationMessage[] => {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .map((entry) => {
      if (typeof entry === 'string') {
        return {
          node_id: null,
          type: severity,
          message: entry,
          severity,
        };
      }

      if (entry && typeof entry === 'object') {
        const candidate = entry as Partial<WorkflowValidationMessage> & {
          detail?: string;
        };
        const text =
          typeof candidate.message === 'string'
            ? candidate.message
            : typeof candidate.detail === 'string'
            ? candidate.detail
            : '';
        const message = text || stringifyValue(entry);
        if (!message) {
          return null;
        }

        return {
          node_id: candidate.node_id ?? null,
          type: candidate.type ?? severity,
          message,
          severity: candidate.severity ?? severity,
        };
      }

      const fallback = stringifyValue(entry);
      if (!fallback) {
        return null;
      }

      return {
        node_id: null,
        type: severity,
        message: fallback,
        severity,
      };
    })
    .filter(
      (item): item is WorkflowValidationMessage =>
        Boolean(item && item.message)
    );
};

const buildValidationStateFromPayload = (
  payload?: ValidationPayload
): {
  errors: WorkflowValidationMessage[];
  warnings: WorkflowValidationMessage[];
} => ({
  errors: normalizeValidationMessages(payload?.errors, 'error'),
  warnings: normalizeValidationMessages(payload?.warnings, 'warning'),
});

const extractValidationPayloadFromError = (
  error: APIError
): ValidationPayload | undefined => {
  if (!error.details || typeof error.details !== 'object') {
    return undefined;
  }

  const data = error.details as Record<string, unknown>;
  const detail =
    typeof data.detail === 'object' && data.detail !== null
      ? (data.detail as Record<string, unknown>)
      : undefined;

  if (
    detail &&
    (Object.prototype.hasOwnProperty.call(detail, 'errors') ||
      Object.prototype.hasOwnProperty.call(detail, 'warnings'))
  ) {
    return detail as ValidationPayload;
  }

  if (
    Object.prototype.hasOwnProperty.call(data, 'errors') ||
    Object.prototype.hasOwnProperty.call(data, 'warnings')
  ) {
    return data as ValidationPayload;
  }

  return undefined;
};

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
  validationErrorNodeIds: string[];
  isChatVisible: boolean;
  executionState: ExecutionState | null;
  draftVersionId: string | null;
  environmentVariables: Record<string, unknown>;
  conversationVariables: Record<string, unknown>;
  nodeTypes: NodeTypeResponse[];
  nodeTypesLoading: boolean;
  lastSavedAt: string | null;
  hasUnsavedChanges: boolean;
  lastSaveError: string | null;

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
  setValidationErrors: (
    errors: WorkflowValidationMessage[],
    warnings: WorkflowValidationMessage[]
  ) => void; // 외부에서 검증 결과 직접 설정

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
  validationErrorNodeIds: [],
  isChatVisible: false,
  executionState: null,
  draftVersionId: null,
  environmentVariables: {},
  conversationVariables: {},
  nodeTypes: [],
  nodeTypesLoading: false,
  lastSavedAt: null,
  hasUnsavedChanges: false,
  lastSaveError: null,
};

const extractErrorNodeIds = (
  errors: WorkflowValidationMessage[]
): string[] => {
  const ids = new Set<string>();
  errors.forEach((error) => {
    if (error.node_id) {
      ids.add(error.node_id);
    }
  });
  return Array.from(ids);
};

const TARGET_PORT_RENAME_MAP: Partial<Record<BlockEnum, Record<string, string>>> = {
  [BlockEnum.LLM]: { user_message: 'query' },
  [BlockEnum.End]: { final_output: 'response' },
};

const SELECTOR_PORT_RENAME_MAP: Record<string, string> = {
  user_message: 'query',
};

const normalizeSelectorString = (selector: string): string => {
  if (!selector.includes('.')) return selector;
  const [nodeId, portName] = selector.split('.', 2);
  if (!nodeId || !portName) {
    return selector;
  }
  const normalizedPort = SELECTOR_PORT_RENAME_MAP[portName] || portName;
  return `${nodeId}.${normalizedPort}`;
};

const extractSelectorFromMapping = (mapping: any): string | null => {
  if (!mapping) {
    return null;
  }
  if (typeof mapping === 'string') {
    return normalizeSelectorString(mapping);
  }
  if (typeof mapping === 'object') {
    if (typeof mapping.variable === 'string') {
      return normalizeSelectorString(mapping.variable);
    }
    if (typeof mapping.source === 'string') {
      return normalizeSelectorString(mapping.source);
    }
    if (typeof mapping.source === 'object' && typeof mapping.source.variable === 'string') {
      return normalizeSelectorString(mapping.source.variable);
    }
  }
  return null;
};

const normalizeMappingValue = (targetPort: string, value: any) => {
  if (!value) return value;

  if (typeof value === 'string') {
    return normalizeSelectorString(value);
  }

  if (typeof value === 'object') {
    if (typeof value.source === 'string') {
      return {
        target_port: targetPort,
        source: {
          variable: normalizeSelectorString(value.source),
          value_type: value.value_type ?? PortType.ANY,
        },
      };
    }

    if (value.source && typeof value.source === 'object') {
      return {
        ...value,
        target_port: targetPort,
        source: {
          ...value.source,
          variable: normalizeSelectorString(value.source.variable ?? value.variable ?? ''),
          value_type: value.source.value_type ?? value.value_type ?? PortType.ANY,
        },
      };
    }

    if (typeof value.variable === 'string') {
      return {
        target_port: targetPort,
        source: {
          variable: normalizeSelectorString(value.variable),
          value_type: value.value_type ?? PortType.ANY,
        },
      };
    }
  }

  return value;
};

const normalizeVariableMappingsForNode = (
  nodeType: BlockEnum,
  mappings?: Record<string, any>
) => {
  if (!mappings) return {};
  const renameMap = TARGET_PORT_RENAME_MAP[nodeType] || {};
  return Object.entries(mappings).reduce<Record<string, any>>((acc, [key, value]) => {
    const normalizedKey = renameMap[key] || key;
    acc[normalizedKey] = normalizeMappingValue(normalizedKey, value);
    return acc;
  }, {});
};

const normalizeWorkflowGraph = (nodes: Node[], edges: Edge[]) => {
  const normalizedNodes = nodes.map<Node>((node) => {
    const nodeType = node.data.type as BlockEnum;
    const clonedPorts: NodePortSchema | undefined =
      cloneNodePortSchema(node.data.ports as NodePortSchema | undefined) ||
      clonePortSchema(nodeType);

    const normalizedMappings = normalizeVariableMappingsForNode(
      nodeType,
      node.data.variable_mappings as Record<string, any> | undefined
    );

    return {
      ...node,
      data: {
        ...node.data,
        ports: clonedPorts,
        variable_mappings: normalizedMappings,
      },
    };
  });

  const normalizedEdges = edges.map<Edge>((edge) => ({
    ...edge,
    data: edge.data ? { ...edge.data } : undefined,
  }));

  synchronizeEdgesWithMappings(normalizedNodes, normalizedEdges);
  return { nodes: normalizedNodes, edges: normalizedEdges };
};

const synchronizeEdgesWithMappings = (nodes: Node[], edges: Edge[]) => {
  const edgeBuckets = new Map<string, Edge[]>();

  edges.forEach((edge) => {
    const key = `${edge.source}->${edge.target}`;
    if (!edgeBuckets.has(key)) {
      edgeBuckets.set(key, []);
    }
    edgeBuckets.get(key)!.push(edge);
  });

  nodes.forEach((node) => {
    const mappings = (node.data.variable_mappings || {}) as Record<string, any>;

    Object.entries(mappings).forEach(([targetPort, mapping]) => {
      const selector = extractSelectorFromMapping(mapping);
      if (!selector || !selector.includes('.')) {
        return;
      }

      const [sourceNodeId, sourcePort] = selector.split('.', 2);
      if (!sourceNodeId || !sourcePort) {
        return;
      }

      const key = `${sourceNodeId}->${node.id}`;
      const candidates = edgeBuckets.get(key) || [];
      let edge = candidates.find(
        (candidate) =>
          (!candidate.targetHandle || candidate.targetHandle === targetPort) &&
          (!candidate.sourceHandle || candidate.sourceHandle === sourcePort)
      );

      if (!edge) {
        const connection: Connection = {
          source: sourceNodeId,
          target: node.id,
          sourceHandle: sourcePort,
          targetHandle: targetPort,
        };
        const withMeta = withEdgeMetadata(connection, nodes);
        edge = {
          id: `edge-${sourceNodeId}-${sourcePort}-${node.id}-${targetPort}`,
          source: withMeta.source!,
          target: withMeta.target!,
          sourceHandle: withMeta.sourceHandle,
          targetHandle: withMeta.targetHandle,
          type: withMeta.type || 'custom',
          data: withMeta.data,
        };
        edges.push(edge);
        candidates.push(edge);
        edgeBuckets.set(key, candidates);
      } else {
        edge.sourceHandle = sourcePort;
        edge.targetHandle = targetPort;
      }
    });
  });
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
      set((state) => ({ nodes: nodesOrUpdater(state.nodes), hasUnsavedChanges: true }));
    } else {
      set({ nodes: nodesOrUpdater, hasUnsavedChanges: true });
    }
  },

  addNode: (node) => {
    const currentState = get();
    const newNodes = [...currentState.nodes, node];
    set({ nodes: newNodes, hasUnsavedChanges: true });
  },

  updateNode: (id, data) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      ),
      hasUnsavedChanges: true,
    })),

  deleteNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter(
        (edge) => edge.source !== id && edge.target !== id
      ),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
      hasUnsavedChanges: true,
    })),

  // 엣지 관리
  setEdges: (edgesOrUpdater) => {
    if (typeof edgesOrUpdater === 'function') {
      set((state) => ({ edges: edgesOrUpdater(state.edges), hasUnsavedChanges: true }));
    } else {
      set({ edges: edgesOrUpdater, hasUnsavedChanges: true });
    }
  },

  addEdge: (edge) =>
    set((state) => {
      // 1. 엣지 추가
      const newEdges = [...state.edges, edge];

      // 2. variable_mappings 자동 생성
      const updatedNodes = state.nodes.map((node) => {
        // target 노드만 업데이트
        if (node.id !== edge.target) return node;

        const targetPort = edge.targetHandle;
        const sourceNode = edge.source;
        const sourcePort = edge.sourceHandle;

        if (!targetPort || !sourceNode || !sourcePort) return node;

        // 기존 variable_mappings 가져오기
        const currentMappings = node.data?.variable_mappings || {};

        // 새 매핑 추가 (Dify 스타일: "sourceNode.sourcePort")
        const newMappings = {
          ...currentMappings,
          [targetPort]: `${sourceNode}.${sourcePort}`,
        };

        return {
          ...node,
          data: {
            ...node.data,
            variable_mappings: newMappings,
          },
        };
      });

      return {
        edges: newEdges,
        nodes: updatedNodes,
        hasUnsavedChanges: true,
      };
    }),

  deleteEdge: (id) =>
    set((state) => {
      // 삭제할 엣지 찾기
      const edgeToDelete = state.edges.find((e) => e.id === id);

      if (!edgeToDelete) {
        return { edges: state.edges.filter((edge) => edge.id !== id) };
      }

      // 1. 엣지 삭제
      const newEdges = state.edges.filter((edge) => edge.id !== id);

      // 2. variable_mappings에서 해당 매핑 제거
      const updatedNodes = state.nodes.map((node) => {
        if (node.id !== edgeToDelete.target) return node;

        const targetPort = edgeToDelete.targetHandle;
        if (!targetPort) return node;

        const currentMappings = node.data?.variable_mappings || {};
        const { [targetPort]: _, ...remainingMappings } = currentMappings;

        return {
          ...node,
          data: {
            ...node.data,
            variable_mappings: remainingMappings,
          },
        };
      });

      return {
        edges: newEdges,
        nodes: updatedNodes,
        hasUnsavedChanges: true,
      };
    }),

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

        const normalizedGraph = normalizeWorkflowGraph(graph.nodes, graph.edges);

        set({
          nodes: normalizedGraph.nodes,
          edges: normalizedGraph.edges,
          draftVersionId: detail.id,
          environmentVariables: detail.environment_variables || {},
          conversationVariables: detail.conversation_variables || {},
          lastSavedAt: detail.updated_at,
          validationErrors: [],
          validationWarnings: [],
          validationErrorNodeIds: [],
        });
      } else {
        const clonedNodes = DEFAULT_WORKFLOW.nodes.map((node) => ({
          ...node,
          data: { ...node.data },
        }));
        const clonedEdges = DEFAULT_WORKFLOW.edges.map((edge) => ({ ...edge }));

        const normalizedGraph = normalizeWorkflowGraph(clonedNodes, clonedEdges);

        set({
          nodes: normalizedGraph.nodes,
          edges: normalizedGraph.edges,
          draftVersionId: null,
          environmentVariables: {},
          conversationVariables: {},
          lastSavedAt: null,
          validationErrors: [],
          validationWarnings: [],
          validationErrorNodeIds: [],
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
      const {
        nodes,
        edges,
        environmentVariables,
        conversationVariables,
      } = get();

      const normalizedGraph = normalizeWorkflowGraph(nodes, edges);

      set({
        nodes: normalizedGraph.nodes,
        edges: normalizedGraph.edges,
      });

      const result = await workflowApi.upsertDraftWorkflow(
        botId,
        normalizedGraph.nodes,
        normalizedGraph.edges,
        {
          environment_variables: environmentVariables,
          conversation_variables: conversationVariables,
        }
      );

      set({
        draftVersionId: result.id,
        lastSavedAt: result.updated_at ?? new Date().toISOString(),
        hasUnsavedChanges: false,
        lastSaveError: null,
      });

      return result;
    } catch (error) {
      if (error instanceof APIError) {
        const validationPayload = extractValidationPayloadFromError(error);
        if (validationPayload) {
          const validationState = buildValidationStateFromPayload(
            validationPayload
          );
          set({
            validationErrors: validationState.errors,
            validationWarnings: validationState.warnings,
          });
        }
      }

      console.error('Failed to save workflow:', error);
      const errorMessage = error instanceof Error ? error.message : '워크플로우 저장 실패';
      set({ lastSaveError: errorMessage });
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
      const normalizedErrors = normalizeValidationMessages(result.errors, 'error');
      const normalizedWarnings = normalizeValidationMessages(result.warnings, 'warning');
      set({
        validationErrors: normalizedErrors,
        validationWarnings: normalizedWarnings,
        validationErrorNodeIds: extractErrorNodeIds(normalizedErrors),
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
      const normalizedErrors = normalizeValidationMessages(result.errors, 'error');
      const normalizedWarnings = normalizeValidationMessages(result.warnings, 'warning');
      set({
        validationErrors: normalizedErrors,
        validationWarnings: normalizedWarnings,
        validationErrorNodeIds: extractErrorNodeIds(normalizedErrors),
      });
      return result.is_valid;
    } catch (error) {
      console.error('Failed to validate bot workflow:', error);
      return false;
    }
  },

  // 외부에서 검증 결과 직접 설정
  setValidationErrors: (errors, warnings) => {
    const normalizedErrors = normalizeValidationMessages(errors, 'error');
    const normalizedWarnings = normalizeValidationMessages(warnings, 'warning');
    set({
      validationErrors: normalizedErrors,
      validationWarnings: normalizedWarnings,
      validationErrorNodeIds: extractErrorNodeIds(normalizedErrors),
    });
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
