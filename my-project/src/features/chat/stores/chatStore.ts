/**
 * Chat Store
 * 채팅 관련 상태 관리
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { chatApi, formatChatMessage } from '../api/chatApi';
import type { ChatMessage } from '../types/chat.types';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface ChatStore extends AsyncState<ChatMessage[]> {
  // State
  messages: ChatMessage[];
  sessionId: string | null;
  isTyping: boolean;
  currentDocumentId: string | null;

  // Actions
  sendMessage: (message: string, documentId?: string) => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  setSessionId: (sessionId: string | null) => void;
  setCurrentDocumentId: (documentId: string | null) => void;
  checkHealth: () => Promise<boolean>;

  // Internal
  setLoading: (loading: boolean) => void;
  setTyping: (typing: boolean) => void;
  setError: (error: Error | null) => void;
}

export const useChatStore = create<ChatStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      data: null,
      messages: [],
      sessionId: null,
      isTyping: false,
      currentDocumentId: null,
      loading: false,
      error: null,

      // Send message
      sendMessage: async (message: string, documentId?: string) => {
        const trimmedMessage = message.trim();
        if (!trimmedMessage) {
          throw new Error('Message cannot be empty');
        }

        set({ loading: true, error: null, isTyping: true });

        // Add user message immediately
        const userMessage = formatChatMessage(trimmedMessage, 'user');
        set((state) => ({
          messages: [...state.messages, userMessage],
        }));

        try {
          // Use current documentId or provided one
          const docId = documentId || get().currentDocumentId || undefined;
          const { sessionId } = get();

          const response = await chatApi.sendMessage(trimmedMessage, docId, sessionId || undefined);

          // Update session ID if new
          if (response.sessionId && response.sessionId !== sessionId) {
            set({ sessionId: response.sessionId });
          }

          // Add assistant message
          set((state) => ({
            messages: [...state.messages, response.message],
            data: [...state.messages, response.message],
            loading: false,
            isTyping: false,
          }));
        } catch (error) {
          set({
            error: error as Error,
            loading: false,
            isTyping: false,
          });
          throw error;
        }
      },

      // Add message manually
      addMessage: (message: ChatMessage) => {
        set((state) => ({
          messages: [...state.messages, message],
        }));
      },

      // Clear all messages
      clearMessages: () => {
        set({
          messages: [],
          sessionId: null,
          data: null,
          error: null,
        });
      },

      // Set session ID
      setSessionId: (sessionId: string | null) => {
        set({ sessionId });
      },

      // Set current document ID
      setCurrentDocumentId: (documentId: string | null) => {
        set({ currentDocumentId: documentId });
      },

      // Health check
      checkHealth: async () => {
        try {
          const health = await chatApi.healthCheck();
          return health.status === 'healthy';
        } catch (error) {
          console.error('Health check failed:', error);
          return false;
        }
      },

      // Internal setters
      setLoading: (loading: boolean) => set({ loading }),
      setTyping: (typing: boolean) => set({ isTyping: typing }),
      setError: (error: Error | null) => set({ error }),
    }),
    {
      name: 'ChatStore',
    }
  )
);

// Selectors
export const selectMessages = (state: ChatStore) => state.messages;
export const selectSessionId = (state: ChatStore) => state.sessionId;
export const selectIsTyping = (state: ChatStore) => state.isTyping;
export const selectCurrentDocumentId = (state: ChatStore) => state.currentDocumentId;
export const selectIsLoading = (state: ChatStore) => state.loading;
export const selectError = (state: ChatStore) => state.error;

// Utility selectors
export const selectLastMessage = (state: ChatStore) =>
  state.messages.length > 0 ? state.messages[state.messages.length - 1] : null;

export const selectMessagesByRole = (role: 'user' | 'assistant') => (state: ChatStore) =>
  state.messages.filter(msg => msg.role === role);
