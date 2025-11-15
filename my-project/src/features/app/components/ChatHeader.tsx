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
      className="flex items-center gap-3 px-6 py-4 border-b bg-background"
      style={{ borderBottomColor: primary_color }}
    >
      <div
        className="flex items-center justify-center w-10 h-10 rounded-full"
        style={{ backgroundColor: `${primary_color}20` }}
      >
        {avatar_url ? (
          <img
            src={avatar_url}
            alt={bot_name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <Bot className="w-5 h-5" style={{ color: primary_color }} />
        )}
      </div>
      <div className="flex-1">
        <h1 className="text-lg font-semibold text-foreground">{bot_name}</h1>
      </div>
    </header>
  );
}
