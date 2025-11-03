import type {
  TeamResponse,
  APIKeyResponse,
  InviteTokenResponse,
} from '@/shared/types/api.types';

/**
 * Team Types (Frontend)
 * SnapAgent API 기반 팀 관리
 */

/**
 * Team 정보 (프론트엔드용)
 */
export interface Team {
  id: number;
  name: string;
  ownerId: number;
  createdAt: string;
  memberCount?: number;
}

/**
 * API Key 정보 (프론트엔드용)
 */
export interface APIKey {
  id: number;
  name: string;
  key: string;
  createdAt: string;
  lastUsedAt: string | null;
  isActive: boolean;
}

/**
 * Invite Token 정보 (프론트엔드용)
 */
export interface InviteToken {
  token: string;
  expiresAt: string;
}

/**
 * TeamResponse를 Team으로 변환
 */
export const mapTeamResponseToTeam = (response: TeamResponse): Team => {
  return {
    id: response.id,
    name: response.name,
    ownerId: response.owner_id,
    createdAt: response.created_at,
  };
};

/**
 * APIKeyResponse를 APIKey로 변환
 */
export const mapAPIKeyResponseToAPIKey = (response: APIKeyResponse): APIKey => {
  return {
    id: response.id,
    name: response.name,
    key: response.key,
    createdAt: response.created_at,
    lastUsedAt: response.last_used_at,
    isActive: response.is_active,
  };
};

/**
 * InviteTokenResponse를 InviteToken으로 변환
 */
export const mapInviteTokenResponseToInviteToken = (
  response: InviteTokenResponse
): InviteToken => {
  return {
    token: response.token,
    expiresAt: response.expires_at,
  };
};
