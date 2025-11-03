/**
 * API 공통 타입 정의
 */

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
export interface ChatRequest {
  message: string; // [1, 2000] characters
  session_id?: string | null;
  top_k?: number; // [1, 20], default for retrieval
  include_sources?: boolean; // Whether to return sources
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
