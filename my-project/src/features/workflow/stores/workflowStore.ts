import { create } from 'zustand';
import type { Node, Edge, IfElseCase, Topic, VisionConfig } from '@/shared/types/workflow.types';
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
import { useVariableAssignerStore } from '@features/workflow/nodes/variable-assigner/stores/variableAssignerStore';
import { generatePortSchema } from '@features/workflow/nodes/variable-assigner/utils/portSchemaGenerator';
import { checkValid } from '@features/workflow/nodes/variable-assigner/utils/validation';
import type { VariableAssignerNodeData } from '@features/workflow/nodes/variable-assigner/types';
import { VarType } from '@features/workflow/nodes/variable-assigner/types';
import {
  cloneVariableAssignerNodeType,
  cloneAssignerNodeType,
  cloneIfElseNodeType,
  cloneQuestionClassifierNodeType,
  cloneTavilySearchNodeType,
  cloneAnswerNodeType,
} from '../constants/nodeTypes';
import {
  generateIfElsePortSchema,
  createDefaultIfElseCase,
} from '../components/nodes/if-else/utils/portSchemaGenerator';
import {
  generateQuestionClassifierPortSchema,
  createDefaultQuestionClassifierClasses,
} from '../components/nodes/question-classifier/utils/portSchemaGenerator';
import { generateAssignerPortSchema } from '../components/nodes/assigner/utils/portSchemaGenerator';
import type { AssignerNodeType } from '@/shared/types/workflow.types';
import { normalizeHandleId, normalizeSelectorVariable } from '@/shared/utils/workflowPorts';
import { sanitizeEdgeForLogicalTargets } from '../utils/logicalNodeGuards';

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

const isVariableAssignerNode = (node: Node): boolean =>
  (node.data.type as BlockEnum) === BlockEnum.VariableAssigner;

const ensureVariableAssignerData = (
  rawData: Record<string, any>
): VariableAssignerNodeData => {
  const advanced = rawData.advanced_settings ?? {};
  const groups = Array.isArray(advanced.groups) ? advanced.groups : [];

  return {
    output_type: rawData.output_type ?? VarType.ANY,
    variables: Array.isArray(rawData.variables) ? rawData.variables : [],
    advanced_settings: {
      group_enabled: Boolean(advanced.group_enabled),
      groups,
    },
    ports: rawData.ports,
    variable_mappings: rawData.variable_mappings,
  };
};

const syncVariableAssignerNodesFromWorkflow = (nodes: Node[]) => {
  const variableStore = useVariableAssignerStore.getState();
  const presentIds = new Set<string>();

  nodes.forEach((node) => {
    if (!isVariableAssignerNode(node)) {
      return;
    }

    presentIds.add(node.id);
    const data = ensureVariableAssignerData(node.data as Record<string, any>);
    variableStore.initializeNode(node.id, data);
  });

  Object.keys(variableStore.nodeDataMap).forEach((id) => {
    if (!presentIds.has(id)) {
      variableStore.deleteNode(id);
    }
  });
};

const collectVariableAssignerValidationErrors = (
  nodes: Node[]
): WorkflowValidationMessage[] => {
  return nodes.reduce<WorkflowValidationMessage[]>((acc, node) => {
    if (!isVariableAssignerNode(node)) {
      return acc;
    }

    const data = ensureVariableAssignerData(node.data as Record<string, any>);
    const result = checkValid(data);

    if (!result.isValid) {
      acc.push({
        node_id: node.id,
        type: 'validation',
        message: result.errorMessage ?? 'Invalid Variable Assigner configuration',
        severity: 'error',
      });
    }

    return acc;
  }, []);
};

const validateBasicWorkflowStructure = (
  nodes: Node[],
  edges: Edge[]
): WorkflowValidationMessage[] => {
  const errors: WorkflowValidationMessage[] = [];
  const answerNodes = nodes.filter(
    (node) => (node.data.type as BlockEnum) === BlockEnum.Answer
  );
  if (answerNodes.length === 0) {
    errors.push({
      node_id: null,
      type: 'validation',
      message: '최종 응답을 위해 Answer 노드가 필요합니다.',
      severity: 'error',
    });
  }

  const startNode = nodes.find((node) => (node.data.type as BlockEnum) === BlockEnum.Start);
  if (!startNode) {
    errors.push({
      node_id: null,
      type: 'validation',
      message: 'Start 노드가 필요합니다.',
      severity: 'error',
    });
  } else if (!edges.some((edge) => edge.source === startNode.id)) {
    errors.push({
      node_id: startNode.id,
      type: 'validation',
      message: 'Start 노드는 최소 한 개의 노드와 연결되어야 합니다.',
      severity: 'error',
    });
  }

  const endNode = nodes.find((node) => (node.data.type as BlockEnum) === BlockEnum.End);
  if (!endNode) {
    errors.push({
      node_id: null,
      type: 'validation',
      message: 'End 노드가 필요합니다.',
      severity: 'error',
    });
  } else {
    if (!edges.some((edge) => edge.target === endNode.id)) {
      errors.push({
        node_id: endNode.id,
        type: 'validation',
        message: 'End 노드에는 최소 한 개의 입력 연결이 필요합니다.',
        severity: 'error',
      });
    }

    const endMappings =
      ((endNode.data.variable_mappings || {}) as Record<string, any>) || {};
    const hasResponseMapping = Boolean(endMappings.response);
    const hasResponseEdge = edges.some(
      (edge) =>
        edge.target === endNode.id && (!edge.targetHandle || edge.targetHandle === 'response')
    );

    if (!hasResponseMapping && !hasResponseEdge) {
      errors.push({
        node_id: endNode.id,
        type: 'validation',
        message: "End 노드의 'response' 입력이 연결되지 않았습니다.",
        severity: 'error',
      });
    }
  }

  return errors;
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

const buildLegacyMappingsFromEdges = (nodes: Node[], edges: Edge[]) => {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const legacyMappings = new Map<string, Record<string, any>>();

  edges.forEach((edge) => {
    if (!edge.source || !edge.target) {
      return;
    }

    const targetNode = nodeMap.get(edge.target);
    const sourceNode = nodeMap.get(edge.source);
    if (!targetNode || !sourceNode) {
      return;
    }

    const renameMap =
      TARGET_PORT_RENAME_MAP[(targetNode.data.type as BlockEnum) || BlockEnum.Start] || {};
    const normalizedTargetHandle =
      normalizeHandleId(edge.target, edge.targetHandle, nodes, 'inputs') ||
      edge.targetHandle ||
      null;
    if (!normalizedTargetHandle) {
      return;
    }
    const normalizedTargetPort =
      (normalizedTargetHandle && renameMap[normalizedTargetHandle]) ||
      normalizedTargetHandle;

    const targetInputs =
      ((targetNode.data?.ports as NodePortSchema | undefined)?.inputs) || [];
    const hasTargetPort = targetInputs.some(
      (port) => port.name === normalizedTargetPort
    );
    if (!hasTargetPort) {
      return;
    }

    const normalizedSourceHandle =
      normalizeHandleId(edge.source, edge.sourceHandle, nodes, 'outputs') ||
      edge.sourceHandle ||
      null;
    if (!normalizedSourceHandle) {
      return;
    }
    const selectorBase = `${edge.source}.${normalizedSourceHandle}`;
    const normalizedSelector = normalizeSelectorVariable(
      normalizeSelectorString(selectorBase),
      nodes
    );
    if (!normalizedSelector.includes('.')) {
      return;
    }

    const sourceOutputs =
      ((sourceNode.data?.ports as NodePortSchema | undefined)?.outputs) || [];
    const matchedSourcePort = sourceOutputs.find(
      (port) => port.name === normalizedSourceHandle
    );

    const mapping = {
      target_port: normalizedTargetPort,
      source: {
        variable: normalizedSelector,
        value_type: matchedSourcePort?.type ?? PortType.ANY,
      },
    };

    if (!legacyMappings.has(edge.target)) {
      legacyMappings.set(edge.target, {});
    }

    const existing = legacyMappings.get(edge.target)!;
    if (!existing[normalizedTargetPort]) {
      existing[normalizedTargetPort] = mapping;
    }
  });

  return legacyMappings;
};

const normalizeWorkflowGraph = (nodes: Node[], edges: Edge[]) => {
  const normalizedNodes = nodes.map<Node>((node) => {
    const nodeType = node.data.type as BlockEnum;
    let ports: NodePortSchema | undefined =
      cloneNodePortSchema(node.data.ports as NodePortSchema | undefined) ||
      clonePortSchema(nodeType);
    let normalizedIfElseCases: IfElseCase[] | undefined;
    let normalizedClassifierClasses: Topic[] | undefined;
    let assignerData: VariableAssignerNodeData | undefined;

    // Legacy Variable Assigner (single-output)
    if (nodeType === BlockEnum.VariableAssigner) {
      assignerData = ensureVariableAssignerData(node.data as Record<string, any>);
      ports = generatePortSchema(assignerData);
    }

    // New Assigner (per-operation ports)
    if (nodeType === BlockEnum.Assigner) {
      const operations = (node.data as AssignerNodeType).operations || [];
      ports = generateAssignerPortSchema(operations);
    }

    if (nodeType === BlockEnum.IfElse) {
      let cases = (node.data.cases as IfElseCase[]) || [];
      if (!cases.length) {
        cases = [createDefaultIfElseCase()];
      }
      normalizedIfElseCases = cases;
      ports = generateIfElsePortSchema(cases);
    }

    if (nodeType === BlockEnum.QuestionClassifier) {
      let classes = (node.data.classes as Topic[]) || [];
      if (!classes.length) {
        classes = createDefaultQuestionClassifierClasses();
      }
      normalizedClassifierClasses = classes;
      const vision = node.data.vision as VisionConfig | undefined;
      ports = generateQuestionClassifierPortSchema(classes, vision);
    }

    const normalizedMappings = normalizeVariableMappingsForNode(
      nodeType,
      (assignerData?.variable_mappings ??
        (node.data.variable_mappings as Record<string, any> | undefined)) as
        | Record<string, any>
        | undefined
    );

    const nextData: any = {
      ...node,
      data: {
        ...node.data,
        ...(assignerData || {}),
        ports,
        variable_mappings: normalizedMappings,
      },
    };

    if (normalizedIfElseCases) {
      nextData.data.cases = normalizedIfElseCases;
    }
    if (normalizedClassifierClasses) {
      nextData.data.classes = normalizedClassifierClasses;
    }

    return nextData;
  });

  const normalizedEdges = edges.map<Edge>((edge) => {
    const normalizedSourceHandle =
      normalizeHandleId(edge.source, edge.sourceHandle, normalizedNodes, 'outputs') ||
      edge.sourceHandle || undefined;
    const normalizedTargetHandle =
      normalizeHandleId(edge.target, edge.targetHandle, normalizedNodes, 'inputs') ||
      edge.targetHandle || undefined;

    return {
      ...edge,
      sourceHandle: normalizedSourceHandle,
      targetHandle: normalizedTargetHandle,
      data: edge.data ? { ...edge.data } : undefined,
    };
  });

  const sanitizedEdges = normalizedEdges.map((edge) =>
    sanitizeEdgeForLogicalTargets(edge, normalizedNodes)
  );

  const legacyMappingsByNode = buildLegacyMappingsFromEdges(
    normalizedNodes,
    sanitizedEdges
  );

  const nodesWithLegacyMappings = normalizedNodes.map((node) => {
    const fallback = legacyMappingsByNode.get(node.id);
    if (!fallback) {
      return node;
    }

    const existingMappings =
      ((node.data.variable_mappings || {}) as Record<string, any>) || {};
    const mergedMappings = { ...fallback, ...existingMappings };

    if (Object.keys(mergedMappings).length === Object.keys(existingMappings).length) {
      return node;
    }

    return {
      ...node,
      data: {
        ...node.data,
        variable_mappings: mergedMappings,
      },
    };
  });

  const syncedEdges = synchronizeEdgesWithMappings(
    nodesWithLegacyMappings,
    sanitizedEdges
  );
  return { nodes: nodesWithLegacyMappings, edges: syncedEdges };
};

/**
 * 노드 간 최단 거리 계산 (BFS)
 * @param sourceNodeId 시작 노드 ID
 * @param targetNodeId 목표 노드 ID
 * @param nodes 모든 노드
 * @param edges 모든 엣지
 * @returns 최단 거리 (연결되지 않으면 Infinity)
 */
const calculateShortestPath = (
  sourceNodeId: string,
  targetNodeId: string,
  nodes: Node[],
  edges: Edge[]
): number => {
  if (sourceNodeId === targetNodeId) {
    return 0;
  }

  // 엣지 그래프 구성: { sourceId: [targetId, ...] }
  const graph: Record<string, string[]> = {};
  edges.forEach((edge) => {
    if (!graph[edge.source]) {
      graph[edge.source] = [];
    }
    graph[edge.source].push(edge.target);
  });

  // BFS로 최단 거리 계산
  const queue: Array<{ nodeId: string; distance: number }> = [
    { nodeId: sourceNodeId, distance: 0 },
  ];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const { nodeId, distance } = queue.shift()!;

    if (nodeId === targetNodeId) {
      return distance;
    }

    if (visited.has(nodeId)) {
      continue;
    }
    visited.add(nodeId);

    const neighbors = graph[nodeId] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        queue.push({ nodeId: neighbor, distance: distance + 1 });
      }
    }
  }

  return Infinity; // 연결되지 않음
};

const synchronizeEdgesWithMappings = (nodes: Node[], edges: Edge[]) => {
  const uniqueEdges = new Map<string, Edge>();

  const ensureEdge = (sourceId?: string, targetId?: string, existing?: Edge) => {
    if (!sourceId || !targetId) {
      return;
    }
    const key = `${sourceId}->${targetId}`;
    if (uniqueEdges.has(key)) {
      return;
    }

    if (existing) {
      const normalizedSourceHandle =
        normalizeHandleId(sourceId, existing.sourceHandle, nodes, 'outputs') ||
        existing.sourceHandle ||
        undefined;
      const normalizedTargetHandle =
        normalizeHandleId(targetId, existing.targetHandle, nodes, 'inputs') ||
        existing.targetHandle ||
        undefined;

      uniqueEdges.set(key, {
        ...existing,
        id: `edge-${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
        sourceHandle: normalizedSourceHandle,
        targetHandle: normalizedTargetHandle,
      });
      return;
    }

    const connection: Connection = {
      source: sourceId,
      target: targetId,
    };
    const withMeta = withEdgeMetadata(connection, nodes);
    uniqueEdges.set(key, {
      id: `edge-${sourceId}-${targetId}`,
      source: withMeta.source!,
      target: withMeta.target!,
      sourceHandle: undefined,
      targetHandle: undefined,
      type: withMeta.type || 'custom',
      data: withMeta.data,
    });
  };

  // 1. 명시적으로 생성된 엣지 추가
  edges.forEach((edge) => {
    ensureEdge(edge.source, edge.target, edge);
  });

  // 2. variable_mappings로부터 자동 엣지 생성 (조건부)
  nodes.forEach((node) => {
    const mappings = (node.data.variable_mappings || {}) as Record<string, any>;

    Object.values(mappings).forEach((mapping) => {
      const selector = extractSelectorFromMapping(mapping);
      if (!selector || !selector.includes('.')) {
        return;
      }

      const [sourceNodeId] = selector.split('.', 2);

      // ⭐️ Start 노드로부터의 자동 엣지 생성 조건부 처리
      if (sourceNodeId === 'start-1') {
        // 1. 사용자가 명시적으로 연결한 엣지가 있는지 확인
        const hasExplicitEdge = edges.some(
          (edge) => edge.source === sourceNodeId && edge.target === node.id
        );
        if (hasExplicitEdge) {
          // 이미 명시적 엣지가 있으면 추가 생성 불필요
          return;
        }

        // 2. 노드 간 최단 거리 계산
        const distance = calculateShortestPath(
          sourceNodeId,
          node.id,
          nodes,
          edges
        );

        // 3. 거리가 1이면 엣지 생성, 2 이상이면 생성하지 않음 (variable_mappings만으로 참조)
        if (distance === 1) {
          ensureEdge(sourceNodeId, node.id);
        }
        // distance >= 2인 경우: variable_mappings만으로 참조 가능하므로 엣지 생성 안 함
      } else {
        // Start 노드가 아닌 다른 노드 참조는 기존 로직 유지
        ensureEdge(sourceNodeId, node.id);
      }
    });
  });

  return Array.from(uniqueEdges.values());
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
    set((state) => {
      const nextNodes =
        typeof nodesOrUpdater === 'function'
          ? nodesOrUpdater(state.nodes)
          : nodesOrUpdater;
      syncVariableAssignerNodesFromWorkflow(nextNodes);
      return { nodes: nextNodes, hasUnsavedChanges: true };
    });
  },

  addNode: (node) => {
    set((state) => {
      const newNodes = [...state.nodes, node];
      syncVariableAssignerNodesFromWorkflow(newNodes);
      return { nodes: newNodes, hasUnsavedChanges: true };
    });
  },

  updateNode: (id, data) =>
    set((state) => {
      const updatedNodes = state.nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      );
      syncVariableAssignerNodesFromWorkflow(updatedNodes);
      return {
        nodes: updatedNodes,
        hasUnsavedChanges: true,
      };
    }),

  deleteNode: (id) =>
    set((state) => {
      const remainingNodes = state.nodes.filter((node) => node.id !== id);
      syncVariableAssignerNodesFromWorkflow(remainingNodes);
      return {
        nodes: remainingNodes,
        edges: state.edges.filter(
          (edge) => edge.source !== id && edge.target !== id
        ),
        selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
        hasUnsavedChanges: true,
      };
    }),

  // 엣지 관리
  setEdges: (edgesOrUpdater) => {
    set((state) => {
      const nextEdges =
        typeof edgesOrUpdater === 'function'
          ? edgesOrUpdater(state.edges)
          : edgesOrUpdater;
      const sanitizedEdges = (nextEdges || []).map((edge) =>
        sanitizeEdgeForLogicalTargets(edge, state.nodes)
      );
      return {
        edges: sanitizedEdges,
        hasUnsavedChanges: true,
      };
    });
  },

  addEdge: (edge) =>
    set((state) => {
      if (!edge.source || !edge.target) {
        return state;
      }

      const normalizedEdge: Edge = {
        ...edge,
        id: `edge-${edge.source}-${edge.target}`,
        sourceHandle: edge.sourceHandle || undefined,
        targetHandle: edge.targetHandle || undefined,
        type: edge.type || 'custom',
      };
      const sanitizedEdge = sanitizeEdgeForLogicalTargets(
        normalizedEdge,
        state.nodes
      );

      const existingEdgeIndex = state.edges.findIndex(
        (existing) =>
          existing.source === sanitizedEdge.source &&
          existing.target === sanitizedEdge.target
      );

      let nextEdges: Edge[];
      if (existingEdgeIndex >= 0) {
        nextEdges = state.edges.map((existing, index) =>
          index === existingEdgeIndex
            ? {
                ...existing,
                ...sanitizedEdge,
                data: sanitizedEdge.data ?? existing.data,
              }
            : existing
        );
      } else {
        nextEdges = [...state.edges, sanitizedEdge];
      }

      return {
        edges: nextEdges,
        hasUnsavedChanges: true,
      };
    }),

  deleteEdge: (id) =>
    set((state) => {
      const edgeToDelete = state.edges.find((e) => e.id === id);
      const newEdges = state.edges.filter((edge) => edge.id !== id);

      if (!edgeToDelete || !edgeToDelete.source || !edgeToDelete.target) {
        return {
          edges: newEdges,
          hasUnsavedChanges: true,
        };
      }

      const sourceNodeId = edgeToDelete.source;
      let nodesChanged = false;

      const updatedNodes = state.nodes.map((node) => {
        if (node.id !== edgeToDelete.target) {
          return node;
        }

        const currentMappings =
          (node.data?.variable_mappings as Record<string, any>) || {};
        const removedPorts: string[] = [];
        const nextMappings = Object.entries(currentMappings).reduce<
          Record<string, any>
        >((acc, [key, mapping]) => {
          const selector = extractSelectorFromMapping(mapping);
          if (selector?.startsWith(`${sourceNodeId}.`)) {
            removedPorts.push(key);
            return acc;
          }
          acc[key] = mapping;
          return acc;
        }, {});

        if (!removedPorts.length) {
          return node;
        }

        let updatedData: any = {
          ...node.data,
          variable_mappings: nextMappings,
        };

        if (node.data.type === BlockEnum.Assigner) {
          const operations = [
            ...((node.data as AssignerNodeType).operations || []),
          ];
          let mutated = false;

          removedPorts.forEach((targetPort) => {
            const match = targetPort.match(/^operation_(\d+)_(target|value)$/);
            if (!match) return;
            const opIndex = parseInt(match[1], 10);
            const portType = match[2];
            if (!operations[opIndex]) return;
            mutated = true;

            if (portType === 'target') {
              operations[opIndex] = {
                ...operations[opIndex],
                target_variable: undefined,
              };
            } else if (portType === 'value') {
              operations[opIndex] = {
                ...operations[opIndex],
                source_variable: undefined,
              };
            }
          });

          if (mutated) {
            updatedData = {
              ...updatedData,
              operations,
            };
          }
        }

        nodesChanged = true;
        return {
          ...node,
          data: updatedData,
        };
      });

      if (!nodesChanged) {
        return {
          edges: newEdges,
          hasUnsavedChanges: true,
        };
      }

      syncVariableAssignerNodesFromWorkflow(updatedNodes);
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

        syncVariableAssignerNodesFromWorkflow(normalizedGraph.nodes);
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

        syncVariableAssignerNodesFromWorkflow(normalizedGraph.nodes);
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

      const structuralErrors = validateBasicWorkflowStructure(nodes, edges);
      if (structuralErrors.length > 0) {
        set({
          validationErrors: structuralErrors,
          validationWarnings: [],
          validationErrorNodeIds: extractErrorNodeIds(structuralErrors),
          lastSaveError: 'Workflow structure validation failed',
        });
        throw new Error('Workflow structure validation failed');
      }

      const localErrors = collectVariableAssignerValidationErrors(nodes);
      if (localErrors.length > 0) {
        set({
          validationErrors: localErrors,
          validationWarnings: [],
          validationErrorNodeIds: extractErrorNodeIds(localErrors),
          lastSaveError: 'Variable Assigner validation failed',
        });
        throw new Error('Variable Assigner validation failed');
      }

      const normalizedGraph = normalizeWorkflowGraph(nodes, edges);
      syncVariableAssignerNodesFromWorkflow(normalizedGraph.nodes);

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

    const localErrors = collectVariableAssignerValidationErrors(nodes);
    if (localErrors.length > 0) {
      set({
        validationErrors: localErrors,
        validationWarnings: [],
        validationErrorNodeIds: extractErrorNodeIds(localErrors),
      });
      return false;
    }

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

    const localErrors = collectVariableAssignerValidationErrors(nodes);
    if (localErrors.length > 0) {
      set({
        validationErrors: localErrors,
        validationWarnings: [],
        validationErrorNodeIds: extractErrorNodeIds(localErrors),
      });
      return false;
    }

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
      const fetched = await workflowApi.getNodeTypes();

      // Check for missing node types and add them if necessary
      const hasVariableAssigner = fetched.some(
        (type) => type.type === BlockEnum.VariableAssigner
      );
      const hasAssigner = fetched.some(
        (type) => type.type === BlockEnum.Assigner
      );
      const hasIfElse = fetched.some(
        (type) => type.type === BlockEnum.IfElse
      );
      const hasQuestionClassifier = fetched.some(
        (type) => type.type === BlockEnum.QuestionClassifier
      );
      const hasTavilySearch = fetched.some(
        (type) => type.type === BlockEnum.TavilySearch
      );
      const hasAnswer = fetched.some(
        (type) => type.type === BlockEnum.Answer
      );

      const nodeTypes = [...fetched];
      if (!hasVariableAssigner) {
        nodeTypes.push(cloneVariableAssignerNodeType());
      }
      if (!hasAssigner) {
        nodeTypes.push(cloneAssignerNodeType());
      }
      if (!hasIfElse) {
        nodeTypes.push(cloneIfElseNodeType());
      }
      if (!hasQuestionClassifier) {
        nodeTypes.push(cloneQuestionClassifierNodeType());
      }
      if (!hasTavilySearch) {
        nodeTypes.push(cloneTavilySearchNodeType());
      }
      if (!hasAnswer) {
        nodeTypes.push(cloneAnswerNodeType());
      }

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
