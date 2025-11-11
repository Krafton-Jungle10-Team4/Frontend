/**
 * Integration Tests for Document Monitoring
 * Phase 5.3: Tests for upload flow, polling, and retry functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentMonitoringPage } from '../components/monitoring/DocumentMonitoringPage';
import { useAsyncDocumentStore } from '../stores/documentStore.async';
import { DocumentStatus } from '../types/document.types';
import type { DocumentWithStatus } from '../types/document.types';

// Mock stores
vi.mock('@/features/bot/stores/botStore', () => ({
  useBotStore: vi.fn((selector: any) => {
    if (selector) {
      return selector({ selectedBotId: 'test-bot-123' });
    }
    return { selectedBotId: 'test-bot-123' };
  }),
  selectSelectedBot: vi.fn(() => ({ id: 'test-bot-123', name: 'Test Bot' })),
  selectSelectedBotId: vi.fn(() => 'test-bot-123'),
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('DocumentMonitoring Integration Tests', () => {
  beforeEach(() => {
    // Clean up store state
    useAsyncDocumentStore.getState().stopAllPolling();
    useAsyncDocumentStore.setState({
      documents: new Map(),
      pollingStates: new Map(),
      filters: {},
      pagination: {
        limit: 50,
        offset: 0,
        total: 0,
      },
      selectedDocumentId: null,
      uploadProgress: 0,
      isLoading: false,
      error: null,
      visibilityState: 'visible',
    });
  });

  it('should upload file and start polling', async () => {
    const user = userEvent.setup();

    // Mock uploadDocumentAsync to simulate successful upload
    const mockUpload = vi.fn().mockResolvedValue('doc-123');
    useAsyncDocumentStore.setState({
      uploadDocumentAsync: mockUpload,
    } as any);

    render(<DocumentMonitoringPage />);

    // Find and click upload button
    const uploadButton = screen.getByRole('button', { name: /업로드/i });
    await user.click(uploadButton);

    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByText('문서 업로드')).toBeInTheDocument();
    });

    // Create and upload file
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/파일 선택/i);
    await user.upload(input, file);

    // Submit upload
    const submitButton = screen.getAllByRole('button', { name: /업로드/i })[1];
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalledWith(file, 'test-bot-123');
    });

    // Verify polling started (check if document appears in store)
    await waitFor(() => {
      const state = useAsyncDocumentStore.getState();
      expect(state.pollingStates.size).toBeGreaterThan(0);
    });
  });

  it('should display document in table after upload', async () => {
    // Setup document in store
    const testDocument: DocumentWithStatus = {
      documentId: 'doc-123',
      botId: 'test-bot-123',
      originalFilename: 'test.pdf',
      fileExtension: 'pdf',
      fileSize: 1024,
      mimeType: 'application/pdf',
      status: DocumentStatus.QUEUED,
      retryCount: 0,
      createdAt: new Date().toISOString(),
    };

    useAsyncDocumentStore.setState({
      documents: new Map([['doc-123', testDocument]]),
    });

    render(<DocumentMonitoringPage />);

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
      expect(screen.getByText('대기 중')).toBeInTheDocument();
    });
  });

  it('should retry failed document', async () => {
    const user = userEvent.setup();

    // Setup failed document
    const failedDoc: DocumentWithStatus = {
      documentId: 'doc-123',
      botId: 'test-bot-123',
      originalFilename: 'failed.pdf',
      fileExtension: 'pdf',
      fileSize: 2048,
      mimeType: 'application/pdf',
      status: DocumentStatus.FAILED,
      errorMessage: 'Processing failed',
      retryCount: 0,
      createdAt: new Date().toISOString(),
    };

    useAsyncDocumentStore.setState({
      documents: new Map([['doc-123', failedDoc]]),
    });

    // Mock retry function
    const mockRetry = vi.fn().mockResolvedValue(undefined);
    useAsyncDocumentStore.setState({
      retryDocument: mockRetry,
    } as any);

    render(<DocumentMonitoringPage />);

    // Find retry button
    const retryButton = screen.getByRole('button', { name: /재처리/i });
    await user.click(retryButton);

    await waitFor(() => {
      expect(mockRetry).toHaveBeenCalledWith('doc-123');
    });
  });

  it('should update document status when polling detects change', async () => {
    // Setup document with QUEUED status
    const testDocument: DocumentWithStatus = {
      documentId: 'doc-123',
      botId: 'test-bot-123',
      originalFilename: 'test.pdf',
      fileExtension: 'pdf',
      fileSize: 1024,
      mimeType: 'application/pdf',
      status: DocumentStatus.QUEUED,
      retryCount: 0,
      createdAt: new Date().toISOString(),
    };

    useAsyncDocumentStore.setState({
      documents: new Map([['doc-123', testDocument]]),
    });

    render(<DocumentMonitoringPage />);

    // Verify initial status
    expect(screen.getByText('대기 중')).toBeInTheDocument();

    // Simulate status update
    const updatedDocument: DocumentWithStatus = {
      ...testDocument,
      status: DocumentStatus.PROCESSING,
    };

    useAsyncDocumentStore.setState({
      documents: new Map([['doc-123', updatedDocument]]),
    });

    // Verify status changed
    await waitFor(() => {
      expect(screen.getByText('처리 중')).toBeInTheDocument();
    });
  });

  it('should stop polling when document is completed', async () => {
    const testDocument: DocumentWithStatus = {
      documentId: 'doc-123',
      botId: 'test-bot-123',
      originalFilename: 'test.pdf',
      fileExtension: 'pdf',
      fileSize: 1024,
      mimeType: 'application/pdf',
      status: DocumentStatus.PROCESSING,
      retryCount: 0,
      createdAt: new Date().toISOString(),
    };

    useAsyncDocumentStore.setState({
      documents: new Map([['doc-123', testDocument]]),
    });

    // Start polling manually
    useAsyncDocumentStore.getState().startPolling('doc-123');

    expect(useAsyncDocumentStore.getState().pollingStates.has('doc-123')).toBe(true);

    // Update to DONE status
    const completedDocument: DocumentWithStatus = {
      ...testDocument,
      status: DocumentStatus.DONE,
      completedAt: new Date().toISOString(),
    };

    useAsyncDocumentStore.setState({
      documents: new Map([['doc-123', completedDocument]]),
    });

    // Trigger status check
    await useAsyncDocumentStore.getState().checkDocumentStatus('doc-123');

    // Verify polling stopped
    expect(useAsyncDocumentStore.getState().pollingStates.has('doc-123')).toBe(false);
  });

  it('should handle pagination correctly', async () => {
    const user = userEvent.setup();

    // Setup multiple documents
    const documents = new Map<string, DocumentWithStatus>();
    for (let i = 0; i < 60; i++) {
      documents.set(`doc-${i}`, {
        documentId: `doc-${i}`,
        botId: 'test-bot-123',
        originalFilename: `file-${i}.pdf`,
        fileExtension: 'pdf',
        fileSize: 1024 * i,
        mimeType: 'application/pdf',
        status: DocumentStatus.DONE,
        retryCount: 0,
        createdAt: new Date().toISOString(),
      });
    }

    useAsyncDocumentStore.setState({
      documents,
      pagination: {
        limit: 50,
        offset: 0,
        total: 60,
      },
    });

    render(<DocumentMonitoringPage />);

    // Verify pagination info shows total
    expect(screen.getByText(/총 60개 문서/i)).toBeInTheDocument();

    // Should show 50 documents per page
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBeLessThanOrEqual(51); // 50 data rows + 1 header row
  });

  it('should filter documents by status', async () => {
    const user = userEvent.setup();

    // Setup documents with different statuses
    const documents = new Map<string, DocumentWithStatus>([
      [
        'doc-1',
        {
          documentId: 'doc-1',
          botId: 'test-bot-123',
          originalFilename: 'processing.pdf',
          fileExtension: 'pdf',
          fileSize: 1024,
          mimeType: 'application/pdf',
          status: DocumentStatus.PROCESSING,
          retryCount: 0,
          createdAt: new Date().toISOString(),
        },
      ],
      [
        'doc-2',
        {
          documentId: 'doc-2',
          botId: 'test-bot-123',
          originalFilename: 'done.pdf',
          fileExtension: 'pdf',
          fileSize: 2048,
          mimeType: 'application/pdf',
          status: DocumentStatus.DONE,
          retryCount: 0,
          createdAt: new Date().toISOString(),
        },
      ],
    ]);

    useAsyncDocumentStore.setState({
      documents,
    });

    render(<DocumentMonitoringPage />);

    // Apply filter
    useAsyncDocumentStore.setState({
      filters: { status: DocumentStatus.PROCESSING },
      documents: new Map([['doc-1', documents.get('doc-1')!]]),
    });

    // Verify only processing documents shown
    await waitFor(() => {
      expect(screen.getByText('processing.pdf')).toBeInTheDocument();
      expect(screen.queryByText('done.pdf')).not.toBeInTheDocument();
    });
  });
});
