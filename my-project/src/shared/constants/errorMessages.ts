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

  // API Key (SnapAgent)
  API_KEY: {
    INVALID: 'API 키가 유효하지 않습니다',
    MISSING: 'API 키가 필요합니다',
    EXPIRED: 'API 키가 만료되었습니다',
    UNAUTHORIZED: 'API 키 권한이 없습니다',
  },

  // 문서 관리 (SnapAgent)
  DOCUMENTS: {
    UPLOAD_FAILED: '문서 업로드에 실패했습니다',
    SEARCH_FAILED: '문서 검색에 실패했습니다',
    DELETE_FAILED: '문서 삭제에 실패했습니다',
    NOT_FOUND: '문서를 찾을 수 없습니다',
  },

  // 채팅 (SnapAgent)
  CHAT: {
    SEND_FAILED: '메시지 전송에 실패했습니다',
    MESSAGE_TOO_LONG: '메시지는 2000자를 초과할 수 없습니다',
    SESSION_ERROR: '채팅 세션 오류가 발생했습니다',
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
    VALIDATION_ERROR: '입력값을 확인해주세요',
  },
} as const;
