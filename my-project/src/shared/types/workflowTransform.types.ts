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
  };
}

/**
 * 백엔드 엣지 스키마 (snake_case)
 */
export interface BackendEdge {
  id: string;
  source: string;
  target: string;
  type: string;
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
}
