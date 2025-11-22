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
      className="flex items-center gap-3 sm:gap-4 px-5 sm:px-7 py-4 sm:py-5 border-b border-border/60 bg-gradient-to-r from-background/80 via-background/90 to-background/80 backdrop-blur-md sticky top-0 z-10 shadow-sm"
      role="banner"
    >
      <div
        className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl shadow-md transition-all hover:scale-105 hover:shadow-lg flex-shrink-0"
        style={{
          backgroundColor: `${primary_color}15`
        }}
        aria-hidden="true"
      >
        {avatar_url ? (
          <img
            src={avatar_url}
            alt=""
            className="w-full h-full rounded-xl object-cover"
            loading="lazy"
          />
        ) : (
          <Bot className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: primary_color }} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h1 className="text-lg sm:text-xl font-bold text-foreground truncate bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          {bot_name}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          온라인
        </p>
      </div>
    </header>
  );
}
