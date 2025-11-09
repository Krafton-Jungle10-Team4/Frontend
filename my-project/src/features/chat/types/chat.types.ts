/**
 * Chat Types
 * 채팅 관련 타입 정의
 */

import type { Source } from '@/shared/types/api.types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  documentId?: string;
  sources?: Source[];
}

export interface ChatRequest {
  message: string;
  botId?: string; // Bot ID for workflow execution
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
