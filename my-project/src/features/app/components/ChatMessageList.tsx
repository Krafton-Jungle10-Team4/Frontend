import { useEffect, useRef } from 'react';
import { Bot, User, ExternalLink } from 'lucide-react';
import type {
  WidgetMessage,
  WidgetConfigResponse,
} from '@/features/widget/types/widget.types';

interface ChatMessageListProps {
  messages: WidgetMessage[];
  config: WidgetConfigResponse | null;
}

export function ChatMessageList({ messages, config }: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!config) return null;

  const primaryColor = config.config.primary_color;

  return (
    <div
      className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 bg-muted/30"
      role="log"
      aria-live="polite"
      aria-atomic="false"
      aria-label="채팅 메시지 목록"
    >
      {messages.map((message, index) => {
        const isUser = message.role === 'user';
        return (
          <div
            key={message.id}
            className={`flex gap-2 sm:gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            style={{ animationDelay: `${index * 50}ms` }}
            role="article"
            aria-label={`${isUser ? '사용자' : '봇'} 메시지`}
          >
            {!isUser && (
              <div
                className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0 transition-transform hover:scale-110"
                style={{ backgroundColor: `${primaryColor}20` }}
                aria-hidden="true"
              >
                <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: primaryColor }} />
              </div>
            )}

            <div
              className={`flex flex-col max-w-[85%] sm:max-w-[75%] md:max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`px-3 sm:px-4 py-2 rounded-lg shadow-sm transition-shadow hover:shadow-md ${
                  isUser
                    ? 'text-white'
                    : 'bg-background border border-border text-foreground'
                }`}
                style={
                  isUser ? { backgroundColor: primaryColor } : undefined
                }
              >
                <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                  {message.content}
                </p>
              </div>

              {message.sources && message.sources.length > 0 && (
                <div className="mt-2 space-y-1 animate-in fade-in duration-300" style={{ animationDelay: '100ms' }}>
                  <p className="text-xs text-muted-foreground font-medium">출처:</p>
                  {message.sources.map((source, idx) => (
                    <div
                      key={source.document_id || idx}
                      className="flex items-start gap-1 text-xs text-muted-foreground group"
                      aria-label={`출처: ${source.title}`}
                    >
                      <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                      <div className="flex-1 min-w-0">
                        <span className="line-clamp-1 block">{source.title}</span>
                        {source.snippet && (
                          <span className="text-xs text-muted-foreground/70 line-clamp-2 mt-0.5 block">
                            {source.snippet}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <time
                className="text-xs text-muted-foreground mt-1"
                dateTime={message.timestamp}
              >
                {new Date(message.timestamp).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
            </div>

            {isUser && (
              <div
                className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary flex-shrink-0 transition-transform hover:scale-110"
                aria-hidden="true"
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
              </div>
            )}
          </div>
        );
      })}
      <div ref={messagesEndRef} aria-hidden="true" />
    </div>
  );
}
