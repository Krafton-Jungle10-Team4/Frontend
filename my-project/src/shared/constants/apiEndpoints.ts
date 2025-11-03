/**
 * API 엔드포인트 상수
 */

// SnapAgent API Base URL
export const API_BASE_URL = 'https://api.snapagent.shop';
export const API_TIMEOUT = 30000; // 30초

export const API_ENDPOINTS = {
  // 인증 (SnapAgent API)
  AUTH: {
    GOOGLE_LOGIN: '/api/v1/auth/google/login',
    GOOGLE_CALLBACK: '/api/v1/auth/google/callback',
    ME: '/api/v1/auth/me',
    LOGOUT: '/api/v1/auth/logout',
  },

  // 팀 관리 (SnapAgent API)
  TEAMS: {
    ME: '/api/v1/teams/me',
    API_KEYS: (teamId: number) => `/api/v1/teams/${teamId}/api-keys`,
    API_KEY_DELETE: (teamId: number, keyId: number) =>
      `/api/v1/teams/${teamId}/api-keys/${keyId}`,
    INVITES: (teamId: number) => `/api/v1/teams/${teamId}/invites`,
    JOIN: (token: string) => `/api/v1/teams/join/${token}`,
  },

  // 문서 관리 (SnapAgent API)
  DOCUMENTS: {
    UPLOAD: '/api/v1/documents/upload',
    SEARCH: '/api/v1/documents/search',
    BY_ID: (documentId: string) => `/api/v1/documents/${documentId}`,
  },

  // 채팅 (SnapAgent API)
  CHAT: {
    SEND: '/api/v1/chat',
    HEALTH: '/api/v1/chat/health',
  },

  // 헬스 체크 (SnapAgent API)
  HEALTH: {
    ROOT: '/health',
    API: '/api/v1/health',
  },

  // 레거시 (호환성 유지)
  USERS: {
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },
} as const;
