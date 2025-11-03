/**
 * 문서 관련 상수 정의
 */

/**
 * 문서 업로드 제약사항
 * (백엔드 app/config.py:48-49 기준)
 */
export const DOCUMENT_UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILE_SIZE_MB: 10,
  ALLOWED_EXTENSIONS: ['pdf', 'txt', 'docx'] as const,
} as const;

/**
 * 문서 처리 상태
 */
export const DOCUMENT_STATUS = {
  SUCCESS: 'success',
  PROCESSING: 'processing',
  FAILED: 'failed',
} as const;

export type DocumentStatus =
  (typeof DOCUMENT_STATUS)[keyof typeof DOCUMENT_STATUS];

/**
 * 문서 업로드 메시지
 */
export const DOCUMENT_MESSAGES = {
  SUCCESS: '문서가 성공적으로 처리되었습니다',
  UPLOADING: '문서를 업로드하는 중입니다...',
  PROCESSING: '문서를 처리하는 중입니다...',
  FAILED: '문서 업로드에 실패했습니다',
  INVALID_FILE: '유효하지 않은 파일입니다',
  FILE_TOO_LARGE: `파일 크기는 최대 ${DOCUMENT_UPLOAD.MAX_FILE_SIZE_MB}MB까지 허용됩니다`,
  INVALID_EXTENSION: `허용되는 파일 형식: ${DOCUMENT_UPLOAD.ALLOWED_EXTENSIONS.join(', ').toUpperCase()}`,
  EMPTY_FILE: '빈 파일은 업로드할 수 없습니다',
} as const;

/**
 * 문서 검색 제약사항
 */
export const DOCUMENT_SEARCH = {
  MIN_TOP_K: 1,
  MAX_TOP_K: 50,
  DEFAULT_TOP_K: 5,
} as const;
