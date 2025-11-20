/**
 * Workflow API
 * 워크플로우 관련 API 함수 정의
 */

import { apiClient } from '@shared/api/client';
import type { WorkflowVersion, ABTestConfig } from '@shared/types/workflow';

export const workflowApi = {
  /**
   * 워크플로우 버전 히스토리 조회
   */
  getVersionHistory: async (botId: string): Promise<{ data: WorkflowVersion[] }> => {
    const response = await apiClient.get<WorkflowVersion[]>(
      `/api/v1/bots/${botId}/workflow-versions`
    );
    return { data: response.data };
  },

  /**
   * 특정 버전 상세 조회
   */
  getVersion: async (
    botId: string,
    versionId: string
  ): Promise<{ data: WorkflowVersion }> => {
    const response = await apiClient.get<WorkflowVersion>(
      `/api/v1/bots/${botId}/workflow-versions/${versionId}`
    );
    return { data: response.data };
  },

  /**
   * 버전 전환
   */
  switchVersion: async (
    workflowId: string,
    versionId: string
  ): Promise<void> => {
    await apiClient.post(
      `/api/v1/bots/${workflowId}/workflow-versions/${versionId}/switch`
    );
  },

  /**
   * A/B 테스트 생성
   */
  createABTest: async (
    workflowId: string,
    config: ABTestConfig
  ): Promise<void> => {
    await apiClient.post(
      `/api/v1/bots/${workflowId}/ab-test`,
      config
    );
  },
};
