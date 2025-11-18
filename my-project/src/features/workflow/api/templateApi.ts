/**
 * 템플릿 API 클라이언트
 */
import { apiClient } from '@/shared/api/client';
import { API_ENDPOINTS } from '@/shared/constants/apiEndpoints';
import { transformToBackend } from '@/shared/utils/workflowTransform';
import type { Node, Edge } from '@/shared/types/workflow.types';
import type {
  WorkflowTemplate,
  TemplateListResponse,
  ExportConfig,
  ExportValidation,
  ImportValidation,
  TemplateOperationResult,
} from '../types/template.types';

export const templateApi = {
  /**
   * 템플릿 목록 조회
   */
  list: async (params?: {
    visibility?: string;
    category?: string;
    search?: string;
    tags?: string[];
    author_id?: string;
    sort_by?: string;
    sort_order?: string;
    skip?: number;
    limit?: number;
  }): Promise<TemplateListResponse> => {
    const response = await apiClient.get<TemplateListResponse>(
      API_ENDPOINTS.TEMPLATES.LIST,
      { params }
    );
    return response.data;
  },

  /**
   * 템플릿 상세 조회
   */
  get: async (templateId: string): Promise<WorkflowTemplate> => {
    console.log('🔍 [templateApi.get] Fetching template:', templateId);
    const response = await apiClient.get<WorkflowTemplate>(
      API_ENDPOINTS.TEMPLATES.DETAIL(templateId)
    );

    console.log('✅ [templateApi.get] Response received:', {
      id: response.data.id,
      name: response.data.name,
      version: response.data.version,
      hasGraph: !!response.data.graph,
      graphStructure: response.data.graph ? {
        hasNodes: !!response.data.graph.nodes,
        hasEdges: !!response.data.graph.edges,
        nodesCount: response.data.graph.nodes?.length || 0,
        edgesCount: response.data.graph.edges?.length || 0,
        nodeTypes: response.data.graph.nodes?.map((n: any) => n.data?.type).filter(Boolean) || []
      } : null,
      hasInputSchema: !!response.data.input_schema,
      hasOutputSchema: !!response.data.output_schema,
      inputSchemaCount: response.data.input_schema?.length || 0,
      outputSchemaCount: response.data.output_schema?.length || 0
    });

    if (!response.data.graph) {
      console.error('❌ [templateApi.get] CRITICAL: Template missing graph field!', response.data);
    }

    if (response.data.graph && (!response.data.graph.nodes || !response.data.graph.edges)) {
      console.error('❌ [templateApi.get] CRITICAL: Template graph missing nodes or edges!', {
        hasNodes: !!response.data.graph.nodes,
        hasEdges: !!response.data.graph.edges,
        graph: response.data.graph
      });
    }

    return response.data;
  },

  /**
   * Export 검증
   * 프론트엔드 노드/엣지를 백엔드 형식으로 변환하여 전송
   * workflow_id와 version_id는 query parameter로 전달
   */
  validateExport: async (
    payload: {
      nodes: Node[];
      edges: Edge[];
    },
    queryParams: {
      workflow_id: string;
      version_id: string;
    }
  ): Promise<ExportValidation> => {
    console.log('🔍 [validateExport] Starting validation with:', {
      nodesCount: payload.nodes.length,
      edgesCount: payload.edges.length,
      workflow_id: queryParams.workflow_id,
      version_id: queryParams.version_id,
    });
    
    // 백엔드 형식으로 변환
    const transformedPayload = transformToBackend(payload.nodes, payload.edges);
    
    console.log('🔍 [validateExport] Transformed payload structure:', {
      nodesCount: transformedPayload.nodes.length,
      edgesCount: transformedPayload.edges.length,
      hasEnvironmentVars: !!transformedPayload.environment_variables,
      hasConversationVars: !!transformedPayload.conversation_variables,
      sampleNode: transformedPayload.nodes[0] ? {
        id: transformedPayload.nodes[0].id,
        type: transformedPayload.nodes[0].type,
        hasData: !!transformedPayload.nodes[0].data,
        hasPorts: !!transformedPayload.nodes[0].ports,
        hasVariableMappings: !!transformedPayload.nodes[0].variable_mappings,
      } : null,
    });
    
    // workflow_id와 version_id를 query parameter로 전달
    const response = await apiClient.post<ExportValidation>(
      API_ENDPOINTS.TEMPLATES.VALIDATE_EXPORT,
      transformedPayload,
      {
        params: {
          workflow_id: queryParams.workflow_id,
          version_id: queryParams.version_id,
        },
      }
    );
    return response.data;
  },

  /**
   * 워크플로우 Export
   * API 명세에 따라 최소 정보만 반환됨 (전체 템플릿 필요시 get 호출 필요)
   */
  export: async (config: ExportConfig): Promise<TemplateOperationResult> => {
    const response = await apiClient.post<TemplateOperationResult>(
      API_ENDPOINTS.TEMPLATES.EXPORT,
      config
    );
    return response.data;
  },

  /**
   * Import 검증
   */
  validateImport: async (templateId: string): Promise<ImportValidation> => {
    console.log('🔍 [templateApi.validateImport] Validating template:', templateId);
    const response = await apiClient.post<ImportValidation>(
      API_ENDPOINTS.TEMPLATES.VALIDATE_IMPORT(templateId)
    );

    console.log('✅ [templateApi.validateImport] Validation response:', {
      is_valid: response.data.is_valid,
      is_compatible: response.data.is_compatible,
      missing_node_types: response.data.missing_node_types,
      version_mismatch: response.data.version_mismatch,
      can_upgrade: response.data.can_upgrade,
      warnings: response.data.warnings,
      errors: response.data.errors
    });

    return response.data;
  },

  /**
   * 템플릿 업로드
   * API 명세에 따라 최소 정보만 반환됨 (전체 템플릿 필요시 get 호출 필요)
   * Content-Type 헤더는 axios가 자동으로 boundary와 함께 설정
   */
  upload: async (file: File): Promise<TemplateOperationResult> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<TemplateOperationResult>(
      API_ENDPOINTS.TEMPLATES.UPLOAD,
      formData
    );
    return response.data;
  },

  /**
   * 템플릿 삭제
   */
  delete: async (templateId: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.TEMPLATES.DELETE(templateId));
  },

  /**
   * 템플릿 업데이트
   * API 명세에 따라 최소 정보만 반환됨 (전체 템플릿 필요시 get 호출 필요)
   * 메타데이터만 수정 가능 (graph, input_schema, output_schema는 immutable)
   */
  update: async (
    templateId: string,
    updates: {
      name?: string;
      description?: string;
      category?: string;
      tags?: string[];
      visibility?: 'private' | 'team' | 'public';
    }
  ): Promise<TemplateOperationResult> => {
    const response = await apiClient.patch<TemplateOperationResult>(
      API_ENDPOINTS.TEMPLATES.UPDATE(templateId),
      updates
    );
    return response.data;
  },

  /**
   * 템플릿 사용 기록
   * API 명세에 따라 POST /api/v1/templates/{template_id}/use 사용
   */
  recordUsage: async (
    templateId: string,
    usage: {
      workflow_id: string;
      workflow_version_id?: string;
      node_id: string;
      event_type?: 'imported' | 'executed';
      note?: string;
    }
  ): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.TEMPLATES.USE(templateId), usage);
  },
};
