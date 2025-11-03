import { apiClient } from '@/shared/api/client';
import type { WorkflowData } from '../types/workflow.types';

/**
 * Workflow API
 *
 * 워크플로우 CRUD 및 실행 관련 API
 */
export const workflowApi = {
  /**
   * 모든 워크플로우 조회
   */
  getAll: async (): Promise<WorkflowData[]> => {
    const { data } = await apiClient.get('/workflows');
    return data;
  },

  /**
   * 특정 워크플로우 조회
   */
  getById: async (id: string): Promise<WorkflowData> => {
    const { data } = await apiClient.get(`/workflows/${id}`);
    return data;
  },

  /**
   * 워크플로우 생성
   */
  create: async (workflow: Omit<WorkflowData, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkflowData> => {
    const { data } = await apiClient.post('/workflows', workflow);
    return data;
  },

  /**
   * 워크플로우 수정
   */
  update: async (
    id: string,
    workflow: Partial<Omit<WorkflowData, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<WorkflowData> => {
    const { data } = await apiClient.patch(`/workflows/${id}`, workflow);
    return data;
  },

  /**
   * 워크플로우 삭제
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/workflows/${id}`);
  },

  /**
   * 워크플로우 실행
   */
  execute: async (id: string, input?: Record<string, unknown>): Promise<unknown> => {
    const { data } = await apiClient.post(`/workflows/${id}/execute`, { input });
    return data;
  },

  /**
   * 워크플로우 검증
   */
  validate: async (workflow: Omit<WorkflowData, 'id' | 'createdAt' | 'updatedAt'>): Promise<{
    valid: boolean;
    errors?: string[];
  }> => {
    const { data } = await apiClient.post('/workflows/validate', workflow);
    return data;
  },
};
