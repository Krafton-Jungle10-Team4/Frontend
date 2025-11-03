/**
 * API 엔드포인트 상수
 */
export const API_ENDPOINTS = {
  // 인증
  AUTH: {
    GOOGLE_LOGIN: '/auth/google', // 구글 로그인
    LOGOUT: '/auth/logout', // 로그아웃
    REFRESH: '/auth/refresh', // 토큰 갱신
    ME: '/auth/me', // 현재 사용자 정보 조회
  },

  // 사용자
  USERS: {
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },
} as const;
