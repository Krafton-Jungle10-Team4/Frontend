import { widgetClient } from './widgetClient';
import { API_ENDPOINTS } from '@shared/constants/apiEndpoints';
import type {
  WidgetConfigResponse,
  SessionCreateRequest,
  SessionCreateResponse,
  WidgetChatRequest,
  WidgetChatResponse,
} from '../types/widget.types';

/**
 * Widget API 클라이언트
 *
 * 주의:
 * - widgetClient 사용 (apiClient 사용 금지)
 * - 세션 토큰만 Bearer 헤더로 전달
 */
export const widgetApi = {
  /**
   * Widget 설정 로드 (Public API, 인증 불필요)
   */
  getConfig: async (widgetKey: string): Promise<WidgetConfigResponse> => {
    const { data } = await widgetClient.get<WidgetConfigResponse>(
      API_ENDPOINTS.WIDGET.CONFIG(widgetKey)
    );
    return data;
  },

  /**
   * Widget 세션 생성 (Public API, signature 검증)
   */
  createSession: async (
    request: SessionCreateRequest
  ): Promise<SessionCreateResponse> => {
    const { data } = await widgetClient.post<SessionCreateResponse>(
      API_ENDPOINTS.WIDGET.SESSIONS,
      request
    );
    return data;
  },

  /**
   * Widget 채팅 메시지 전송 (세션 토큰 필요)
   */
  sendMessage: async (
    sessionToken: string,
    request: WidgetChatRequest
  ): Promise<WidgetChatResponse> => {
    const { data } = await widgetClient.post<WidgetChatResponse>(
      API_ENDPOINTS.WIDGET.CHAT,
      request,
      {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      }
    );
    return data;
  },

  /**
   * Widget 사용 추적 (선택적)
   */
  trackUsage: async (
    widgetKey: string,
    event: string,
    metadata: Record<string, unknown>
  ): Promise<void> => {
    await widgetClient.post(API_ENDPOINTS.WIDGET.TRACK(widgetKey), {
      event,
      metadata,
    });
  },
};
