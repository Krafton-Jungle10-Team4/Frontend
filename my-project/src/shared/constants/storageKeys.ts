/**
 * LocalStorage 키
 */
export const STORAGE_KEYS = {
  // JWT 인증 (SnapAgent API)
  JWT_TOKEN: 'jwt_token',
  USER: 'user',
  TEAM: 'team',
  API_KEY: 'api_key',

  // 레거시 (호환성 유지)
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_INFO: 'userInfo',
} as const;
