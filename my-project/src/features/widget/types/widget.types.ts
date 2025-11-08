/**
 * Widget 관련 타입 정의
 */

/**
 * Widget Config API 응답
 */
export interface WidgetConfigResponse {
  config: WidgetConfig;
  signature: string;
  expires_at: string;
  nonce: string;
  widget_key?: string;
}

export interface WidgetConfig {
  bot_id: string;
  bot_name: string;
  avatar_url: string | null;
  theme: 'light' | 'dark' | 'auto';
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  welcome_message: string;
  placeholder_text: string;
  primary_color: string;
  show_typing_indicator: boolean;
  auto_open: boolean;
  auto_open_delay: number;
  enable_file_upload: boolean;
  max_file_size_mb: number;
  allowed_file_types: string[];
  enable_feedback: boolean;
  enable_sound: boolean;
  save_conversation: boolean;
  conversation_storage: 'localStorage' | 'sessionStorage';
  features: WidgetFeatures;
  api_endpoints: WidgetApiEndpoints;
}

export interface WidgetFeatures {
  file_upload: boolean;
  voice_input: boolean;
  feedback: boolean;
  save_conversation: boolean;
}

export interface WidgetApiEndpoints {
  session: string;
  chat: string;
  feedback: string;
  track: string;
}

/**
 * Widget Signature Data
 */
export interface WidgetSignatureData {
  signature: string;
  expires_at: string;
  nonce: string;
  widget_key: string;
}

/**
 * Session Create Request
 */
export interface SessionCreateRequest {
  widget_key: string;
  widget_signature: WidgetSignatureData;
  user_info?: UserInfo | null;
  fingerprint: BrowserFingerprint;
  context: PageContext;
}

export interface UserInfo {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface BrowserFingerprint {
  user_agent: string;
  screen_resolution: string;
  timezone: string;
  language: string;
  platform: string;
}

export interface PageContext {
  page_url: string;
  page_title: string;
  referrer: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
}

/**
 * Session Create Response
 */
export interface SessionCreateResponse {
  session_id: string;
  session_token: string;
  refresh_token: string;
  expires_at: string;
  ws_url: string;
  ws_protocols: string[];
  features_enabled: WidgetFeatures;
}

/**
 * Widget Chat Request
 */
export interface WidgetChatRequest {
  session_id: string;
  message: {
    content: string;
    type: 'text';
    attachments?: unknown[];
  };
  context: {
    page_url?: string;
    user_agent?: string;
    timestamp?: string;
  };
}

/**
 * Widget Chat Response
 */
export interface WidgetChatResponse {
  message_id: string;
  response: {
    content: string;
    type: 'text';
    metadata?: {
      confidence?: number;
    };
  };
  sources: WidgetSource[];
  suggested_actions: unknown[];
  timestamp: string;
}

export interface WidgetSource {
  document_id: string;
  title: string;
  snippet: string;
  relevance_score: number;
}

/**
 * Widget Message (UI용)
 */
export interface WidgetMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: WidgetSource[];
}
