import { apiClient } from '@/shared/api/client';
import { API_ENDPOINTS } from '@/shared/constants/apiEndpoints';
import type {
  TeamResponse,
  APIKeyResponse,
  CreateAPIKeyRequest,
  InviteTokenResponse,
} from '@/shared/types/api.types';

/**
 * Team API (SnapAgent)
 * 팀 관리 및 API 키 생성/관리
 */
export const teamApi = {
  /**
   * 내 팀 정보 조회
   * @returns TeamResponse
   */
  getMyTeam: async (): Promise<TeamResponse> => {
    const { data } = await apiClient.get<TeamResponse>(API_ENDPOINTS.TEAMS.ME);
    return data;
  },

  /**
   * API 키 생성
   * @param teamId 팀 ID
   * @param request API 키 생성 요청
   * @returns APIKeyResponse (api_key는 생성 시에만 반환됨!)
   */
  createAPIKey: async (
    teamId: number,
    request: CreateAPIKeyRequest
  ): Promise<APIKeyResponse> => {
    const { data } = await apiClient.post<APIKeyResponse>(
      API_ENDPOINTS.TEAMS.API_KEYS(teamId),
      request
    );
    return data;
  },

  /**
   * API 키 목록 조회
   * @param teamId 팀 ID
   * @returns APIKeyResponse[] (api_key는 포함되지 않음)
   */
  listAPIKeys: async (teamId: number): Promise<APIKeyResponse[]> => {
    const { data } = await apiClient.get<APIKeyResponse[]>(
      API_ENDPOINTS.TEAMS.API_KEYS(teamId)
    );
    return data;
  },

  /**
   * API 키 삭제 (취소)
   * @param teamId 팀 ID
   * @param keyId API 키 ID
   */
  deleteAPIKey: async (teamId: number, keyId: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.TEAMS.API_KEY_DELETE(teamId, keyId));
  },

  /**
   * 팀 초대 토큰 생성
   * @param teamId 팀 ID
   * @returns InviteTokenResponse
   */
  createInviteToken: async (teamId: number): Promise<InviteTokenResponse> => {
    const { data } = await apiClient.post<InviteTokenResponse>(
      API_ENDPOINTS.TEAMS.INVITES(teamId)
    );
    return data;
  },

  /**
   * 초대 토큰으로 팀 가입
   * @param token 초대 토큰
   * @returns TeamResponse
   */
  joinTeam: async (token: string): Promise<TeamResponse> => {
    const { data } = await apiClient.post<TeamResponse>(
      API_ENDPOINTS.TEAMS.JOIN(token)
    );
    return data;
  },
};
