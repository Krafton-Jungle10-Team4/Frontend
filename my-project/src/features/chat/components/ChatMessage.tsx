/**
 * ChatMessage Component
 * 개별 채팅 메시지 컴포넌트
 */

import type { ChatMessage as ChatMessageType } from '../types/chat.types';

interface ChatMessageProps {
  message: ChatMessageType;
  language?: 'en' | 'ko';
}

export function ChatMessage({ message, language = 'ko' }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          isUser
            ? 'bg-teal-500 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p className="text-xs mt-1 opacity-70">
          {new Date(message.timestamp).toLocaleTimeString(language === 'ko' ? 'ko-KR' : 'en-US')}
        </p>
      </div>
    </div>
  );
}
