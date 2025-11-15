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
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-muted/30">
      {messages.map((message) => {
        const isUser = message.role === 'user';
        return (
          <div
            key={message.id}
            className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
          >
            {!isUser && (
              <div
                className="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <Bot className="w-4 h-4" style={{ color: primaryColor }} />
              </div>
            )}

            <div
              className={`flex flex-col max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`px-4 py-2 rounded-lg ${
                  isUser
                    ? 'text-white'
                    : 'bg-background border border-border text-foreground'
                }`}
                style={
                  isUser ? { backgroundColor: primaryColor } : undefined
                }
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              </div>

              {message.sources && message.sources.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-muted-foreground">출처:</p>
                  {message.sources.map((source, idx) => (
                    <div
                      key={source.document_id || idx}
                      className="flex items-start gap-1 text-xs text-muted-foreground"
                    >
                      <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-1">{source.title}</span>
                    </div>
                  ))}
                </div>
              )}

              <span className="text-xs text-muted-foreground mt-1">
                {new Date(message.timestamp).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {isUser && (
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary flex-shrink-0">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
