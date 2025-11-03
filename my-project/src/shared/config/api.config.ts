/**
 * API 설정
 */
export const API_CONFIG = {
  BASE_URL: 'https://api.snapagent.shop',
  TIMEOUT: 30000, // 30초

  ENDPOINTS: {
    // Auth
    AUTH_GOOGLE_LOGIN: '/api/v1/auth/google/login',
    AUTH_GOOGLE_CALLBACK: '/api/v1/auth/google/callback',
    AUTH_ME: '/api/v1/auth/me',
    AUTH_LOGOUT: '/api/v1/auth/logout',

    // Teams
    TEAMS_ME: '/api/v1/teams/me',
    TEAMS_API_KEYS: (teamId: number) => `/api/v1/teams/${teamId}/api-keys`,
    TEAMS_API_KEY_DELETE: (teamId: number, keyId: number) =>
      `/api/v1/teams/${teamId}/api-keys/${keyId}`,
    TEAMS_INVITES: (teamId: number) => `/api/v1/teams/${teamId}/invites`,
    TEAMS_JOIN: (token: string) => `/api/v1/teams/join/${token}`,

    // Documents
    DOCUMENTS_UPLOAD: '/api/v1/documents/upload',
    DOCUMENTS_SEARCH: '/api/v1/documents/search',
    DOCUMENT_BY_ID: (documentId: string) => `/api/v1/documents/${documentId}`,

    // Chat
    CHAT: '/api/v1/chat',
    CHAT_HEALTH: '/api/v1/chat/health',

    // Health
    HEALTH: '/health',
    API_HEALTH: '/api/v1/health',
  },
} as const;

/**
 * 로컬 스토리지 키
 */
export const STORAGE_KEYS = {
  JWT_TOKEN: 'jwt_token',
  API_KEY: 'api_key',
  USER: 'user',
  TEAM: 'team',
} as const;
