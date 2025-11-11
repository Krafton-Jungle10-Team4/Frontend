/**
 * Type Guards Unit Tests
 */

import { describe, it, expect } from 'vitest';
import {
  isAsyncUploadResponse,
  isValidDocument,
  isProcessing,
  isCompleted,
  isSuccessfullyCompleted,
  isFailed,
} from '../types/type-guards';
import { DocumentStatus, DocumentWithStatus } from '../types/document.types';

describe('Type Guards', () => {
  describe('isAsyncUploadResponse', () => {
    it('should return true for valid async upload response', () => {
      const validResponse = {
        jobId: 'test-job-id',
        status: 'queued' as const,
        message: 'Upload successful',
      };

      expect(isAsyncUploadResponse(validResponse)).toBe(true);
    });

    it('should return false for invalid response', () => {
      expect(isAsyncUploadResponse(null)).toBe(false);
      expect(isAsyncUploadResponse(undefined)).toBe(false);
      expect(isAsyncUploadResponse({})).toBe(false);
      expect(isAsyncUploadResponse({ jobId: '123' })).toBe(false);
      expect(isAsyncUploadResponse({ status: 'queued' })).toBe(false);
    });

    it('should return false for wrong status', () => {
      const wrongStatus = {
        jobId: 'test-job-id',
        status: 'processing',
        message: 'Processing',
      };

      expect(isAsyncUploadResponse(wrongStatus)).toBe(false);
    });
  });

  describe('isValidDocument', () => {
    const validDocument: DocumentWithStatus = {
      documentId: 'doc-123',
      botId: 'bot-456',
      originalFilename: 'test.pdf',
      fileExtension: 'pdf',
      fileSize: 1024,
      mimeType: 'application/pdf',
      status: DocumentStatus.DONE,
      retryCount: 0,
      createdAt: '2025-01-01T00:00:00Z',
    };

    it('should return true for valid DocumentWithStatus', () => {
      expect(isValidDocument(validDocument)).toBe(true);
    });

    it('should return false for invalid documents', () => {
      expect(isValidDocument(null)).toBe(false);
      expect(isValidDocument(undefined)).toBe(false);
      expect(isValidDocument({})).toBe(false);
      expect(isValidDocument({ documentId: '123' })).toBe(false);
      expect(isValidDocument({ originalFilename: 'test.pdf' })).toBe(false);
    });

    it('should return false for wrong field types', () => {
      const wrongTypes = {
        documentId: 123, // should be string
        originalFilename: 'test.pdf',
        fileSize: 1024,
        status: DocumentStatus.DONE,
      };

      expect(isValidDocument(wrongTypes)).toBe(false);
    });

    it('should return false for invalid status', () => {
      const invalidStatus = {
        ...validDocument,
        status: 'invalid-status',
      };

      expect(isValidDocument(invalidStatus)).toBe(false);
    });
  });

  describe('isProcessing', () => {
    const queuedDoc: DocumentWithStatus = {
      documentId: 'doc-123',
      botId: 'bot-456',
      originalFilename: 'test.pdf',
      fileExtension: 'pdf',
      fileSize: 1024,
      mimeType: 'application/pdf',
      status: DocumentStatus.QUEUED,
      retryCount: 0,
      createdAt: '2025-01-01T00:00:00Z',
    };

    const processingDoc: DocumentWithStatus = {
      ...queuedDoc,
      status: DocumentStatus.PROCESSING,
    };

    const doneDoc: DocumentWithStatus = {
      ...queuedDoc,
      status: DocumentStatus.DONE,
    };

    it('should return true for QUEUED documents', () => {
      expect(isProcessing(queuedDoc)).toBe(true);
    });

    it('should return true for PROCESSING documents', () => {
      expect(isProcessing(processingDoc)).toBe(true);
    });

    it('should return false for DONE documents', () => {
      expect(isProcessing(doneDoc)).toBe(false);
    });

    it('should return false for FAILED documents', () => {
      const failedDoc = { ...queuedDoc, status: DocumentStatus.FAILED };
      expect(isProcessing(failedDoc)).toBe(false);
    });
  });

  describe('isCompleted', () => {
    const baseDoc: DocumentWithStatus = {
      documentId: 'doc-123',
      botId: 'bot-456',
      originalFilename: 'test.pdf',
      fileExtension: 'pdf',
      fileSize: 1024,
      mimeType: 'application/pdf',
      status: DocumentStatus.QUEUED,
      retryCount: 0,
      createdAt: '2025-01-01T00:00:00Z',
    };

    it('should return true for DONE documents', () => {
      const doneDoc = { ...baseDoc, status: DocumentStatus.DONE };
      expect(isCompleted(doneDoc)).toBe(true);
    });

    it('should return true for FAILED documents', () => {
      const failedDoc = { ...baseDoc, status: DocumentStatus.FAILED };
      expect(isCompleted(failedDoc)).toBe(true);
    });

    it('should return false for QUEUED documents', () => {
      expect(isCompleted(baseDoc)).toBe(false);
    });

    it('should return false for PROCESSING documents', () => {
      const processingDoc = { ...baseDoc, status: DocumentStatus.PROCESSING };
      expect(isCompleted(processingDoc)).toBe(false);
    });
  });

  describe('isSuccessfullyCompleted', () => {
    const baseDoc: DocumentWithStatus = {
      documentId: 'doc-123',
      botId: 'bot-456',
      originalFilename: 'test.pdf',
      fileExtension: 'pdf',
      fileSize: 1024,
      mimeType: 'application/pdf',
      status: DocumentStatus.QUEUED,
      retryCount: 0,
      createdAt: '2025-01-01T00:00:00Z',
    };

    it('should return true only for DONE status', () => {
      const doneDoc = { ...baseDoc, status: DocumentStatus.DONE };
      expect(isSuccessfullyCompleted(doneDoc)).toBe(true);
    });

    it('should return false for non-DONE statuses', () => {
      expect(
        isSuccessfullyCompleted({ ...baseDoc, status: DocumentStatus.QUEUED })
      ).toBe(false);
      expect(
        isSuccessfullyCompleted({
          ...baseDoc,
          status: DocumentStatus.PROCESSING,
        })
      ).toBe(false);
      expect(
        isSuccessfullyCompleted({ ...baseDoc, status: DocumentStatus.FAILED })
      ).toBe(false);
    });
  });

  describe('isFailed', () => {
    const baseDoc: DocumentWithStatus = {
      documentId: 'doc-123',
      botId: 'bot-456',
      originalFilename: 'test.pdf',
      fileExtension: 'pdf',
      fileSize: 1024,
      mimeType: 'application/pdf',
      status: DocumentStatus.QUEUED,
      retryCount: 0,
      createdAt: '2025-01-01T00:00:00Z',
    };

    it('should return true only for FAILED status', () => {
      const failedDoc = { ...baseDoc, status: DocumentStatus.FAILED };
      expect(isFailed(failedDoc)).toBe(true);
    });

    it('should return false for non-FAILED statuses', () => {
      expect(isFailed({ ...baseDoc, status: DocumentStatus.QUEUED })).toBe(
        false
      );
      expect(
        isFailed({ ...baseDoc, status: DocumentStatus.PROCESSING })
      ).toBe(false);
      expect(isFailed({ ...baseDoc, status: DocumentStatus.DONE })).toBe(
        false
      );
    });
  });
});
