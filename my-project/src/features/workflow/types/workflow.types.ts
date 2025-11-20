/**
 * 워크플로우 및 라이브러리 관련 타입 정의
 */

import type { BackendWorkflow } from '@/shared/types/workflowTransform.types';
import type { PortDefinition } from '@/shared/types/workflow/port.types';

// ========== 라이브러리 관련 타입 (신규) ==========

export interface LibraryMetadata {
  library_name?: string;  // Optional: 미제공 시 백엔드에서 봇 이름 사용
  library_description?: string;
  library_category?: string;
  library_tags?: string[];
}

export interface PublishWorkflowRequest {
  library_metadata?: LibraryMetadata;
}

export interface LibraryAgentVersion {
  id: string;  // UUID 문자열
  bot_id: string;
  version: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  published_at?: string;
  library_name?: string;
  library_description?: string;
  library_category?: string;
  library_tags?: string[];
  library_visibility?: 'private' | 'team' | 'public';
  is_in_library: boolean;
  library_published_at?: string;
  input_schema?: any;
  output_schema?: any;
  node_count?: number;
  edge_count?: number;
  port_definitions?: any;

  // 🆕 배포 관련 필드 추가
  deployment_status?: 'draft' | 'published' | 'suspended';
  widget_key?: string;
  deployed_at?: string;
}

export interface LibraryAgentDetail extends LibraryAgentVersion {
  graph: BackendWorkflow;
  environment_variables?: Record<string, any>;
  conversation_variables?: Record<string, any>;
  features?: Record<string, any>;
  input_schema?: PortDefinition[];
  output_schema?: PortDefinition[];
  port_definitions?: Record<string, any>;
  created_at: string;
}

export interface LibraryFilterParams {
  category?: string;
  visibility?: string;
  search?: string;
  tags?: string[];
  page?: number;
  page_size?: number;
}

export interface LibraryAgentsResponse {
  agents: LibraryAgentVersion[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface LibraryImportRequest {
  source_version_id: string;
}

// ========== WorkflowVersion 관련 타입 ==========

export interface WorkflowVersion {
  id: string;  // UUID 문자열
  bot_id: string;
  version: string;
  status: 'draft' | 'published' | 'archived';
  graph: BackendWorkflow;
  environment_variables?: Record<string, any>;
  conversation_variables?: Record<string, any>;
  features?: Record<string, any>;
  created_by?: string;  // UUID 문자열
  created_at: string;
  updated_at: string;
  published_at?: string;

  // 라이브러리 관련 필드 (신규)
  library_name?: string;
  library_description?: string;
  library_category?: string;
  library_tags?: string[];
  library_visibility?: string;
  is_in_library: boolean;
  library_published_at?: string;

  // 통계 및 스키마 정보 (신규)
  input_schema?: PortDefinition[];
  output_schema?: PortDefinition[];
  node_count?: number;
  edge_count?: number;
  port_definitions?: Record<string, any>;
}
