/**
 * Async Document Store Unit Tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useAsyncDocumentStore } from '../stores/documentStore.async';
import { documentsAsyncApi } from '../api/documentsApi.async';
import { DocumentStatus } from '../types/document.types';

// Mock the APIs
vi.mock('../api/documentsApi.async');

const mockResponse = {
  documents: [],
  total: 0,
  limit: 50,
  offset: 0,
};

describe('AsyncDocumentStore - fetchDocuments', () => {
  beforeEach(() => {
    useAsyncDocumentStore.setState({
      documents: new Map(),
      pollingStates: new Map(),
      visibilityState: 'visible',
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
    });

    vi.mocked(documentsAsyncApi.listWithStatus).mockResolvedValue(mockResponse);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('merges filters, request overrides, and pagination defaults', async () => {
    useAsyncDocumentStore.setState({
      filters: { status: DocumentStatus.DONE, searchQuery: 'plan' },
      pagination: { limit: 20, offset: 0, total: 0 },
    });

    const store = useAsyncDocumentStore.getState();
    await store.fetchDocuments();

    expect(documentsAsyncApi.listWithStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        status: DocumentStatus.DONE,
        searchQuery: 'plan',
        limit: 20,
        offset: 0,
      })
    );
  });

  it('allows request parameters to override filters and pagination', async () => {
    useAsyncDocumentStore.setState({
      filters: { status: DocumentStatus.QUEUED, searchQuery: 'draft' },
      pagination: { limit: 20, offset: 10, total: 0 },
    });

    const store = useAsyncDocumentStore.getState();
    await store.fetchDocuments({
      status: DocumentStatus.PROCESSING,
      searchQuery: 'ready',
      limit: 5,
      offset: 100,
    });

    expect(documentsAsyncApi.listWithStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        status: DocumentStatus.PROCESSING,
        searchQuery: 'ready',
        limit: 5,
        offset: 100,
      })
    );
  });
});
