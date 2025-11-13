/**
 * Workflow API 응답 타입 정의
 */

import type { NodePortSchema } from '@/shared/types/workflow';
import type { BackendWorkflow } from '@/shared/types/workflowTransform.types';

/**
 * 노드 타입 응답
 */
export interface NodeTypeResponse {
  type: string;
  label: string;
  icon: string;
  category?: string;
  description?: string;
  max_instances: number; // -1 = unlimited
  configurable: boolean;
  ports?: NodePortSchema;
  config_schema?: Record<string, unknown>;
  default_data?: Record<string, unknown>;
}

/**
 * LLM 모델 응답
 */
export interface ModelResponse {
  id: string; // "gpt-4", "claude-3-opus", etc. (모델 식별자)
  name: string; // "GPT-4", "Claude 3 Opus", etc. (표시 이름)
  provider: string; // "openai", "anthropic" 등 slug
  description?: string;
  max_tokens?: number;
  supports_streaming?: boolean;
}

/**
 * 워크플로우 검증 응답
 */
export interface WorkflowValidationResponse {
  is_valid: boolean;
  errors: WorkflowValidationMessage[];
  warnings: WorkflowValidationMessage[];
  execution_order: string[] | null; // 노드 실행 순서
}

export interface WorkflowValidationMessage {
  node_id: string | null;
  type: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * 노드 타입 스키마 응답
 */
export interface NodeTypeSchema {
  type: string;
  config_schema: {
    type: 'object';
    properties: Record<string, unknown>;
    required: string[];
  };
}

export interface WorkflowVersionSummary {
  id: string;
  version: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  published_at?: string | null;
}

export interface WorkflowVersionDetail extends WorkflowVersionSummary {
  graph: BackendWorkflow;
  environment_variables: Record<string, unknown>;
  conversation_variables: Record<string, unknown>;
}

export interface WorkflowRunSummary {
  id: string;
  session_id: string;
  status: 'running' | 'succeeded' | 'failed';
  started_at: string;
  finished_at?: string | null;
  elapsed_time?: number | null;
  total_tokens?: number | null;
  total_steps?: number | null;
}

export interface WorkflowRunDetail extends WorkflowRunSummary {
  workflow_version_id: string;
  graph_snapshot: BackendWorkflow;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  error_message?: string | null;
}

export interface WorkflowNodeExecution {
  id: string;
  node_id: string;
  node_type: string;
  status: 'running' | 'succeeded' | 'failed';
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  started_at: string;
  finished_at?: string | null;
  elapsed_time?: number | null;
  tokens_used?: number | null;
  is_truncated?: boolean;
  truncated_fields?: Record<string, boolean>;
  error_message?: string | null;
}
