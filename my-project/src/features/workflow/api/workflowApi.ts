/**
 * Workflow API
 *
 * 워크플로우 관련 API 함수
 */

import { apiClient } from '@/shared/api/client';
import { API_ENDPOINTS } from '@/shared/constants/apiEndpoints';
import { transformToBackend } from '@/shared/utils/workflowTransform';
import type { Node, Edge } from '@/shared/types/workflow.types';
import type {
  NodeTypeResponse,
  NodeTypeSchema,
  ModelResponse,
  WorkflowValidationResponse,
  WorkflowVersionSummary,
  WorkflowVersionDetail,
} from '../types/api.types';
import type {
  LibraryMetadata,
  PublishWorkflowRequest,
  WorkflowVersion,
} from '../types/workflow.types';
import type {
  WorkflowNodeExecution,
  WorkflowRunDetail,
  WorkflowRunSummary,
  WorkflowTokenStatistics,
  WorkflowRunAnnotationPayload,
} from '../types/log.types';
import type { NodePortSchema, PortDefinition } from '@/shared/types/workflow';
import { clonePortSchema } from '@/shared/constants/nodePortSchemas';

interface WorkflowDraftPayload {
  graph: ReturnType<typeof transformToBackend>;
  environment_variables: Record<string, unknown>;
  conversation_variables: Record<string, unknown>;
}

const DEFAULT_WORKFLOW_VARIABLES = {
  environment_variables: {},
  conversation_variables: {},
};

const NODE_TYPE_LABELS: Record<string, string> = {
  'question-classifier': '질문 분류기',
};

const NODE_TYPE_DESCRIPTIONS: Record<string, string> = {
  start: '워크플로우의 시작점',
  end: '워크플로우의 종료점',
  llm: 'LLM을 사용하여 텍스트 생성',
  'knowledge-retrieval': '지식베이스에서 관련 정보 검색',
  answer: '워크플로우의 최종 응답을 생성합니다',
  'question-classifier': '질문 분류 노드',
  'if-else': '조건 분기 노드',
  'template-transform': '템플릿을 사용하여 텍스트 변환',
  assigner: '변수 조작 및 할당',
  'variable-assigner': '변수 수집 및 그룹화',
  mcp: 'MCP 도구 호출',
  'tavily-search': '실시간 웹 검색',
  http: 'HTTP 요청 전송',
  code: '사용자 정의 코드 실행',
  slack: 'Slack 메시지 전송',
  'imported-workflow': '가져온 워크플로우 실행',
};

export const workflowApi = {
  /**
   * 노드 타입 목록 조회
   */
  getNodeTypes: async (): Promise<NodeTypeResponse[]> => {
    const { data } = await apiClient.get(API_ENDPOINTS.WORKFLOWS.NODE_TYPES);
    const nodeTypes = data.node_types ?? data;
    return nodeTypes.map(mapNodeTypeResponse);
  },

  /**
   * 특정 노드 타입 스키마 조회
   */
  getNodeTypeSchema: async (type: string): Promise<NodeTypeSchema> => {
    const { data } = await apiClient.get(
      API_ENDPOINTS.WORKFLOWS.NODE_TYPE_DETAIL(type)
    );
    return data;
  },

  /**
   * LLM 모델 목록 조회
   */
  getModels: async (): Promise<ModelResponse[]> => {
    const { data } = await apiClient.get(API_ENDPOINTS.WORKFLOWS.MODELS);
    return data.models;
  },

  /**
   * 워크플로우 검증 (일반)
   */
  validate: async (
    nodes: Node[],
    edges: Edge[]
  ): Promise<WorkflowValidationResponse> => {
    const payload = transformToBackend(nodes, edges);
    const { data } = await apiClient.post(
      API_ENDPOINTS.WORKFLOWS.VALIDATE,
      payload
    );
    return data;
  },

  /**
   * 봇 워크플로우 검증 (저장 전)
   */
  validateBotWorkflow: async (
    botId: string,
    nodes: Node[],
    edges: Edge[]
  ): Promise<WorkflowValidationResponse> => {
    const payload = transformToBackend(nodes, edges);
    const { data } = await apiClient.post(
      API_ENDPOINTS.WORKFLOWS.BOT_WORKFLOW_VALIDATE(botId),
      payload
    );
    return data;
  },

  /**
   * Draft 저장/업데이트
   */
  upsertDraftWorkflow: async (
    botId: string,
    nodes: Node[],
    edges: Edge[],
    variables: Partial<WorkflowDraftPayload> = {}
  ): Promise<WorkflowVersionSummary> => {
    const graph = transformToBackend(nodes, edges);
    const payload: WorkflowDraftPayload = {
      graph,
      environment_variables:
        variables.environment_variables ?? DEFAULT_WORKFLOW_VARIABLES.environment_variables,
      conversation_variables:
        variables.conversation_variables ??
        DEFAULT_WORKFLOW_VARIABLES.conversation_variables,
    };

    const { data } = await apiClient.post(
      API_ENDPOINTS.WORKFLOWS.BOT_WORKFLOW_VERSION_DRAFT(botId),
      payload
    );
    return data;
  },

  /**
   * 워크플로우 버전 목록 조회
   */
  listWorkflowVersions: async (
    botId: string,
    params?: { status?: string }
  ): Promise<WorkflowVersionSummary[]> => {
    const queryParams = params?.status
      ? { version_status: params.status }
      : undefined;
    const { data } = await apiClient.get(
      API_ENDPOINTS.WORKFLOWS.BOT_WORKFLOW_VERSIONS(botId),
      { params: queryParams }
    );
    return data;
  },

  /**
   * 워크플로우 버전 상세 조회
   */
  getWorkflowVersionDetail: async (
    botId: string,
    versionId: string
  ): Promise<WorkflowVersionDetail> => {
    const { data } = await apiClient.get(
      API_ENDPOINTS.WORKFLOWS.BOT_WORKFLOW_VERSION_DETAIL(botId, versionId)
    );
    return data;
  },

  /**
   * 워크플로우 발행
   */
  publishWorkflowVersion: async (
    botId: string,
    versionId: string,
    libraryMetadata?: LibraryMetadata
  ): Promise<WorkflowVersion> => {
    const requestBody: PublishWorkflowRequest = libraryMetadata
      ? { library_metadata: libraryMetadata }
      : {};

    const { data } = await apiClient.post(
      API_ENDPOINTS.WORKFLOWS.BOT_WORKFLOW_VERSION_PUBLISH(botId, versionId),
      requestBody
    );
    return data;
  },

  /**
   * 실행 이력 목록
   */
  listWorkflowRuns: async (
    botId: string,
    params?: {
      status?: string;
      start_date?: string;
      end_date?: string;
      limit?: number;
      offset?: number;
      search?: string;
    }
  ): Promise<{
    runs: WorkflowRunSummary[];
    total: number;
    limit: number;
    offset: number;
  }> => {
    const { data } = await apiClient.get(
      API_ENDPOINTS.WORKFLOWS.WORKFLOW_RUNS(botId),
      { params }
    );
    return {
      runs: data.items,
      total: data.total,
      limit: data.limit,
      offset: data.offset,
    };
  },

  /**
   * 실행 상세
   */
  getWorkflowRun: async (
    botId: string,
    runId: string
  ): Promise<WorkflowRunDetail> => {
    const { data } = await apiClient.get(
      API_ENDPOINTS.WORKFLOWS.WORKFLOW_RUN_DETAIL(botId, runId)
    );
    return data;
  },

  /**
   * 노드 실행 목록
   */
  getWorkflowRunNodes: async (
    botId: string,
    runId: string
  ): Promise<WorkflowNodeExecution[]> => {
    const { data } = await apiClient.get(
      API_ENDPOINTS.WORKFLOWS.WORKFLOW_RUN_NODES(botId, runId)
    );
    return data;
  },

  /**
   * 노드 실행 상세
   */
  getWorkflowRunNodeDetail: async (
    botId: string,
    runId: string,
    nodeId: string
  ): Promise<WorkflowNodeExecution> => {
    const { data } = await apiClient.get(
      API_ENDPOINTS.WORKFLOWS.WORKFLOW_RUN_NODE_DETAIL(botId, runId, nodeId)
    );
    return data;
  },

  /**
   * 토큰 통계 조회
   */
  getTokenStatistics: async (
    botId: string,
    options?: { runId?: string; startDate?: string; endDate?: string }
  ): Promise<WorkflowTokenStatistics> => {
    const params: Record<string, string> = {};
    if (options?.runId) params.run_id = options.runId;
    if (options?.startDate) params.start_date = options.startDate;
    if (options?.endDate) params.end_date = options.endDate;

    const { data } = await apiClient.get(
      API_ENDPOINTS.WORKFLOWS.WORKFLOW_RUN_STATISTICS(botId),
      { params }
    );
    return data;
  },

  /**
   * 실행 어노테이션 조회
   */
  getAnnotation: async (
    botId: string,
    runId: string
  ): Promise<WorkflowRunAnnotationPayload> => {
    const { data } = await apiClient.get(
      API_ENDPOINTS.WORKFLOWS.WORKFLOW_RUN_ANNOTATION(botId, runId)
    );
    return data;
  },

  /**
   * 실행 어노테이션 저장
   */
  saveAnnotation: async (
    botId: string,
    runId: string,
    annotation: string
  ): Promise<WorkflowRunAnnotationPayload> => {
    const { data } = await apiClient.post(
      API_ENDPOINTS.WORKFLOWS.WORKFLOW_RUN_ANNOTATION(botId, runId),
      { annotation }
    );
    return data;
  },
};

const mapNodeTypeResponse = (raw: any): NodeTypeResponse => {
  const hasPortsPayload = raw.input_ports || raw.output_ports;
  const ports: NodePortSchema | undefined = hasPortsPayload
    ? {
        inputs: normalizePortList(raw.input_ports),
        outputs: normalizePortList(raw.output_ports),
      }
    : clonePortSchema(raw.type);

  return {
    type: raw.type,
    label: NODE_TYPE_LABELS[raw.type] ?? raw.label ?? raw.name ?? raw.type,
    icon: raw.icon ?? raw.type,
    category: raw.category,
    description: raw.description || NODE_TYPE_DESCRIPTIONS[raw.type] || '',
    max_instances: raw.max_instances ?? -1,
    configurable: raw.configurable ?? true,
    ports,
    config_schema: raw.config_schema,
    default_data: raw.default_config ?? raw.default_data,
  };
};

const normalizePortList = (
  ports: Array<{
    name: string;
    type: string;
    required?: boolean;
    default_value?: unknown;
    description?: string;
    display_name?: string;
  }> = []
): PortDefinition[] => {
  return ports.map((port) => ({
    name: port.name,
    type: port.type,
    required: port.required ?? true,
    default_value: port.default_value,
    description: port.description ?? '',
    display_name: port.display_name ?? port.name,
  }));
};
