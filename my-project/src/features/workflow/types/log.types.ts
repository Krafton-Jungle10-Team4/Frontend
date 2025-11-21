import type { BackendWorkflow } from '@/shared/types/workflowTransform.types';

export type WorkflowRunStatus = 'running' | 'succeeded' | 'failed';

export interface WorkflowRunSummary {
  id: string;
  bot_id: string;
  workflow_version_id?: string | null;
  workflow_version_name?: string | null;
  session_id?: string | null;
  status: WorkflowRunStatus;
  error_message?: string | null;
  started_at: string;
  finished_at?: string | null;
  elapsed_time?: number | null;
  total_tokens?: number | null;
  total_cost?: number | null;
  total_steps?: number | null;
  created_at: string;
  input_preview?: string | null;
  output_preview?: string | null;
}

export interface WorkflowRunDetail extends WorkflowRunSummary {
  graph_snapshot: BackendWorkflow;
  inputs: Record<string, unknown> | null;
  outputs: Record<string, unknown> | null;
}

export interface WorkflowNodeExecution {
  id: string;
  workflow_run_id: string;
  node_id: string;
  node_type: string;
  execution_order?: number | null;
  status: WorkflowRunStatus;
  error_message?: string | null;
  started_at: string;
  finished_at?: string | null;
  elapsed_time?: number | null;
  tokens_used?: number | null;
  cost?: number | null;
  model?: string | null;
  is_truncated?: boolean;
  truncated_fields?: Record<string, unknown> | null;
  inputs?: Record<string, unknown> | null;
  outputs?: Record<string, unknown> | null;
  process_data?: Record<string, unknown> | null;
  created_at?: string;
}

export type NodeExecution = WorkflowNodeExecution;

export interface WorkflowLogFilters {
  status?: WorkflowRunStatus | 'all';
  startDate?: Date;
  endDate?: Date;
  searchQuery?: string;
}

export interface PaginatedWorkflowRuns {
  items: WorkflowRunSummary[];
  total: number;
  limit: number;
  offset: number;
}

export interface WorkflowTokenStatistics {
  total_tokens: number;
  total_runs: number;
  average_tokens_per_run: number;
  by_node_type: Record<string, number>;
  by_date: Array<{ date: string; tokens: number }>;
}

export interface WorkflowRunAnnotationPayload {
  id?: string | null;
  annotation: string;
  updated_at?: string | null;
}
