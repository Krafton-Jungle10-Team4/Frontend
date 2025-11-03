/**
 * Chat Types
 * 채팅 관련 타입 정의
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  documentId?: string;
}

export interface ChatRequest {
  message: string;
  documentId?: string;
  sessionId?: string;
}

export interface ChatResponse {
  message: ChatMessage;
  sessionId: string;
}

export interface ChatHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version?: string;
}
