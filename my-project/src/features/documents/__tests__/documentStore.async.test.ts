/**
 * Async Document Store Unit Tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useAsyncDocumentStore } from '../stores/documentStore.async';
import { useBotStore } from '@features/bot/stores/botStore';
import { documentsAsyncApi } from '../api/documentsApi.async';

// Mock the APIs
vi.mock('../api/documentsApi.async');
vi.mock('@features/bot/stores/botStore', () => ({
  useBotStore: {
    getState: vi.fn(),
  },
}));

describe('AsyncDocumentStore - botId Guard', () => {
  beforeEach(() => {
    // Reset store state before each test
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

    // Mock useBotStore.getState()
    vi.mocked(useBotStore.getState).mockReturnValue({
      bots: [],
      selectedBotId: null,
      loading: false,
      error: null,
      addBot: vi.fn(),
      updateBot: vi.fn(),
      deleteBot: vi.fn(),
      setBots: vi.fn(),
      selectBot: vi.fn(),
      setSelectedBotId: vi.fn(),
      getBotById: vi.fn(),
      clearBots: vi.fn(),
      reset: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchDocuments - botId validation', () => {
    it('should throw error when botId is not provided in request, filters, or botStore', async () => {
      // Arrange: No botId anywhere
      const store = useAsyncDocumentStore.getState();

      // Act & Assert
      await expect(store.fetchDocuments()).rejects.toThrow(
        'botId is required for fetching documents'
      );

      // Verify error state is set
      expect(useAsyncDocumentStore.getState().error).toBeTruthy();
      expect(useAsyncDocumentStore.getState().error?.message).toContain(
        'botId is required'
      );
      expect(useAsyncDocumentStore.getState().isLoading).toBe(false);
    });

    it('should use botId from request parameter when provided', async () => {
      // Arrange
      const mockResponse = {
        documents: [],
        total: 0,
        limit: 50,
        offset: 0,
      };
      vi.mocked(documentsAsyncApi.listWithStatus).mockResolvedValue(
        mockResponse
      );

      const store = useAsyncDocumentStore.getState();

      // Act
      await store.fetchDocuments({ botId: 'request-bot-id' });

      // Assert
      expect(documentsAsyncApi.listWithStatus).toHaveBeenCalledWith(
        expect.objectContaining({
          botId: 'request-bot-id',
        })
      );
    });

    it('should fallback to filters.botId when request.botId is not provided', async () => {
      // Arrange
      const mockResponse = {
        documents: [],
        total: 0,
        limit: 50,
        offset: 0,
      };
      vi.mocked(documentsAsyncApi.listWithStatus).mockResolvedValue(
        mockResponse
      );

      // Set filters.botId
      useAsyncDocumentStore.setState({
        filters: { botId: 'filter-bot-id' },
      });

      const store = useAsyncDocumentStore.getState();

      // Act
      await store.fetchDocuments();

      // Assert
      expect(documentsAsyncApi.listWithStatus).toHaveBeenCalledWith(
        expect.objectContaining({
          botId: 'filter-bot-id',
        })
      );
    });

    it('should fallback to useBotStore.selectedBotId when request and filters have no botId', async () => {
      // Arrange
      const mockResponse = {
        documents: [],
        total: 0,
        limit: 50,
        offset: 0,
      };
      vi.mocked(documentsAsyncApi.listWithStatus).mockResolvedValue(
        mockResponse
      );

      // Mock botStore.selectedBotId
      vi.mocked(useBotStore.getState).mockReturnValue({
        bots: [],
        selectedBotId: 'store-bot-id',
        loading: false,
        error: null,
        addBot: vi.fn(),
        updateBot: vi.fn(),
        deleteBot: vi.fn(),
        setBots: vi.fn(),
        selectBot: vi.fn(),
        setSelectedBotId: vi.fn(),
        getBotById: vi.fn(),
        clearBots: vi.fn(),
        reset: vi.fn(),
        setLoading: vi.fn(),
        setError: vi.fn(),
      });

      const store = useAsyncDocumentStore.getState();

      // Act
      await store.fetchDocuments();

      // Assert
      expect(documentsAsyncApi.listWithStatus).toHaveBeenCalledWith(
        expect.objectContaining({
          botId: 'store-bot-id',
        })
      );
    });

    it('should prioritize request.botId over filters.botId', async () => {
      // Arrange
      const mockResponse = {
        documents: [],
        total: 0,
        limit: 50,
        offset: 0,
      };
      vi.mocked(documentsAsyncApi.listWithStatus).mockResolvedValue(
        mockResponse
      );

      // Set filters.botId
      useAsyncDocumentStore.setState({
        filters: { botId: 'filter-bot-id' },
      });

      const store = useAsyncDocumentStore.getState();

      // Act
      await store.fetchDocuments({ botId: 'request-bot-id' });

      // Assert
      expect(documentsAsyncApi.listWithStatus).toHaveBeenCalledWith(
        expect.objectContaining({
          botId: 'request-bot-id',
        })
      );
    });

    it('should prioritize filters.botId over useBotStore.selectedBotId', async () => {
      // Arrange
      const mockResponse = {
        documents: [],
        total: 0,
        limit: 50,
        offset: 0,
      };
      vi.mocked(documentsAsyncApi.listWithStatus).mockResolvedValue(
        mockResponse
      );

      // Set filters.botId
      useAsyncDocumentStore.setState({
        filters: { botId: 'filter-bot-id' },
      });

      // Mock botStore.selectedBotId
      vi.mocked(useBotStore.getState).mockReturnValue({
        bots: [],
        selectedBotId: 'store-bot-id',
        loading: false,
        error: null,
        addBot: vi.fn(),
        updateBot: vi.fn(),
        deleteBot: vi.fn(),
        setBots: vi.fn(),
        selectBot: vi.fn(),
        setSelectedBotId: vi.fn(),
        getBotById: vi.fn(),
        clearBots: vi.fn(),
        reset: vi.fn(),
        setLoading: vi.fn(),
        setError: vi.fn(),
      });

      const store = useAsyncDocumentStore.getState();

      // Act
      await store.fetchDocuments();

      // Assert
      expect(documentsAsyncApi.listWithStatus).toHaveBeenCalledWith(
        expect.objectContaining({
          botId: 'filter-bot-id',
        })
      );
    });

    it('should not call API when botId validation fails', async () => {
      // Arrange: No botId anywhere
      const store = useAsyncDocumentStore.getState();

      // Act
      try {
        await store.fetchDocuments();
      } catch {
        // Expected to throw
      }

      // Assert: API should not be called
      expect(documentsAsyncApi.listWithStatus).not.toHaveBeenCalled();
    });
  });
});
