/**
 * Activity Types
 * 활동 관련 타입 정의
 */

export interface Activity {
  id: string;
  type?: 'bot_created' | 'bot_deleted' | 'message_sent' | 'error_occurred';
  user?: string;
  action?: string;
  botId?: string;
  botName?: string;
  message?: string;
  timestamp: string; // ISO 8601 string
  details?: Record<string, any>;
}
