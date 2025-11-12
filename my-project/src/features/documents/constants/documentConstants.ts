/**
 * 문서 관련 상수 정의
 */

import { DocumentStatus } from '../types/document.types';

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
 * 문서 처리 상태 (Legacy)
 * @deprecated Use DocumentStatus enum from document.types.ts
 */
export const DOCUMENT_STATUS = {
  SUCCESS: 'success',
  PROCESSING: 'processing',
  FAILED: 'failed',
} as const;

export type DocumentStatusLegacy =
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

// ============================================================================
// Async Document Processing Constants
// ============================================================================

/**
 * 폴링 설정
 */
export const POLLING_CONFIG = {
  INTERVAL: 5000, // 5초 간격
  MAX_RETRIES: 120, // 최대 10분 (5초 * 120)
  BACKGROUND_INTERVAL: 10000, // 백그라운드 탭: 10초
  ERROR_RETRY_DELAY: 15000, // 에러 발생 시 15초 대기
} as const;

/**
 * 문서 상태별 UI 설정
 */
export const DOCUMENT_STATUS_CONFIG = {
  [DocumentStatus.UPLOADED]: {
    label: '업로드됨',
    color: 'secondary',
    icon: '○',
    animated: false,
  },
  [DocumentStatus.QUEUED]: {
    label: '대기 중',
    color: 'default',
    icon: '○',
    animated: false,
  },
  [DocumentStatus.PROCESSING]: {
    label: '처리 중',
    color: 'default',
    icon: '⊙',
    animated: true,
  },
  [DocumentStatus.DONE]: {
    label: '완료',
    color: 'default',
    icon: '●',
    animated: false,
  },
  [DocumentStatus.FAILED]: {
    label: '실패',
    color: 'destructive',
    icon: '✕',
    animated: false,
  },
} as const;

/**
 * 페이지네이션 설정
 */
export const PAGINATION_CONFIG = {
  DEFAULT_LIMIT: 50,
  LIMITS: [10, 25, 50, 100],
} as const;

/**
 * 파일 업로드 제약
 */
export const FILE_CONSTRAINTS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_EXTENSIONS: ['pdf', 'txt', 'docx'],
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
} as const;
