import { apiClient } from '@/shared/api/client';
import { API_ENDPOINTS } from '@/shared/constants/apiEndpoints';
import type {
  ChatRequest as APIChatRequest,
  ChatResponse as APIChatResponse,
  HealthCheckResponse,
  Source,
} from '@/shared/types/api.types';
import type { ChatResponse, ChatMessage } from '../types/chat.types';
import type { WorkflowNodeEvent } from '@/shared/types/streaming.types';

/**
 * Chat API (SnapAgent)
 * RAG 기반 채팅 및 문서 검색
 *
 * ⚠️ 주의: JWT Bearer Token 인증 필요 (apiClient 사용)
 */
export const chatApi = {
  /**
   * 채팅 메시지 전송 (RAG 기반)
   */
  async sendMessage(
    message: string,
    documentIds?: string[],
    sessionId?: string,
    options?: {
      bot_id?: string;
      max_tokens?: number;
      temperature?: number;
      stream?: boolean;
    }
  ): Promise<ChatResponse> {
    const payload: APIChatRequest = {
      message,
      bot_id: options?.bot_id,
      document_ids: documentIds,
      session_id: sessionId,
      max_tokens: options?.max_tokens,
      temperature: options?.temperature,
      stream: options?.stream,
    };

    const { data } = await apiClient.post<APIChatResponse>(
      API_ENDPOINTS.CHAT.SEND,
      payload
    );

    // API 응답을 프론트엔드 포맷으로 변환
    const chatMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      role: 'assistant',
      content: data.response, // 백엔드는 'response' 필드 사용
      timestamp: new Date().toISOString(),
      sources: data.sources,
    };

    return {
      message: chatMessage,
      sessionId: data.session_id,
    };
  },

  /**
   * 헬스 체크
   */
  async healthCheck(): Promise<HealthCheckResponse> {
    const { data } = await apiClient.get<HealthCheckResponse>(
      API_ENDPOINTS.CHAT.HEALTH
    );
    return data;
  },

  /**
   * 채팅 히스토리 조회 (추후 구현)
   */
  async getChatHistory(_sessionId: string): Promise<ChatMessage[]> {
    // TODO: 백엔드 API 추가 후 구현
    return [];
  },

  /**
   * 세션 초기화 (추후 구현)
   */
  async clearSession(_sessionId: string): Promise<{ success: boolean }> {
    // TODO: 백엔드 API 추가 후 구현
    return { success: true };
  },
};

/**
 * Helper: 사용자 메시지 포맷팅
 */
export const formatChatMessage = (
  content: string,
  role: 'user' | 'assistant' | 'system' = 'user'
): ChatMessage => {
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    role,
    content,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Helper: 에러가 Chat 관련 에러인지 확인
 */
export const isChatError = (error: unknown): error is Error => {
  return error instanceof Error;
};

/**
 * Helper: Chat 에러 처리
 */
export const handleChatError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

/**
 * 스트리밍 메시지 전송
 *
 * @param message - 사용자 메시지
 * @param botId - 봇 ID
 * @param options - 스트리밍 옵션
 * @returns Promise<void> - 스트림 완료 시 resolve
 *
 * @example
 * await sendMessageStream(
 *   '안녕하세요',
 *   'bot_123',
 *   {
 *     sessionId: 'session_xyz',
 *     onChunk: (chunk) => console.log(chunk),
 *     onComplete: () => console.log('Done'),
 *   }
 * );
 */
export async function sendMessageStream(
  message: string,
  botId: string,
  options?: {
    sessionId?: string;
    documentIds?: string[];
    topK?: number;
    temperature?: number;
    maxTokens?: number;
    includeSources?: boolean;
    onChunk?: (chunk: string) => void;
    onSources?: (sources: Source[]) => void;
    onError?: (error: Error) => void;
    onComplete?: () => void;
    onNodeEvent?: (event: WorkflowNodeEvent) => void;
  }
): Promise<void> {
  const { sendMessageStream: streamAPI } = await import('./chatStreamApi');

  await streamAPI(
    {
      message,
      bot_id: botId,
      session_id: options?.sessionId,
      document_ids: options?.documentIds,
      top_k: options?.topK,
      temperature: options?.temperature,
      max_tokens: options?.maxTokens,
      include_sources: options?.includeSources,
    },
    {
      onChunk: options?.onChunk,
      onSources: options?.onSources,
      onError: options?.onError,
      onComplete: options?.onComplete,
      onNodeEvent: options?.onNodeEvent,
    }
  );
}
