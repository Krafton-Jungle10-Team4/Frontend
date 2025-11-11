/**
 * Type Guard Functions
 * Runtime type validation for document types
 */

import {
  DocumentStatus,
  DocumentWithStatus,
  AsyncDocumentUploadResponse,
} from './document.types';

/**
 * 응답이 비동기 업로드 응답인지 확인
 */
export function isAsyncUploadResponse(
  response: any
): response is AsyncDocumentUploadResponse {
  if (!response || typeof response !== 'object') {
    return false;
  }
  return 'jobId' in response && response.status === 'queued';
}

/**
 * 문서가 유효한 DocumentWithStatus 객체인지 확인
 */
export function isValidDocument(doc: any): doc is DocumentWithStatus {
  if (!doc || typeof doc !== 'object') {
    return false;
  }
  return (
    'documentId' in doc &&
    typeof doc.documentId === 'string' &&
    'originalFilename' in doc &&
    typeof doc.originalFilename === 'string' &&
    'fileSize' in doc &&
    typeof doc.fileSize === 'number' &&
    'status' in doc &&
    Object.values(DocumentStatus).includes(doc.status)
  );
}

/**
 * 문서가 처리 중인지 확인
 */
export function isProcessing(doc: DocumentWithStatus): boolean {
  return (
    doc.status === DocumentStatus.QUEUED ||
    doc.status === DocumentStatus.PROCESSING
  );
}

/**
 * 문서 처리가 완료되었는지 확인 (성공 또는 실패)
 */
export function isCompleted(doc: DocumentWithStatus): boolean {
  return (
    doc.status === DocumentStatus.DONE || doc.status === DocumentStatus.FAILED
  );
}

/**
 * 문서 처리가 성공적으로 완료되었는지 확인
 */
export function isSuccessfullyCompleted(doc: DocumentWithStatus): boolean {
  return doc.status === DocumentStatus.DONE;
}

/**
 * 문서 처리가 실패했는지 확인
 */
export function isFailed(doc: DocumentWithStatus): boolean {
  return doc.status === DocumentStatus.FAILED;
}
