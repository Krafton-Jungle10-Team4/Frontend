import { apiClient } from '@/shared/api/client';
import { API_ENDPOINTS } from '@/shared/constants/apiEndpoints';

/**
 * API 키 인터페이스
 */
export interface APIKey {
  id: string;
  name: string;
  description?: string;
  key_preview: string;
  workflow_version_id?: string;
  bind_to_latest_published: boolean;
  permissions: {
    run: boolean;
    read: boolean;
    stop: boolean;
  };
  rate_limits: {
    per_minute: number;
    per_hour: number;
    per_day: number;
  };
  usage_summary: {
    requests_today: number;
    requests_month: number;
    last_used_at?: string;
  };
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}

/**
 * API 키 생성 요청
 */
export interface CreateAPIKeyRequest {
  name: string;
  description?: string;
  workflow_version_id?: string;
  bind_to_latest_published: boolean;
  permissions: {
    run: boolean;
    read: boolean;
    stop: boolean;
  };
  rate_limits: {
    per_minute: number;
    per_hour: number;
    per_day: number;
  };
  monthly_request_quota?: number;
  expires_at?: string;
  allowed_ips?: string[];
}

/**
 * API 키 생성 응답 (평문 키 포함)
 * 주의: 생성 시에는 usage_summary가 없음
 */
export interface CreateAPIKeyResponse {
  id: string;
  key: string; // ⚠️ 평문 키 (생성 시에만 제공)
  name: string;
  description?: string;
  key_preview: string;
  workflow_version_id?: string;
  bind_to_latest_published: boolean;
  permissions: {
    run: boolean;
    read: boolean;
    stop: boolean;
  };
  rate_limits: {
    per_minute: number;
    per_hour: number;
    per_day: number;
  };
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}

/**
 * API 키 목록 응답
 */
export interface APIKeyListResponse {
  object: string;
  data: APIKey[];
  has_more: boolean;
}

/**
 * API 키 사용량 응답
 */
export interface APIKeyUsageResponse {
  api_key_id: string;
  period: {
    start: string | null;
    end: string | null;
  };
  summary: {
    total_requests: number;
    total_tokens: number;
    avg_latency_ms: number;
  };
  time_series: Array<{
    timestamp: string;
    requests: number;
    tokens: number;
    latency_ms: number | null;
  }>;
}

/**
 * API 키 클라이언트
 */
export const apiKeyClient = {
  /**
   * API 키 목록 조회
   */
  list: (botId: string) =>
    apiClient.get<APIKeyListResponse>(API_ENDPOINTS.BOTS.API_KEYS(botId)),

  /**
   * API 키 생성
   */
  create: (botId: string, data: CreateAPIKeyRequest) =>
    apiClient.post<CreateAPIKeyResponse>(
      API_ENDPOINTS.BOTS.API_KEYS(botId),
      data
    ),

  /**
   * API 키 수정
   */
  update: (botId: string, keyId: string, data: Partial<CreateAPIKeyRequest>) =>
    apiClient.patch(API_ENDPOINTS.BOTS.API_KEY_DETAIL(botId, keyId), data),

  /**
   * API 키 삭제
   */
  delete: (botId: string, keyId: string) =>
    apiClient.delete(API_ENDPOINTS.BOTS.API_KEY_DETAIL(botId, keyId)),

  /**
   * 사용량 조회
   */
  getUsage: (
    botId: string,
    keyId: string,
    params?: {
      period?: 'hour' | 'day' | 'week' | 'month';
      start_date?: string;
      end_date?: string;
    }
  ) =>
    apiClient.get<APIKeyUsageResponse>(
      API_ENDPOINTS.BOTS.API_KEY_USAGE(botId, keyId),
      { params }
    ),
};

