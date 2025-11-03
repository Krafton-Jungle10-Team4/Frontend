/**
 * 에러 메시지
 */
export const ERROR_MESSAGES = {
  // 인증
  AUTH: {
    GOOGLE_LOGIN_FAILED: '구글 로그인에 실패했습니다',
    UNAUTHORIZED: '로그인이 필요합니다',
    TOKEN_EXPIRED: '세션이 만료되었습니다. 다시 로그인해주세요',
    INVALID_TOKEN: '유효하지 않은 토큰입니다',
    LOGOUT_FAILED: '로그아웃에 실패했습니다',
  },

  // 네트워크
  NETWORK: {
    CONNECTION_ERROR: '네트워크 연결을 확인해주세요',
    TIMEOUT: '요청 시간이 초과되었습니다',
    SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요',
  },

  // 일반
  COMMON: {
    UNKNOWN: '알 수 없는 오류가 발생했습니다',
  },
} as const;
