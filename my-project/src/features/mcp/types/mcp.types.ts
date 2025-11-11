/**
 * MCP 타입 정의
 */

/**
 * MCP 액션 파라미터
 */
export interface MCPActionParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  default?: string;
  options?: string[];
}

/**
 * MCP 액션
 */
export interface MCPAction {
  action_id: string;
  name: string;
  description: string;
  parameters: MCPActionParameter[];
}

/**
 * 필수 키 정보
 */
export interface RequiredKeyInfo {
  key_name: string;
  display_name: string;
  description: string;
  is_secret: boolean;
  validation_pattern: string;
}

/**
 * MCP 제공자
 */
export interface MCPProvider {
  provider_id: string;
  name: string;
  description: string | null;
  icon: string | null;
  supported_actions: MCPAction[];
  required_keys: RequiredKeyInfo[];
  config_schema: object | null;
  is_active: boolean;
}

/**
 * MCP 키 생성 요청
 */
export interface MCPKeyCreate {
  provider_id: string;
  bot_id?: string | null; // 봇 레벨 스코핑 (선택사항)
  display_name: string;
  description?: string;
  keys: Record<string, string>; // {"api_key": "AIza123..."}
}

/**
 * MCP 키 응답
 */
export interface MCPKeyResponse {
  key_id: string;
  user_id: number; // 사용자 기반 소유권 (팀 시스템 삭제됨)
  bot_id: string | null; // 봇 레벨 스코핑 (선택사항)
  provider_id: string;
  provider_name: string;
  display_name: string;
  description: string | null;
  is_active: boolean;
  keys_registered: string[]; // ["api_key", "bot_token"]
  last_used_at: string | null;
  created_at: string;
  user_email: string; // 소유자 이메일
}

/**
 * MCP 키 목록 응답
 */
export interface MCPKeyListResponse {
  total: number;
  keys: MCPKeyResponse[];
}

/**
 * MCP 에러 응답
 */
export interface MCPErrorResponse {
  error_code: string;
  message: string;
  details?: Record<string, any>;
}
