/**
 * 템플릿 API 클라이언트
 */
import { apiClient } from '@/shared/api/client';
import { API_ENDPOINTS } from '@/shared/constants/apiEndpoints';
import type {
  WorkflowTemplate,
  TemplateListResponse,
  ExportConfig,
  ExportValidation,
  ImportValidation,
  TemplateOperationResult,
  TemplateGraph,
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
    const response = await apiClient.get<WorkflowTemplate>(
      API_ENDPOINTS.TEMPLATES.DETAIL(templateId)
    );
    return response.data;
  },

  /**
   * Export 검증
   * API 명세에 따라 그래프 데이터를 request body로 전송
   */
  validateExport: async (graph: TemplateGraph): Promise<ExportValidation> => {
    const response = await apiClient.post<ExportValidation>(
      API_ENDPOINTS.TEMPLATES.VALIDATE_EXPORT,
      graph
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
    const response = await apiClient.post<ImportValidation>(
      API_ENDPOINTS.TEMPLATES.VALIDATE_IMPORT(templateId)
    );
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
