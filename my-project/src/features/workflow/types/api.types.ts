/**
 * Workflow API 응답 타입 정의
 */

/**
 * 노드 타입 응답
 */
export interface NodeTypeResponse {
  type: string;
  label: string;
  icon: string;
  max_instances: number; // -1 = unlimited
  configurable: boolean;
  config_schema?: Record<string, unknown>;
}

/**
 * LLM 모델 응답
 */
export interface ModelResponse {
  id: string; // "gpt-4", "claude-3-opus", etc. (모델 식별자)
  name: string; // "GPT-4", "Claude 3 Opus", etc. (표시 이름)
  provider: string; // "OpenAI", "Anthropic", etc.
  description?: string;
  max_tokens?: number;
  supports_streaming?: boolean;
}

/**
 * 워크플로우 검증 응답
 */
export interface WorkflowValidationResponse {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  execution_order: string[] | null; // 노드 실행 순서
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
