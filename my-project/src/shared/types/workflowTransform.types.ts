/**
 * 워크플로우 데이터 변환 레이어 타입 정의
 * 백엔드 스키마와 프론트엔드 스키마 간 변환을 위한 타입
 */

/**
 * 백엔드 노드 스키마 (snake_case)
 */
export interface BackendNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    title: string;
    desc: string;
    type: string;
    // LLM 노드
    provider?: string;
    model?: string;
    prompt_template?: string;
    temperature?: number;
    max_tokens?: number;
    // Knowledge Retrieval 노드
    dataset_id?: string;
    mode?: 'semantic' | 'keyword' | 'hybrid';
    top_k?: number;
    document_ids?: string[];
    // MCP 노드
    provider_id?: string;
    action?: string;
    parameters?: Record<string, any>;
    // Tavily Search 노드
    search_depth?: 'basic' | 'advanced';
    topic?: 'general' | 'news' | 'finance';
    max_results?: number;
    include_domains?: string[];
    exclude_domains?: string[];
    time_range?: 'day' | 'week' | 'month' | 'year' | null;
    start_date?: string;
    end_date?: string;
    include_answer?: boolean;
    include_raw_content?: boolean;
    [key: string]: unknown;
  };
  ports?: {
    inputs: Array<{
      name: string;
      type: string;
      required: boolean;
      default_value?: unknown;
      description?: string;
      display_name?: string;
    }>;
    outputs: Array<{
      name: string;
      type: string;
      required: boolean;
      default_value?: unknown;
      description?: string;
      display_name?: string;
    }>;
  };
  variable_mappings?: Record<
    string,
    {
      target_port: string;
      source: {
        variable: string;
        value_type: string;
      };
    }
  >;
}

/**
 * 백엔드 엣지 스키마 (snake_case)
 */
export interface BackendEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  source_port?: string | null;
  target_port?: string | null;
  data_type?: string | null;
  data: {
    source_type: string;
    target_type: string;
  };
}

/**
 * 백엔드 워크플로우 스키마
 */
export interface BackendWorkflow {
  nodes: BackendNode[];
  edges: BackendEdge[];
  environment_variables?: Record<string, unknown>;
  conversation_variables?: Record<string, unknown>;
}
