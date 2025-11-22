import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { documentsAsyncApi } from '../api/documentsApi.async';
import { documentsApi } from '../api/documentsApi';
import { POLLING_CONFIG } from '../constants/documentConstants';
import { useBotStore } from '@features/bot/stores/botStore';
import type { DocumentWithStatus, DocumentListRequest } from '../types/document.types';
import { DocumentStatus } from '../types/document.types';

interface PollingState {
  documentId: string;
  intervalId: NodeJS.Timeout;
  retryCount: number;
  lastChecked: Date;
}

interface AsyncDocumentStore {
  // State
  documents: Map<string, DocumentWithStatus>; // documentId -> document
  pollingStates: Map<string, PollingState>; // documentId -> polling state
  visibilityState: 'visible' | 'hidden';

  // Filters & Pagination
  filters: {
    status?: DocumentStatus;
    searchQuery?: string;
  };
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };

  // UI State
  selectedDocumentId: string | null;
  uploadProgress: number;
  isLoading: boolean;
  error: Error | null;

  // Actions - Upload
  uploadDocumentAsync: (file: File, botId?: string) => Promise<string>;

  // Actions - Polling
  startPolling: (documentId: string) => void;
  stopPolling: (documentId: string) => void;
  stopAllPolling: () => void;
  checkDocumentStatus: (documentId: string) => Promise<void>;

  // Actions - List & Filter
  fetchDocuments: (request?: DocumentListRequest) => Promise<void>;
  setFilters: (filters: Partial<AsyncDocumentStore['filters']>) => void;
  setPagination: (
    pagination: Partial<AsyncDocumentStore['pagination']>
  ) => void;
  resetFilters: () => void;

  // Actions - Document Operations
  retryDocument: (documentId: string) => Promise<void>;
  /**
   * Delete document
   * @param documentId - Document ID to delete
   * @param botId - Bot ID that owns the document
   */
  deleteDocument: (documentId: string, botId: string) => Promise<void>;

  // Actions - UI
  selectDocument: (documentId: string | null) => void;
  setVisibilityState: (state: 'visible' | 'hidden') => void;
  clearError: () => void;
}

const normalizeDocumentStatus = (status: DocumentStatus | string): DocumentStatus => {
  const statusValue = status?.toString() ?? '';

  if (statusValue === 'completed') {
    return DocumentStatus.DONE;
  }

  if ((Object.values(DocumentStatus) as string[]).includes(statusValue)) {
    return statusValue as DocumentStatus;
  }

  console.warn('[DocumentStore] Unknown document status received:', status);
  return DocumentStatus.QUEUED;
};

export const useAsyncDocumentStore = create<AsyncDocumentStore>()(
  subscribeWithSelector(
    devtools(
      (set, get) => ({
        // Initial State
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

        // Upload with automatic polling
        uploadDocumentAsync: async (file: File, botId?: string) => {
          set({ isLoading: true, error: null, uploadProgress: 0 });

          const botStoreState = useBotStore.getState();
          const resolvedBotId =
            botId ??
            botStoreState.selectedBotId ??
            botStoreState.bots[0]?.id ??
            null;

          if (!resolvedBotId) {
            const error = new Error(
              '업로드 가능한 워크플로우를 찾을 수 없습니다. 먼저 챗봇을 생성하세요.'
            );
            set({ error, isLoading: false, uploadProgress: 0 });
            throw error;
          }

          try {
            // Upload file
            const response = await documentsAsyncApi.uploadAsync(
              file,
              resolvedBotId,
              (progressEvent) => {
                if (progressEvent.total) {
                  const progress = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                  );
                  set({ uploadProgress: progress });
                }
              }
            );

            // Create initial document state (using standard schema)
            const fileExtension =
              file.name.split('.').pop()?.toLowerCase() || '';
            const newDocument: DocumentWithStatus = {
              documentId: response.jobId,
              botId: resolvedBotId,
              userUuid: '', // Will be populated by backend
              originalFilename: file.name,
              fileExtension,
              fileSize: file.size,
              mimeType: file.type,
              status: DocumentStatus.QUEUED,
              retryCount: 0,
              createdAt: new Date().toISOString(),
              metadata: {},
            };

            // Add to documents map
            const documents = new Map(get().documents);
            documents.set(response.jobId, newDocument);
            set({ documents, isLoading: false, uploadProgress: 0 });

            // Start polling for status
            get().startPolling(response.jobId);

            return response.jobId;
          } catch (error) {
            set({ error: error as Error, isLoading: false, uploadProgress: 0 });
            throw error;
          }
        },

        // Polling mechanism
        startPolling: (documentId: string) => {
          const { pollingStates, visibilityState } = get();

          // Skip if already polling
          if (pollingStates.has(documentId)) return;

          const interval =
            visibilityState === 'visible'
              ? POLLING_CONFIG.INTERVAL
              : POLLING_CONFIG.BACKGROUND_INTERVAL;

          const intervalId = setInterval(() => {
            get().checkDocumentStatus(documentId);
          }, interval);

          pollingStates.set(documentId, {
            documentId,
            intervalId,
            retryCount: 0,
            lastChecked: new Date(),
          });

          set({ pollingStates: new Map(pollingStates) });
        },

        stopPolling: (documentId: string) => {
          const { pollingStates } = get();
          const state = pollingStates.get(documentId);

          if (state) {
            clearInterval(state.intervalId);
            pollingStates.delete(documentId);
            set({ pollingStates: new Map(pollingStates) });
          }
        },

        stopAllPolling: () => {
          const { pollingStates } = get();

          pollingStates.forEach((state) => {
            clearInterval(state.intervalId);
          });

          set({ pollingStates: new Map() });
        },

        checkDocumentStatus: async (documentId: string) => {
          const { documents, pollingStates } = get();
          const pollingState = pollingStates.get(documentId);

          if (!pollingState) return;

          try {
            const statusResponse = await documentsAsyncApi.getStatus(documentId);
            const nextStatus = normalizeDocumentStatus(statusResponse.status);

            // Update document
            const document = documents.get(documentId);
            if (document) {
              const updated: DocumentWithStatus = {
                ...document,
                status: nextStatus,
                errorMessage: statusResponse.errorMessage,
                chunkCount: statusResponse.chunkCount,
                processingTime: statusResponse.processingTime,
                completedAt: statusResponse.completedAt,
                // Persist progressPercent from status API, fallback to existing value
                progressPercent: statusResponse.progressPercent ?? document.progressPercent,
              };

              documents.set(documentId, updated);
              set({ documents: new Map(documents) });

              // Stop polling if completed
              if (
                nextStatus === DocumentStatus.DONE ||
                nextStatus === DocumentStatus.FAILED
              ) {
                get().stopPolling(documentId);
              }
            }

            // Update polling state
            pollingState.retryCount = 0;
            pollingState.lastChecked = new Date();
          } catch (error) {
            console.error('Polling status check failed:', error);
            // Increment retry count
            pollingState.retryCount++;

            // Stop polling after max retries
            if (pollingState.retryCount >= POLLING_CONFIG.MAX_RETRIES) {
              get().stopPolling(documentId);
              console.error(`Max retries reached for document ${documentId}`);
            }
          }
        },

        // Fetch documents with status
        fetchDocuments: async (request?: DocumentListRequest) => {
          const { filters, pagination } = get();

          const finalRequest: DocumentListRequest = {
            ...filters,
            ...request,
            limit: request?.limit ?? pagination.limit,
            offset: request?.offset ?? pagination.offset,
          };

          set({ isLoading: true, error: null });

          try {
            const response =
              await documentsAsyncApi.listWithStatus(finalRequest);

            // Update documents map, preserving progressPercent from existing state
            const existingDocuments = get().documents;
            const documents = new Map<string, DocumentWithStatus>();
            response.documents.forEach((doc) => {
              const existingDoc = existingDocuments.get(doc.documentId);
              const normalizedStatus = normalizeDocumentStatus(doc.status);
              const updatedDoc: DocumentWithStatus = {
                ...doc,
                status: normalizedStatus,
                // Preserve progressPercent: use new value if available, otherwise keep existing
                progressPercent: doc.progressPercent ?? existingDoc?.progressPercent,
              };

              documents.set(doc.documentId, updatedDoc);
            });

            set({
              documents,
              pagination: {
                ...pagination,
                total: response.total,
              },
              isLoading: false,
            });

            // Start polling for processing documents
            response.documents.forEach((doc) => {
              const normalizedStatus = normalizeDocumentStatus(doc.status);
              if (
                normalizedStatus === DocumentStatus.QUEUED ||
                normalizedStatus === DocumentStatus.PROCESSING
              ) {
                get().startPolling(doc.documentId);
              }
            });
          } catch (error) {
            set({ error: error as Error, isLoading: false });
            throw error;
          }
        },

        // Retry failed document
        retryDocument: async (documentId: string) => {
          set({ isLoading: true, error: null });

          try {
            await documentsAsyncApi.retry(documentId);

            // Update document status
            const documents = new Map(get().documents);
            const document = documents.get(documentId);
            if (document) {
              document.status = DocumentStatus.QUEUED;
              document.errorMessage = undefined;
              document.retryCount++;
              // Reset progressPercent for retry
              document.progressPercent = 0;
              documents.set(documentId, document);
              set({ documents });
            }

            // Start polling
            get().startPolling(documentId);

            set({ isLoading: false });
          } catch (error) {
            set({ error: error as Error, isLoading: false });
            throw error;
          }
        },

        // Delete document
        deleteDocument: async (documentId: string) => {
          set({ isLoading: true, error: null });

          try {
            // Stop polling first
            get().stopPolling(documentId);

            // Delete from backend
            await documentsApi.deleteDocument(documentId);

            // Remove from state
            const documents = new Map(get().documents);
            documents.delete(documentId);

            set({
              documents,
              selectedDocumentId:
                get().selectedDocumentId === documentId
                  ? null
                  : get().selectedDocumentId,
              isLoading: false,
            });
          } catch (error) {
            set({ error: error as Error, isLoading: false });
            throw error;
          }
        },

        // UI Actions
        setFilters: (newFilters) => {
          set((state) => ({
            filters: { ...state.filters, ...newFilters },
            pagination: { ...state.pagination, offset: 0 },
          }));
          // ✅ FIX: Removed automatic fetchDocuments() to prevent infinite loops
          // Components should explicitly call fetchDocuments() when needed
        },

        setPagination: (newPagination) => {
          set((state) => ({
            pagination: { ...state.pagination, ...newPagination },
          }));
          // ✅ FIX: Removed automatic fetchDocuments() to prevent infinite loops
          // Components should explicitly call fetchDocuments() when needed
        },

        resetFilters: () => {
          set({
            filters: {},
            pagination: {
              limit: 50,
              offset: 0,
              total: 0,
            },
          });
          // ✅ FIX: Removed automatic fetchDocuments() to prevent infinite loops
          // Components should explicitly call fetchDocuments() when needed
        },

        selectDocument: (documentId) => {
          set({ selectedDocumentId: documentId });
        },

        setVisibilityState: (state) => {
          const currentState = get().visibilityState;
          if (currentState === state) return;

          set({ visibilityState: state });

          // Adjust polling intervals
          const { pollingStates } = get();
          pollingStates.forEach((pollingState) => {
            get().stopPolling(pollingState.documentId);
            get().startPolling(pollingState.documentId);
          });
        },

        clearError: () => set({ error: null }),
      }),
      {
        name: 'AsyncDocumentStore',
      }
    )
  )
);

// Visibility state listener
if (typeof window !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    const state = document.visibilityState === 'visible' ? 'visible' : 'hidden';
    useAsyncDocumentStore.getState().setVisibilityState(state);
  });
}

// Cleanup on unmount
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    useAsyncDocumentStore.getState().stopAllPolling();
  });
}
