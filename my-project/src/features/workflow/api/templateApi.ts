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
   */
  validateExport: async (
    workflowId: string,
    versionId: string
  ): Promise<ExportValidation> => {
    const response = await apiClient.post<ExportValidation>(
      API_ENDPOINTS.TEMPLATES.VALIDATE_EXPORT,
      null,
      {
        params: { workflow_id: workflowId, version_id: versionId },
      }
    );
    return response.data;
  },

  /**
   * 워크플로우 Export
   */
  export: async (config: ExportConfig): Promise<WorkflowTemplate> => {
    const response = await apiClient.post<WorkflowTemplate>(
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
   */
  upload: async (file: File): Promise<WorkflowTemplate> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<WorkflowTemplate>(
      API_ENDPOINTS.TEMPLATES.UPLOAD,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
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
   */
  update: async (
    templateId: string,
    updates: Partial<WorkflowTemplate>
  ): Promise<WorkflowTemplate> => {
    const response = await apiClient.patch<WorkflowTemplate>(
      API_ENDPOINTS.TEMPLATES.UPDATE(templateId),
      updates
    );
    return response.data;
  },

  /**
   * 템플릿 사용 기록
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
    await apiClient.post(API_ENDPOINTS.TEMPLATES.USAGE(templateId), usage);
  },
};
