/**
 * API 공통 타입 정의
 */

import type { BackendWorkflow } from './workflowTransform.types';

// ============================================
// User & Auth
// ============================================
export interface UserResponse {
  id: number;
  email: string;
  name: string | null;
  profile_image: string | null;
  created_at: string; // ISO 8601
}

// ============================================
// Team
// ============================================
export interface TeamResponse {
  id: number;
  uuid: string;
  name: string;
  description: string;
  created_at: string;
}

export interface APIKeyResponse {
  id: number;
  key_name: string;
  api_key: string; // Only on creation!
  created_at: string;
  expires_at: string | null;
}

export interface CreateAPIKeyRequest {
  key_name: string;
  expires_at?: string | null;
}

export interface InviteTokenResponse {
  token: string;
  expires_at: string;
}

// ============================================
// Documents
// ============================================
export interface DocumentUploadResponse {
  document_id: string;
  filename: string;
  file_size: number;
  chunk_count: number;
  processing_time: number;
  status: string;
  message: string;
}

export interface DocumentInfo {
  document_id: string;
  filename: string;
  file_size: number;
  chunk_count: number;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface SearchRequest {
  query: string;
  top_k?: number; // [1, 50], default 5
}

export interface SearchResponse {
  query: string;
  results: string;
  count: number;
}

// ============================================
// Chat
// ============================================
export interface HealthCheckResponse {
  status: string;
  message?: string;
}

export interface ChatRequest {
  message: string; // [1, 2000] characters
  bot_id?: string | null; // Bot ID for workflow execution
  session_id?: string | null;
  document_ids?: string[];
  top_k?: number; // [1, 20], default for retrieval
  include_sources?: boolean; // Whether to return sources
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface Source {
  document_id: string;
  chunk_id: string;
  content: string; // Max 500 chars
  similarity_score: number; // [0, 1]
  metadata?: {
    filename?: string;
    [key: string]: any;
  };
}

export interface ChatResponse {
  response: string;
  sources?: Source[];
  session_id: string;
  retrieved_chunks: number;
}

// ============================================
// Error Handling
// ============================================
export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

export interface APIErrorResponse {
  detail: string | HTTPValidationError;
}

// ============================================
// Bot
// ============================================
export enum BotGoal {
  CustomerSupport = 'customer-support',
  AiAssistant = 'ai-assistant',
  Sales = 'sales',
  Other = 'other',
}

export interface CreateBotRequest {
  name: string; // 1-100 characters
  goal: BotGoal;
  personality: string; // max 2000 characters
  knowledge: string[]; // document_ids
  workflow?: BackendWorkflow;
}

export interface BotResponse {
  id: string; // Format: bot_{timestamp}_{random_hex}
  name: string;
  description: string | null;
  avatar: string | null;
  status: 'active' | 'inactive' | 'training';
  messages_count: number;
  errors_count: number;
  created_at: string; // ISO 8601
  updated_at: string | null; // ISO 8601

  // 워크플로우 (백엔드 JSONB 스키마 - snake_case)
  workflow?: BackendWorkflow | null;
}