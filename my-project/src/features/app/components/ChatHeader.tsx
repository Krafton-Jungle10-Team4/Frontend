import { Bot } from 'lucide-react';
import type { WidgetConfigResponse } from '@/features/widget/types/widget.types';

interface ChatHeaderProps {
  config: WidgetConfigResponse | null;
}

export function ChatHeader({ config }: ChatHeaderProps) {
  if (!config) return null;

  const { bot_name, avatar_url, primary_color } = config.config;

  return (
    <header
      className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sticky top-0 z-10 shadow-sm"
      style={{ borderBottomColor: primary_color }}
      role="banner"
    >
      <div
        className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-transform hover:scale-105 flex-shrink-0"
        style={{ backgroundColor: `${primary_color}20` }}
        aria-hidden="true"
      >
        {avatar_url ? (
          <img
            src={avatar_url}
            alt=""
            className="w-full h-full rounded-full object-cover"
            loading="lazy"
          />
        ) : (
          <Bot className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: primary_color }} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">
          {bot_name}
        </h1>
        <p className="text-xs text-muted-foreground hidden sm:block">
          AI 어시스턴트
        </p>
      </div>
    </header>
  );
}
