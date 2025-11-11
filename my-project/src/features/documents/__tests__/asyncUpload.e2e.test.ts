/**
 * E2E Test: Async Document Upload and Polling
 *
 * This test validates the complete async upload flow:
 * 1. Upload triggers async API call
 * 2. Job is created with queued status
 * 3. Polling mechanism starts automatically
 * 4. Status updates are reflected in store
 * 5. Polling stops when document reaches final state (done/failed)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAsyncDocumentStore } from '../stores/documentStore.async';
import { documentsAsyncApi } from '../api/documentsApi.async';
import { DocumentStatus } from '../types/document.types';

// Mock the API
vi.mock('../api/documentsApi.async');

describe.skip('E2E: Async Document Upload with Polling', () => {
  beforeEach(() => {
    // Reset store
    useAsyncDocumentStore.setState({
      documents: new Map(),
      pollingStates: new Map(),
      visibilityState: 'visible',
      filters: {},
      pagination: { limit: 50, offset: 0, total: 0 },
      selectedDocumentId: null,
      uploadProgress: 0,
      isLoading: false,
      error: null,
    });

    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Stop all polling to prevent memory leaks
    const store = useAsyncDocumentStore.getState();
    store.stopAllPolling();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it(
    'should complete full async upload lifecycle with polling',
    { timeout: 10000 },
    async () => {
      // Arrange
      const testFile = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
      });
      const testBotId = 'test-bot-123';
      const jobId = 'job-456';

      // Mock upload response
      vi.mocked(documentsAsyncApi.uploadAsync).mockResolvedValue({
        jobId,
        status: 'queued',
        message: 'Upload successful',
      });

    // Mock status progression: queued -> processing -> done
    const statusResponses = [
      {
        documentId: jobId,
        status: DocumentStatus.QUEUED,
        message: 'Queued for processing',
      },
      {
        documentId: jobId,
        status: DocumentStatus.PROCESSING,
        message: 'Processing document',
        chunkCount: 5,
      },
      {
        documentId: jobId,
        status: DocumentStatus.DONE,
        message: 'Processing complete',
        chunkCount: 10,
        processingTime: 1234,
        completedAt: new Date().toISOString(),
      },
    ];

    let statusCallCount = 0;
    vi.mocked(documentsAsyncApi.getStatus).mockImplementation(async () => {
      const response = statusResponses[statusCallCount];
      statusCallCount = Math.min(statusCallCount + 1, statusResponses.length - 1);
      return response;
    });

    // Act: Upload document
    const store = useAsyncDocumentStore.getState();
    const uploadPromise = act(async () => {
      return await store.uploadDocumentAsync(testFile, testBotId);
    });

    // Assert: Upload creates document with queued status
    await uploadPromise;
    const { documents, pollingStates } = useAsyncDocumentStore.getState();

    expect(documents.has(jobId)).toBe(true);
    const document = documents.get(jobId);
    expect(document?.status).toBe(DocumentStatus.QUEUED);
    expect(document?.originalFilename).toBe('test.pdf');

    // Assert: Polling is started
    expect(pollingStates.has(jobId)).toBe(true);

    // Act: First poll - status changes to PROCESSING
    await act(async () => {
      vi.advanceTimersByTime(5000); // POLLING_CONFIG.INTERVAL
      await vi.runAllTimersAsync();
    });

    await waitFor(() => {
      const doc = useAsyncDocumentStore.getState().documents.get(jobId);
      expect(doc?.status).toBe(DocumentStatus.PROCESSING);
    });

    const processingDoc = useAsyncDocumentStore.getState().documents.get(jobId);
    expect(processingDoc?.status).toBe(DocumentStatus.PROCESSING);
    expect(processingDoc?.chunkCount).toBe(5);

    // Assert: Polling continues
    expect(useAsyncDocumentStore.getState().pollingStates.has(jobId)).toBe(true);

    // Act: Second poll - status changes to DONE
    await act(async () => {
      vi.advanceTimersByTime(5000);
      await vi.runAllTimersAsync();
    });

    await waitFor(() => {
      const doc = useAsyncDocumentStore.getState().documents.get(jobId);
      expect(doc?.status).toBe(DocumentStatus.DONE);
    });

    const completedDoc = useAsyncDocumentStore.getState().documents.get(jobId);
    expect(completedDoc?.status).toBe(DocumentStatus.DONE);
    expect(completedDoc?.chunkCount).toBe(10);
    expect(completedDoc?.processingTime).toBe(1234);
    expect(completedDoc?.completedAt).toBeDefined();

      // Assert: Polling is stopped after completion
      await waitFor(() => {
        expect(useAsyncDocumentStore.getState().pollingStates.has(jobId)).toBe(
          false
        );
      });
    }
  );

  it(
    'should handle failed upload with polling',
    { timeout: 10000 },
    async () => {
    // Arrange
    const testFile = new File(['test content'], 'test.pdf', {
      type: 'application/pdf',
    });
    const testBotId = 'test-bot-123';
    const jobId = 'job-789';

    // Mock upload response
    vi.mocked(documentsAsyncApi.uploadAsync).mockResolvedValue({
      jobId,
      status: 'queued',
      message: 'Upload successful',
    });

    // Mock status progression: queued -> processing -> failed
    const statusResponses = [
      {
        documentId: jobId,
        status: DocumentStatus.QUEUED,
        message: 'Queued for processing',
      },
      {
        documentId: jobId,
        status: DocumentStatus.PROCESSING,
        message: 'Processing document',
      },
      {
        documentId: jobId,
        status: DocumentStatus.FAILED,
        message: 'Processing failed',
        errorMessage: 'Unsupported file format',
      },
    ];

    let statusCallCount = 0;
    vi.mocked(documentsAsyncApi.getStatus).mockImplementation(async () => {
      const response = statusResponses[statusCallCount];
      statusCallCount = Math.min(statusCallCount + 1, statusResponses.length - 1);
      return response;
    });

    // Act: Upload and poll
    const store = useAsyncDocumentStore.getState();
    await act(async () => {
      await store.uploadDocumentAsync(testFile, testBotId);
    });

    // Advance through polling cycles
    await act(async () => {
      vi.advanceTimersByTime(5000);
      await vi.runAllTimersAsync();
    });

    await act(async () => {
      vi.advanceTimersByTime(5000);
      await vi.runAllTimersAsync();
    });

    // Assert: Document failed with error message
    await waitFor(() => {
      const doc = useAsyncDocumentStore.getState().documents.get(jobId);
      expect(doc?.status).toBe(DocumentStatus.FAILED);
    });

    const failedDoc = useAsyncDocumentStore.getState().documents.get(jobId);
    expect(failedDoc?.status).toBe(DocumentStatus.FAILED);
    expect(failedDoc?.errorMessage).toBe('Unsupported file format');

      // Assert: Polling is stopped after failure
      await waitFor(() => {
        expect(useAsyncDocumentStore.getState().pollingStates.has(jobId)).toBe(
          false
        );
      });
    }
  );

  it('should support retry for failed documents', async () => {
    // Arrange
    const jobId = 'job-retry-123';

    // Add failed document to store
    useAsyncDocumentStore.setState({
      documents: new Map([
        [
          jobId,
          {
            documentId: jobId,
            botId: 'bot-123',
            userUuid: 'user-123',
            originalFilename: 'test.pdf',
            fileExtension: 'pdf',
            fileSize: 1024,
            mimeType: 'application/pdf',
            status: DocumentStatus.FAILED,
            errorMessage: 'Previous error',
            retryCount: 0,
            createdAt: new Date().toISOString(),
            metadata: {},
          },
        ],
      ]),
    });

    // Mock retry response
    vi.mocked(documentsAsyncApi.retry).mockResolvedValue({
      jobId,
      status: 'queued',
      message: 'Retry successful',
    });

    // Mock status for retry
    vi.mocked(documentsAsyncApi.getStatus).mockResolvedValue({
      documentId: jobId,
      status: DocumentStatus.QUEUED,
      message: 'Queued for retry',
    });

    // Act: Retry failed document
    const store = useAsyncDocumentStore.getState();
    await act(async () => {
      await store.retryDocument(jobId);
    });

    // Assert: Document status reset to queued
    const retriedDoc = useAsyncDocumentStore.getState().documents.get(jobId);
    expect(retriedDoc?.status).toBe(DocumentStatus.QUEUED);
    expect(retriedDoc?.errorMessage).toBeUndefined();
    expect(retriedDoc?.retryCount).toBe(1);

    // Assert: Polling restarted
    expect(useAsyncDocumentStore.getState().pollingStates.has(jobId)).toBe(true);
  });

  it(
    'should adjust polling interval based on visibility state',
    { timeout: 10000 },
    async () => {
    // Arrange
    const testFile = new File(['test'], 'test.pdf', {
      type: 'application/pdf',
    });
    const jobId = 'job-visibility-123';

    vi.mocked(documentsAsyncApi.uploadAsync).mockResolvedValue({
      jobId,
      status: 'queued',
      message: 'Upload successful',
    });

    vi.mocked(documentsAsyncApi.getStatus).mockResolvedValue({
      documentId: jobId,
      status: DocumentStatus.PROCESSING,
      message: 'Processing',
    });

    // Act: Upload document
    const store = useAsyncDocumentStore.getState();
    await act(async () => {
      await store.uploadDocumentAsync(testFile, 'bot-123');
    });

    // Assert: Polling started with visible interval
    expect(useAsyncDocumentStore.getState().pollingStates.has(jobId)).toBe(true);

    // Act: Change visibility to hidden
    act(() => {
      store.setVisibilityState('hidden');
    });

      // Assert: Polling interval adjusted (implementation restarts with new interval)
      // The polling state should be recreated with new interval
      await waitFor(() => {
        expect(useAsyncDocumentStore.getState().pollingStates.has(jobId)).toBe(
          true
        );
      });
    }
  );
});
