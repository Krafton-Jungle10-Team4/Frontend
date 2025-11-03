/**
 * Chat API Client
 * 채팅 관련 API 호출 함수들
 */

import { API_BASE_URL } from '@/utils/constants';
import type {
  ChatRequest,
  ChatResponse,
  ChatHealthResponse,
  ChatMessage
} from '@/types';

const CHAT_BASE = `${API_BASE_URL}/api/v1/chat`;

export const chatApi = {
  /**
   * 채팅 메시지 전송
   */
  async sendMessage(message: string, documentId?: string, sessionId?: string): Promise<ChatResponse> {
    const payload: ChatRequest = {
      message,
      documentId,
      sessionId,
    };

    const response = await fetch(CHAT_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Chat failed: ${response.statusText}`);
    }

    const data = await response.json();

    // 응답 형식 정규화
    return {
      message: data.message || {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: data.content || data.response || '',
        timestamp: new Date().toISOString(),
        documentId,
      },
      sessionId: data.sessionId || sessionId || `session_${Date.now()}`,
    };
  },

  /**
   * 헬스 체크
   */
  async healthCheck(): Promise<ChatHealthResponse> {
    const response = await fetch(`${CHAT_BASE}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // 헬스 체크 실패는 서비스 unhealthy로 처리
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      };
    }

    const data = await response.json();

    // 응답 형식 정규화
    return {
      status: data.status || 'healthy',
      timestamp: data.timestamp || new Date().toISOString(),
      version: data.version,
    };
  },

  /**
   * 채팅 히스토리 조회 (추후 구현)
   */
  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    // TODO: 백엔드 API 추가 후 구현
    console.warn('getChatHistory is not implemented yet');
    return [];
  },

  /**
   * 세션 초기화 (추후 구현)
   */
  async clearSession(sessionId: string): Promise<{ success: boolean }> {
    // TODO: 백엔드 API 추가 후 구현
    console.warn('clearSession is not implemented yet');
    return { success: true };
  },
};

// Helper functions
export const formatChatMessage = (content: string, role: 'user' | 'assistant' = 'user'): ChatMessage => {
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    role,
    content,
    timestamp: new Date().toISOString(),
  };
};

export const isChatError = (error: any): boolean => {
  return error.message?.includes('Chat') || error.message?.includes('chat');
};

export const handleChatError = (error: any): string => {
  console.error('Chat API Error:', error);

  if (error.message?.includes('network')) {
    return '네트워크 연결을 확인해주세요.';
  }
  if (error.message?.includes('timeout')) {
    return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
  }
  if (error.message?.includes('unauthorized')) {
    return '인증이 필요합니다. 다시 로그인해주세요.';
  }

  return '채팅 서비스에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
};