/**
 * Demo App 타입 정의
 */

// API 설정
export interface ApiConfig {
  apiUrl: string;
  apiKey: string;
  botId?: string;
}

// 워크플로우 요청
export interface WorkflowRequest {
  inputs: Record<string, any>;
  response_mode: 'blocking' | 'streaming';
  alias?: string;
  bot_id?: string;
}

// 워크플로우 응답
export interface WorkflowResponse {
  workflow_run_id: string;
  outputs: Record<string, any>;
  status: 'success' | 'error' | 'running';
  usage?: {
    total_tokens: number;
    prompt_tokens: number;
    completion_tokens: number;
  };
  elapsed_time?: number;
  error?: string;
}

// 실행 기록
export interface ExecutionRecord {
  id: string;
  timestamp: string;
  request: WorkflowRequest;
  response: WorkflowResponse | null;
  status: 'success' | 'error' | 'pending';
  error?: string;
  duration?: number;
}

// 워크플로우 템플릿
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  inputs: Record<string, any>;
  example: {
    request: WorkflowRequest;
    response: WorkflowResponse;
  };
}

