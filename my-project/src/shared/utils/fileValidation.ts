/**
 * 파일 유효성 검증 유틸리티
 */

// 파일 제약사항 (app/config.py:48-49 기준)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['pdf', 'txt', 'docx'] as const;

export type AllowedExtension = (typeof ALLOWED_EXTENSIONS)[number];

export interface FileValidationError {
  isValid: false;
  error: string;
}

export interface FileValidationSuccess {
  isValid: true;
  extension: AllowedExtension;
}

export type FileValidationResult = FileValidationError | FileValidationSuccess;

/**
 * 파일 확장자 추출
 */
export const getFileExtension = (filename: string): string | null => {
  const parts = filename.split('.');
  if (parts.length < 2) return null;
  return parts[parts.length - 1].toLowerCase();
};

/**
 * 파일 크기를 읽기 쉬운 형식으로 변환
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * 파일 유효성 검증
 *
 * 검증 사항:
 * 1. 파일 크기: 최대 10MB
 * 2. 파일 확장자: PDF, TXT, DOCX
 * 3. 빈 파일 체크
 *
 * @param file 검증할 파일
 * @returns FileValidationResult
 */
export const validateFile = (file: File): FileValidationResult => {
  // 1. 빈 파일 체크
  if (file.size === 0) {
    return {
      isValid: false,
      error: '빈 파일은 업로드할 수 없습니다.',
    };
  }

  // 2. 파일 크기 검증
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `파일 크기는 최대 ${formatFileSize(MAX_FILE_SIZE)}까지 허용됩니다. (현재: ${formatFileSize(file.size)})`,
    };
  }

  // 3. 파일 확장자 검증
  const extension = getFileExtension(file.name);
  if (!extension) {
    return {
      isValid: false,
      error: '파일 확장자를 확인할 수 없습니다.',
    };
  }

  if (!ALLOWED_EXTENSIONS.includes(extension as AllowedExtension)) {
    return {
      isValid: false,
      error: `허용되지 않는 파일 형식입니다. 허용 형식: ${ALLOWED_EXTENSIONS.join(', ').toUpperCase()}`,
    };
  }

  return {
    isValid: true,
    extension: extension as AllowedExtension,
  };
};

/**
 * 파일 확장자가 허용되는지 확인
 */
export const isAllowedExtension = (extension: string): boolean => {
  return ALLOWED_EXTENSIONS.includes(
    extension.toLowerCase() as AllowedExtension
  );
};

/**
 * 파일 크기가 허용 범위 내인지 확인
 */
export const isFileSizeValid = (size: number): boolean => {
  return size > 0 && size <= MAX_FILE_SIZE;
};

/**
 * 파일 유효성 검증 상수 export
 */
export const FILE_VALIDATION = {
  MAX_FILE_SIZE,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE_MB: MAX_FILE_SIZE / (1024 * 1024),
} as const;
