/**
 * ChatWindow Component
 * 채팅 창 컴포넌트 (기본 구조)
 */

import type { ChatMessage } from '../types/chat.types';

interface ChatWindowProps {
  messages: ChatMessage[];
  isTyping?: boolean;
  onSendMessage?: (message: string) => void;
}

export function ChatWindow({
  messages,
  isTyping = false,
  onSendMessage: _onSendMessage,
}: ChatWindowProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <p className="text-sm text-gray-600">입력 중...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
