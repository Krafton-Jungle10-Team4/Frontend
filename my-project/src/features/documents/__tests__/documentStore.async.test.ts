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

  describe('fetchDocuments - botId resolution', () => {
    const mockResponse = {
      documents: [],
      total: 0,
      limit: 50,
      offset: 0,
    };

    beforeEach(() => {
      vi.mocked(documentsAsyncApi.listWithStatus).mockResolvedValue(
        mockResponse
      );
    });

    it('should fetch documents without botId when none is provided', async () => {
      const store = useAsyncDocumentStore.getState();

      await expect(store.fetchDocuments()).resolves.toBeUndefined();

      const callArg = vi.mocked(documentsAsyncApi.listWithStatus).mock.calls[0][0];
      expect(callArg.botId).toBeUndefined();
      expect(useAsyncDocumentStore.getState().error).toBeNull();
    });

    it('should use botId from request parameter when provided', async () => {
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

    it('should allow explicit undefined botId to bypass fallback filters', async () => {
      useAsyncDocumentStore.setState({
        filters: { botId: 'filter-bot-id' },
      });

      // Also mock selected bot to ensure both are ignored
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
      await store.fetchDocuments({ botId: undefined });

      const callArg = vi.mocked(documentsAsyncApi.listWithStatus).mock.calls.at(-1)?.[0];
      expect(callArg?.botId).toBeUndefined();
    });
  });
});
