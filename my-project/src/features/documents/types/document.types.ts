/**
 * Document Types
 * 문서 관련 타입 정의
 */

// ============================================================================
// Legacy Types (Backward Compatibility)
// ============================================================================

/**
 * @deprecated Legacy Document interface for backward compatibility
 * Use DocumentWithStatus for new code
 */
export interface Document {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  metadata?: Record<string, any>;
}

export interface DocumentUploadRequest {
  file: File;
}

export interface DocumentUploadResponse {
  success: boolean;
  document: Document;
}

export interface DocumentSearchRequest {
  query: string;
  limit?: number;
  offset?: number;
}

export interface DocumentSearchResponse {
  documents: Document[];
  total: number;
}

// ============================================================================
// Async Document Processing Types
// ============================================================================

/**
 * 문서 처리 상태
 */
export enum DocumentStatus {
  UPLOADED = 'uploaded',
  QUEUED = 'queued',
  PROCESSING = 'processing',
  DONE = 'done',
  FAILED = 'failed',
}

/**
 * 문서 타입 (Backend DB 스키마와 정렬)
 *
 * 필드명 표준:
 * - documentId (PK) - UUID 형식 문서 식별자
 * - originalFilename - 원본 파일명 (업로드 시 파일명)
 * - fileExtension - 파일 확장자 (예: 'pdf', 'txt', 'docx')
 * - fileSize - 파일 크기 (bytes)
 * - createdAt - 생성 시각 (ISO 8601)
 *
 * @see Backend: ../Backend/claudedocs/UPLOAD_EMBEDDING_SEPARATION_DESIGN.md
 */
export interface DocumentWithStatus {
  // Primary Fields (Backend DB Columns)
  documentId: string; // UUID (matches DB document_id)
  botId: string; // Foreign key to bot
  userUuid: string; // Owner user UUID (matches DB user_uuid)
  originalFilename: string; // Original file name (matches DB original_filename)
  fileExtension: string; // File extension without dot (matches DB file_extension)
  fileSize: number; // File size in bytes (matches DB file_size)
  mimeType: string; // MIME type (e.g., 'application/pdf')
  s3Uri?: string; // S3 storage location (matches DB s3_uri)

  // Status & Processing Fields
  status: DocumentStatus; // Current processing status
  errorMessage?: string; // Error details if status is FAILED
  retryCount: number; // Number of retry attempts
  chunkCount?: number; // Number of chunks after embedding
  processingTime?: number; // Processing duration in seconds
  progressPercent?: number; // Processing progress percentage (0-100)

  // Timestamps
  createdAt: string; // Creation timestamp (matches DB created_at)
  updatedAt?: string; // Last update timestamp (matches DB updated_at)
  queuedAt?: string; // When queued for processing
  processingStartedAt?: string; // When processing started (matches DB processing_started_at)
  completedAt?: string; // When processing completed (matches DB completed_at)

  // Optional metadata
  metadata?: Record<string, any>;
}

/**
 * 비동기 업로드 응답
 */
export interface AsyncDocumentUploadResponse {
  jobId: string;
  status: 'queued';
  message: string;
  estimatedTime?: number;
}

/**
 * 문서 상태 조회 응답
 */
export interface DocumentStatusResponse {
  documentId: string;
  filename: string;
  status: DocumentStatus;
  errorMessage?: string;
  chunkCount?: number;
  processingTime?: number;
  progressPercent?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

/**
 * 문서 목록 요청 파라미터
 */
export interface DocumentListRequest {
  botId?: string;
  status?: DocumentStatus;
  limit?: number;
  offset?: number;
  sortBy?: 'created_at' | 'updated_at' | 'filename';
  sortOrder?: 'asc' | 'desc';
}

/**
 * 문서 목록 응답
 *
 * @note documents 배열의 각 항목은 DocumentWithStatus 표준 스키마 준수
 *       (documentId, originalFilename, fileSize, fileExtension 필드 사용)
 */
export interface DocumentListResponse {
  documents: DocumentWithStatus[];
  total: number;
  limit: number;
  offset: number;
}
