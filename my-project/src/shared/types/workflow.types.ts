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
  Assigner = 'variable-assigner',
  Http = 'http',
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
 */
export type AnswerNodeType = CommonNodeType<{
  type: BlockEnum.Answer;
  responseVariable?: string;
  responseType?: 'text' | 'json' | 'markdown';
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
 * If-Else 조건 타입
 */
export type IfElseCondition = {
  variable: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains';
  value: string;
  logicalOperator?: 'AND' | 'OR';
};

/**
 * If-Else 노드 타입
 */
export type IfElseNodeType = CommonNodeType<{
  type: BlockEnum.IfElse;
  conditions?: IfElseCondition[];
}>;

/**
 * Assigner 노드 타입
 */
export type AssignerNodeType = CommonNodeType<{
  type: BlockEnum.Assigner;
  assignments?: Array<{
    variable: string;
    value: string;
  }>;
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
