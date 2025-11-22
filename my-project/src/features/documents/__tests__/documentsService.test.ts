/**
 * Documents Service Unit Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { documentsService } from '../services/documentsService';
import { documentsApi } from '../api/documentsApi';
import { documentsAsyncApi } from '../api/documentsApi.async';
import { ApiClient } from '@/shared/utils/api';

// Mock the APIs
vi.mock('../api/documentsApi');
vi.mock('../api/documentsApi.async');
vi.mock('@/shared/utils/api');

describe('DocumentsService - Authenticated Delete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('deleteDocument', () => {
    it('should use documentsApi.deleteDocument with authenticated client', async () => {
      // Arrange
      const documentId = 'test-doc-id';

      vi.mocked(documentsApi.deleteDocument).mockResolvedValue(undefined);

      // Act
      await documentsService.deleteDocument(documentId);

      // Assert: Should call documentsApi.deleteDocument (authenticated)
      expect(documentsApi.deleteDocument).toHaveBeenCalledWith(documentId);
      expect(documentsApi.deleteDocument).toHaveBeenCalledTimes(1);
    });

    it('should NOT use legacy ApiClient.deleteFile', async () => {
      // Arrange
      const documentId = 'test-doc-id';

      vi.mocked(documentsApi.deleteDocument).mockResolvedValue(undefined);

      // Act
      await documentsService.deleteDocument(documentId);

      // Assert: Legacy ApiClient should NOT be called
      expect(ApiClient.deleteFile).not.toHaveBeenCalled();
    });

    it('should propagate errors from documentsApi.deleteDocument', async () => {
      // Arrange
      const documentId = 'test-doc-id';
      const error = new Error('Delete failed');

      vi.mocked(documentsApi.deleteDocument).mockRejectedValue(error);

      // Act & Assert
      await expect(
        documentsService.deleteDocument(documentId)
      ).rejects.toThrow('Delete failed');
    });

    it('should pass correct parameters to documentsApi.deleteDocument', async () => {
      // Arrange
      const documentId = 'doc-123';

      vi.mocked(documentsApi.deleteDocument).mockResolvedValue(undefined);

      // Act
      await documentsService.deleteDocument(documentId);

      // Assert: Parameters should be passed in correct order
      expect(documentsApi.deleteDocument).toHaveBeenCalledWith('doc-123');
    });
  });

  describe('uploadDocument - Feature Flag Integration', () => {
    it('should use documentsAsyncApi when feature flag is enabled', async () => {
      // Arrange
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const botId = 'test-bot-id';
      const mockResponse = {
        jobId: 'job-123',
        status: 'queued' as const,
        message: 'Upload successful',
      };

      // Mock feature flag
      vi.stubEnv('VITE_ENABLE_ASYNC_UPLOAD', 'true');
      vi.mocked(documentsAsyncApi.uploadAsync).mockResolvedValue(mockResponse);

      // Act
      const result = await documentsService.uploadDocument(file, botId);

      // Assert
      expect(documentsAsyncApi.uploadAsync).toHaveBeenCalledWith(
        file,
        botId,
        undefined
      );
      expect(result).toEqual(mockResponse);
    });

    it('should use legacy ApiClient when feature flag is disabled', async () => {
      // Arrange
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const botId = 'test-bot-id';
      const mockResponse = {
        document_id: 'doc-123',
        filename: 'test.pdf',
        file_size: 1024,
        chunk_count: 5,
        processing_time: 123,
        status: 'done',
        message: 'Processing complete',
      };

      // Mock feature flag
      vi.stubEnv('VITE_ENABLE_ASYNC_UPLOAD', 'false');
      vi.mocked(ApiClient.uploadFile).mockResolvedValue(mockResponse);

      // Act
      const result = await documentsService.uploadDocument(file, botId);

      // Assert
      expect(ApiClient.uploadFile).toHaveBeenCalledWith(file, botId);
      expect(result).toEqual(mockResponse);
    });
  });
});
