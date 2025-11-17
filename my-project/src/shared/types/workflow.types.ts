import type {
  Edge as ReactFlowEdge,
  Node as ReactFlowNode,
  XYPosition,
} from '@xyflow/react';
import type { NodePortSchema } from './workflow/port.types';
import type { NodeVariableMappings } from './workflow/variable.types';

/**
 * 워크플로우 노드 타입 열거형
 */
export enum BlockEnum {
  Start = 'start',
  LLM = 'llm',
  End = 'end',
  KnowledgeRetrieval = 'knowledge-retrieval',
  MCP = 'mcp',
  Answer = 'answer',
  KnowledgeBase = 'knowledge-base',
  Code = 'code',
  TemplateTransform = 'template-transform',
  IfElse = 'if-else',
  VariableAssigner = 'variable-assigner', // Legacy node
  Assigner = 'assigner', // New node with per-operation ports
  Http = 'http',
  QuestionClassifier = 'question-classifier',
  TavilySearch = 'tavily-search',
  ImportedWorkflow = 'imported-workflow',
}

/**
 * 노드 실행 상태
 */
export enum NodeRunningStatus {
  NotStart = 'not-start',
  Waiting = 'waiting',
  Running = 'running',
  Succeeded = 'succeeded',
  Failed = 'failed',
  Exception = 'exception',
  Stopped = 'stopped',
}

/**
 * 노드 데이터 공통 타입
 * 모든 워크플로우 노드가 공유하는 기본 속성
 */
export type CommonNodeType<T = object> = {
  // 연결 관련
  _connectedSourceHandleIds?: string[];
  _connectedTargetHandleIds?: string[];

  // 실행 상태 관련
  _runningStatus?: NodeRunningStatus;
  _singleRunningStatus?: NodeRunningStatus;
  _isSingleRun?: boolean;
  _waitingRun?: boolean;

  // UI 상태 관련
  _isCandidate?: boolean;
  _isEntering?: boolean;
  _dimmed?: boolean;

  // 기본 속성
  selected?: boolean;
  title: string;
  desc?: string;
  type: BlockEnum;
  width?: number;
  height?: number;
  position?: XYPosition;
  ports?: NodePortSchema;
  variable_mappings?: NodeVariableMappings;
} & T;

/**
 * 엣지 데이터 공통 타입
 */
export type CommonEdgeType = {
  _hovering?: boolean;
  _connectedNodeIsHovering?: boolean;
  _connectedNodeIsSelected?: boolean;
  _sourceRunningStatus?: NodeRunningStatus;
  _targetRunningStatus?: NodeRunningStatus;
  _waitingRun?: boolean;
  sourceType: BlockEnum;
  targetType: BlockEnum;
};

/**
 * React Flow 노드 타입 (CommonNodeType 래퍼)
 */
export type Node<T = object> = ReactFlowNode<CommonNodeType<T>>;

/**
 * React Flow 엣지 타입 (CommonEdgeType 래퍼)
 */
export type Edge = ReactFlowEdge<CommonEdgeType>;

/**
 * 노드 컴포넌트 Props
 */
export type NodeProps<T = object> = {
  id: string;
  data: CommonNodeType<T>;
};

/**
 * Start 노드 타입
 */
export type StartNodeType = CommonNodeType<{
  type: BlockEnum.Start;
}>;

/**
 * LLM 노드 타입
 */
export type LLMNodeType = CommonNodeType<{
  type: BlockEnum.LLM;
  provider?: string;
  model?:
    | string
    | {
        provider: string;
        name: string;
      };
  prompt?: string;
  temperature?: number;
  maxTokens?: number;
}>;

/**
 * End 노드 타입
 */
export type EndNodeType = CommonNodeType<{
  type: BlockEnum.End;
}>;

/**
 * Knowledge Retrieval 노드 타입
 */
export type KnowledgeRetrievalNodeType = CommonNodeType<{
  type: BlockEnum.KnowledgeRetrieval;
  dataset?: string;
  retrievalMode?: string;
  topK?: number;
  documentIds?: string[];
}>;

/**
 * Workflow 저장/불러오기 타입
 */
export type WorkflowData = {
  id?: string;
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  createdAt?: string;
  updatedAt?: string;
};

/**
 * MCP 노드 타입
 */
export type MCPNodeType = CommonNodeType<{
  type: BlockEnum.MCP;
  provider_id?: string;
  action?: string;
  parameters?: Record<string, any>;
}>;

/**
 * Answer 노드 타입
 * 워크플로우의 최종 응답 출력 노드
 */
export type AnswerNodeType = CommonNodeType<{
  type: BlockEnum.Answer;
  template?: string; // 응답 템플릿 (변수 참조 포함)
  description?: string; // 노드 설명 (선택)
}>;

/**
 * Knowledge Base 노드 타입
 */
export type KnowledgeBaseNodeType = CommonNodeType<{
  type: BlockEnum.KnowledgeBase;
  datasetId?: string;
  documents?: Array<{ id: string; name: string }>;
  indexingMethod?: 'vector' | 'keyword' | 'hybrid';
}>;

/**
 * Code 노드 타입
 */
export type CodeNodeType = CommonNodeType<{
  type: BlockEnum.Code;
  language?: 'python3' | 'javascript';
  code?: string;
  inputVariables?: Record<string, string>;
  outputVariable?: string;
}>;

/**
 * Template Transform 노드 타입
 */
export type TemplateTransformNodeType = CommonNodeType<{
  type: BlockEnum.TemplateTransform;
  template?: string;
  outputFormat?: 'plain' | 'markdown' | 'json';
}>;

/**
 * If-Else 비교 연산자
 */
export enum ComparisonOperator {
  // Equality
  EQUAL = '=',
  NOT_EQUAL = '≠',

  // Numeric
  GREATER_THAN = '>',
  LESS_THAN = '<',
  GREATER_EQUAL = '≥',
  LESS_EQUAL = '≤',

  // String
  CONTAINS = 'contains',
  IS = 'is',
  IS_NOT = 'is not',

  // Null/Empty
  EMPTY = 'empty',
  NOT_EMPTY = 'not empty',
}

/**
 * If-Else 논리 연산자
 */
export enum LogicalOperator {
  AND = 'and',
  OR = 'or',
}

/**
 * 변수 타입
 */
export enum VarType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
}

/**
 * If-Else 조건
 */
export type IfElseCondition = {
  id: string;
  varType: VarType;
  variable_selector: string; // "node_id.port_name"
  comparison_operator: ComparisonOperator;
  value?: string | number | boolean;
};

/**
 * If-Else 케이스 (IF, ELIF)
 */
export type IfElseCase = {
  case_id: string;
  logical_operator: LogicalOperator;
  conditions: IfElseCondition[];
};

/**
 * If-Else 노드 타입
 */
export type IfElseNodeType = CommonNodeType<{
  type: BlockEnum.IfElse;
  cases?: IfElseCase[];
}>;

/**
 * Assigner WriteMode 작업 타입
 */
export enum WriteMode {
  // 기본 작업 (모든 타입)
  OVERWRITE = 'over-write',
  CLEAR = 'clear',
  SET = 'set',

  // 배열 작업
  APPEND = 'append',
  EXTEND = 'extend',
  REMOVE_FIRST = 'remove-first',
  REMOVE_LAST = 'remove-last',

  // 산술 작업 (number 전용)
  INCREMENT = '+=',
  DECREMENT = '-=',
  MULTIPLY = '*=',
  DIVIDE = '/=',
}

/**
 * Assigner 입력 타입
 */
export enum AssignerInputType {
  VARIABLE = 'variable',
  CONSTANT = 'constant',
}

/**
 * Assigner 작업 정의
 */
export type AssignerOperation = {
  id: string;
  write_mode: WriteMode;
  input_type: AssignerInputType;
  target_variable?: {
    port_name: string;
    data_type?: string;
  };
  constant_value?: any;
  source_variable?: {
    port_name: string;
    data_type?: string;
  };
};

/**
 * Assigner 노드 타입 (v2)
 */
export type AssignerNodeType = CommonNodeType<{
  type: BlockEnum.Assigner;
  version?: '2';
  operations: AssignerOperation[];
  ui_state?: {
    expanded: boolean;
    selected_operation?: number;
  };
}>;

/**
 * HTTP 노드 타입
 */
export type HttpNodeType = CommonNodeType<{
  type: BlockEnum.Http;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url?: string;
  headers?: Array<{ key: string; value: string }>;
  body?: string;
  timeout?: number;
}>;

/**
 * Question Classifier - Topic (분류 카테고리)
 */
export type Topic = {
  id: string;
  name: string;
};

/**
 * Question Classifier - Model Config
 */
export type ModelConfig = {
  provider: string;
  name: string;
  mode: 'chat' | 'completion';
  completion_params: {
    temperature: number;
    max_tokens?: number;
  };
};

/**
 * Question Classifier - Vision Config
 */
export type VisionConfig = {
  enabled: boolean;
  variable_selector?: string[];
  detail?: 'auto' | 'low' | 'high';
};

/**
 * Question Classifier - Memory Config
 */
export type MemoryConfig = {
  role_prefix: {
    user: string;
    assistant: string;
  };
  window: {
    enabled: boolean;
    size: number;
  };
};

/**
 * Question Classifier 노드 타입
 */
export type QuestionClassifierNodeType = CommonNodeType<{
  type: BlockEnum.QuestionClassifier;
  query_variable_selector?: string[];
  model?: ModelConfig;
  classes?: Topic[];
  instruction?: string;
  memory?: MemoryConfig;
  vision?: VisionConfig;
}>;

/**
 * Tavily Search 노드 타입
 */
export type TavilySearchNodeType = CommonNodeType<{
  type: BlockEnum.TavilySearch;
  ports?: NodePortSchema;
  variable_mappings?: NodeVariableMappings;

  // 검색 옵션
  search_depth?: 'basic' | 'advanced';
  topic?: 'general' | 'news' | 'finance';
  max_results?: number; // 0-20

  // 도메인 필터링
  include_domains?: string[];
  exclude_domains?: string[];

  // 시간 필터링
  time_range?: 'day' | 'week' | 'month' | 'year' | null;
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD

  // 콘텐츠 옵션
  include_answer?: boolean;
  include_raw_content?: boolean;
}>;
