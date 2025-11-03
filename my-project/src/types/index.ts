// 통합 타입 정의 파일
// 모든 타입을 중앙에서 관리

// ============= User & Auth Types =============
export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider?: 'google' | 'email';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface GoogleCredentialResponse {
  credential: string;
  clientId: string;
  select_by?: string;
}

// ============= Bot Types =============
export interface Bot {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'error';
  messagesCount: number;
  errorsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBotDTO {
  name: string;
  goal?: string;
  description?: string;
  personality?: string;
  knowledge?: string[];
}

// ============= Activity Types =============
export interface Activity {
  id: string;
  type: 'bot_created' | 'bot_deleted' | 'message_sent' | 'error_occurred';
  botId?: string;
  botName?: string;
  message?: string;
  timestamp: string; // ISO 8601 string
  details?: Record<string, any>;
}

// ============= Document Types (API) =============
export interface Document {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  metadata?: Record<string, any>;
}

export interface DocumentUploadRequest {
  file: File;
}

export interface DocumentUploadResponse {
  success: boolean;
  document: Document;
}

export interface DocumentSearchRequest {
  query: string;
  limit?: number;
  offset?: number;
}

export interface DocumentSearchResponse {
  documents: Document[];
  total: number;
}

// ============= Chat Types (API) =============
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

// ============= UI Types =============
export type Language = 'en' | 'ko';

export type ViewMode = 'grid' | 'list';

export interface UIState {
  isSidebarOpen: boolean;
  searchQuery: string;
  viewMode: ViewMode;
  language: Language;
}

// ============= Workflow Types =============
export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, any>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

// ============= API Response Types =============
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============= Form Types =============
export interface BotSetupFormData {
  step1: {
    botName: string;
  };
  step2: {
    selectedGoal: string;
    customGoal?: string;
  };
  step3: {
    descriptionSource: 'website' | 'text';
    websiteUrl?: string;
    personalityText?: string;
  };
  step4: {
    knowledgeText?: string;
    uploadedFiles?: File[];
    websiteUrls?: string[];
  };
}

// ============= Error Types =============
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Type Guards
export const isApiError = (error: any): error is ApiError => {
  return error instanceof ApiError;
};

export const isValidationError = (error: any): error is ValidationError => {
  return error instanceof ValidationError;
};

// Utility Types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
};