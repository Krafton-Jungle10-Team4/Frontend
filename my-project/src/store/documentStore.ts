/**
 * Document Store
 * 문서 관련 상태 관리
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { documentsApi } from '@/api/documents';
import type { Document, AsyncState } from '@/types';

interface DocumentStore extends AsyncState<Document[]> {
  // State
  documents: Document[];
  selectedDocument: Document | null;
  searchQuery: string;
  uploadProgress: number;

  // Actions
  uploadDocument: (file: File) => Promise<Document>;
  searchDocuments: (query: string) => Promise<void>;
  getDocument: (id: string) => Promise<Document>;
  deleteDocument: (id: string) => Promise<void>;
  selectDocument: (document: Document | null) => void;
  setSearchQuery: (query: string) => void;
  clearDocuments: () => void;

  // Internal
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  setUploadProgress: (progress: number) => void;
}

export const useDocumentStore = create<DocumentStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        data: null,
        documents: [],
        selectedDocument: null,
        searchQuery: '',
        uploadProgress: 0,
        loading: false,
        error: null,

        // Upload document
        uploadDocument: async (file: File) => {
          set({ loading: true, error: null, uploadProgress: 0 });

          try {
            // Simulate upload progress
            const progressInterval = setInterval(() => {
              const current = get().uploadProgress;
              if (current < 90) {
                set({ uploadProgress: current + 10 });
              }
            }, 200);

            const response = await documentsApi.upload(file);
            clearInterval(progressInterval);
            set({ uploadProgress: 100 });

            const newDocument = response.document;

            // Add to documents list
            set((state) => ({
              documents: [newDocument, ...state.documents],
              loading: false,
              uploadProgress: 0,
            }));

            return newDocument;
          } catch (error) {
            set({
              error: error as Error,
              loading: false,
              uploadProgress: 0,
            });
            throw error;
          }
        },

        // Search documents
        searchDocuments: async (query: string) => {
          set({ loading: true, error: null, searchQuery: query });

          try {
            const response = await documentsApi.search(query);
            set({
              documents: response.documents,
              data: response.documents,
              loading: false,
            });
          } catch (error) {
            set({
              error: error as Error,
              loading: false,
            });
            throw error;
          }
        },

        // Get single document
        getDocument: async (id: string) => {
          set({ loading: true, error: null });

          try {
            const document = await documentsApi.getDocument(id);

            // Update in documents list if exists
            set((state) => ({
              documents: state.documents.map(doc =>
                doc.id === id ? document : doc
              ),
              selectedDocument: document,
              loading: false,
            }));

            return document;
          } catch (error) {
            set({
              error: error as Error,
              loading: false,
            });
            throw error;
          }
        },

        // Delete document
        deleteDocument: async (id: string) => {
          set({ loading: true, error: null });

          try {
            await documentsApi.deleteDocument(id);

            set((state) => ({
              documents: state.documents.filter(doc => doc.id !== id),
              selectedDocument:
                state.selectedDocument?.id === id ? null : state.selectedDocument,
              loading: false,
            }));
          } catch (error) {
            set({
              error: error as Error,
              loading: false,
            });
            throw error;
          }
        },

        // Select document
        selectDocument: (document: Document | null) => {
          set({ selectedDocument: document });
        },

        // Set search query
        setSearchQuery: (query: string) => {
          set({ searchQuery: query });
        },

        // Clear documents
        clearDocuments: () => {
          set({
            documents: [],
            selectedDocument: null,
            searchQuery: '',
            data: null,
            error: null,
          });
        },

        // Internal setters
        setLoading: (loading: boolean) => set({ loading }),
        setError: (error: Error | null) => set({ error }),
        setUploadProgress: (progress: number) => set({ uploadProgress: progress }),
      }),
      {
        name: 'document-storage',
        partialize: (state) => ({
          documents: state.documents,
          searchQuery: state.searchQuery,
        }),
      }
    ),
    {
      name: 'DocumentStore',
    }
  )
);

// Selectors
export const selectDocuments = (state: DocumentStore) => state.documents;
export const selectSelectedDocument = (state: DocumentStore) => state.selectedDocument;
export const selectSearchQuery = (state: DocumentStore) => state.searchQuery;
export const selectUploadProgress = (state: DocumentStore) => state.uploadProgress;
export const selectIsLoading = (state: DocumentStore) => state.loading;
export const selectError = (state: DocumentStore) => state.error;