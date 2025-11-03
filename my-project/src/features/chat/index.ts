/**
 * Chat Feature
 * Public API
 */

// Components
export { ChatWindow } from './components/ChatWindow';
export { ChatMessage } from './components/ChatMessage';

// Store
export {
  useChatStore,
  selectMessages,
  selectSessionId,
  selectIsTyping,
  selectCurrentDocumentId,
  selectIsLoading,
  selectError,
  selectLastMessage,
  selectMessagesByRole,
} from './stores/chatStore';

// Types
export type {
  ChatMessage as ChatMessageType,
  ChatRequest,
  ChatResponse,
  ChatHealthResponse,
} from './types/chat.types';

// API
export {
  chatApi,
  formatChatMessage,
  isChatError,
  handleChatError,
} from './api/chatApi';
