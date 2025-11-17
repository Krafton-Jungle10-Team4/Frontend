/**
 * 워크플로우 템플릿 관련 타입 정의
 */
import type { Node, Edge } from '@xyflow/react';

/**
 * 작성자 정보
 */
export interface Author {
  id: string;
  name: string;
  email?: string;
}

/**
 * 템플릿 메타데이터
 */
export interface TemplateMetadata {
  tags: string[];
  category?: string;
  visibility: 'private' | 'team' | 'public';
  source_workflow_id?: string;
  source_version_id?: string;
  node_count: number;
  edge_count: number;
  estimated_tokens?: number;
  estimated_cost?: number;
}

/**
 * 포트 정의
 */
export interface PortDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'any';
  required: boolean;
  description?: string;
  display_name?: string;
  default_value?: unknown;
}

/**
 * 템플릿 그래프
 */
export interface TemplateGraph {
  nodes: Node[];
  edges: Edge[];
}

/**
 * 워크플로우 템플릿 (완전한 구조)
 */
export interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  version: string;
  created_at: string;
  updated_at?: string;
  author: Author;
  metadata: TemplateMetadata;
  graph: TemplateGraph;
  input_schema: PortDefinition[];
  output_schema: PortDefinition[];
  thumbnail_url?: string;
}

/**
 * Export 설정
 */
export interface ExportConfig {
  workflow_id: string;
  version_id: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  visibility?: 'private' | 'team' | 'public';
  custom_input_schema?: PortDefinition[];
  custom_output_schema?: PortDefinition[];
  thumbnail_url?: string;
  estimated_tokens?: number;
  estimated_cost?: number;
}

/**
 * Export 검증 결과
 */
export interface ExportValidation {
  is_valid: boolean;
  has_published_version: boolean;
  has_start_node: boolean;
  has_end_node: boolean;
  detected_input_ports: PortDefinition[];
  detected_output_ports: PortDefinition[];
  errors: string[];
  warnings: string[];
  node_count: number;
  edge_count: number;
}

/**
 * Import 검증 결과
 */
export interface ImportValidation {
  is_valid: boolean;
  is_compatible: boolean;
  missing_node_types: string[];
  version_mismatch: boolean;
  can_upgrade: boolean;
  warnings: string[];
  errors: string[];
}

/**
 * 템플릿 목록 응답
 */
export interface TemplateListResponse {
  templates: WorkflowTemplate[];
  pagination: {
    total: number;
    skip: number;
    limit: number;
  };
}
