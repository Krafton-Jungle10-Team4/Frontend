/**
 * Document Types
 * 문서 관련 타입 정의
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
