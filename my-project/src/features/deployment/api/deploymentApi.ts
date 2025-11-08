/**
 * Deployment API
 * 배포 관리 관련 모든 API 호출 정의
 */

import { apiClient } from '@/shared/api/client';
import { API_ENDPOINTS } from '@/shared/constants/apiEndpoints';
import type {
  Deployment,
  DeploymentCreateRequest,
  DeploymentStatusUpdateRequest,
  DeploymentStatusUpdateResponse,
  DeploymentDeleteResponse,
} from '../types/deployment';

/**
 * Deployment API 함수들
 */
export const deploymentApi = {
  /**
   * 배포 생성 또는 업데이트
   * POST /api/v1/bots/{bot_id}/deploy
   *
   * @param botId - 봇 ID
   * @param data - 배포 설정 데이터
   * @returns 생성/업데이트된 배포 정보
   */
  createOrUpdate: async (
    botId: string,
    data: DeploymentCreateRequest
  ): Promise<Deployment> => {
    const response = await apiClient.post<Deployment>(
      API_ENDPOINTS.BOTS.DEPLOY(botId),
      data
    );
    return response.data;
  },

  /**
   * 배포 조회
   * GET /api/v1/bots/{bot_id}/deployment
   *
   * @param botId - 봇 ID
   * @returns 배포 정보 (없으면 null)
   */
  get: async (botId: string): Promise<Deployment | null> => {
    try {
      const response = await apiClient.get<Deployment>(
        API_ENDPOINTS.BOTS.DEPLOYMENT(botId)
      );
      return response.data;
    } catch (error: any) {
      // 404 Not Found: 배포가 아직 생성되지 않음
      if (error.response?.status === 404) {
        return null;
      }
      // 다른 에러는 throw
      throw error;
    }
  },

  /**
   * 배포 상태 변경
   * PATCH /api/v1/bots/{bot_id}/deployment/status
   *
   * @param botId - 봇 ID
   * @param data - 상태 변경 요청 데이터
   * @returns 상태 변경 결과
   */
  updateStatus: async (
    botId: string,
    data: DeploymentStatusUpdateRequest
  ): Promise<DeploymentStatusUpdateResponse> => {
    const response = await apiClient.patch<DeploymentStatusUpdateResponse>(
      API_ENDPOINTS.BOTS.DEPLOYMENT_STATUS(botId),
      data
    );
    return response.data;
  },

  /**
   * 배포 삭제
   * DELETE /api/v1/bots/{bot_id}/deployment
   *
   * @param botId - 봇 ID
   * @returns 삭제 결과 메시지
   */
  delete: async (botId: string): Promise<DeploymentDeleteResponse> => {
    const response = await apiClient.delete<DeploymentDeleteResponse>(
      API_ENDPOINTS.BOTS.DEPLOYMENT(botId)
    );
    return response.data;
  },
} as const;
