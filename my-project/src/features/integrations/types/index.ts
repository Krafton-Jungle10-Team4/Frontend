/**
 * Integrations Types
 * 외부 서비스 연동 타입 정의
 */

export interface SlackIntegration {
  id: number;
  workspace_id: string;
  workspace_name: string;
  workspace_icon?: string;
  bot_user_id?: string;
  scopes: string[];
  is_active: boolean;
  created_at: string;
}

export interface SlackChannel {
  id: string;
  name: string;
  is_private: boolean;
  is_member: boolean;
  num_members: number;
}

export interface SlackConnectRequest {
  bot_id?: string;
}

export interface SlackConnectResponse {
  oauth_url: string;
}

