/**
 * Document Store
 * 문서 관련 상태 관리
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { documentsApi } from '../api/documentsApi';
import type { Document } from '../types/document.types';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

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
      (set, _get) => ({
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
            const response = await documentsApi.uploadDocument(
              file,
              (progressEvent) => {
                if (progressEvent.total) {
                  const progress = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                  );
                  set({ uploadProgress: progress });
                }
              }
            );

            // Convert API response to frontend format
            const newDocument: Document = {
              id: response.document_id,
              filename: response.filename,
              size: response.file_size,
              mimeType: response.file_type,
              uploadedAt: response.upload_date,
              metadata: { chunk_count: response.chunk_count },
            };

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
            const response = await documentsApi.searchDocuments({
              query,
              top_k: 10,
            });

            // Convert API response to frontend format
            const documents: Document[] = response.results.map((result) => ({
              id: result.document_id,
              filename: result.filename,
              size: 0, // Not provided in search response
              mimeType: result.file_type,
              uploadedAt: result.upload_date,
              metadata: {
                chunk_id: result.chunk_id,
                similarity_score: result.similarity_score,
                content: result.content,
              },
            }));

            set({
              documents,
              data: documents,
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
            const response = await documentsApi.getDocument(id);

            // Convert API response to frontend format
            const document: Document = {
              id: response.document_id,
              filename: response.filename,
              size: response.file_size,
              mimeType: response.file_type,
              uploadedAt: response.upload_date,
              metadata: { chunk_count: response.chunk_count },
            };

            // Update in documents list if exists
            set((state) => ({
              documents: state.documents.map((doc) =>
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
              documents: state.documents.filter((doc) => doc.id !== id),
              selectedDocument:
                state.selectedDocument?.id === id
                  ? null
                  : state.selectedDocument,
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
        setUploadProgress: (progress: number) =>
          set({ uploadProgress: progress }),
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
export const selectSelectedDocument = (state: DocumentStore) =>
  state.selectedDocument;
export const selectSearchQuery = (state: DocumentStore) => state.searchQuery;
export const selectUploadProgress = (state: DocumentStore) =>
  state.uploadProgress;
export const selectIsLoading = (state: DocumentStore) => state.loading;
export const selectError = (state: DocumentStore) => state.error;
