import { useState, FormEvent, KeyboardEvent, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@shared/components/button';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = '메시지를 입력하세요...',
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;

    onSend(message.trim());
    setMessage('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4 sm:px-6 py-3 sm:py-4 flex gap-2 sm:gap-3 sticky bottom-0 shadow-[0_-2px_8px_rgba(0,0,0,0.05)]"
      role="search"
      aria-label="메시지 입력 폼"
    >
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="w-full resize-none rounded-lg border border-input bg-background px-3 sm:px-4 py-2.5 sm:py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all placeholder:text-muted-foreground max-h-[120px] overflow-y-auto"
          aria-label="메시지 입력"
          aria-describedby="input-hint"
        />
        <span id="input-hint" className="sr-only">
          Enter로 전송, Shift+Enter로 줄바꿈
        </span>
      </div>
      <Button
        type="submit"
        disabled={disabled || !message.trim()}
        size="icon"
        className="flex-shrink-0 h-10 w-10 sm:h-11 sm:w-11 transition-transform hover:scale-105 active:scale-95"
        aria-label={disabled ? '전송 중...' : '메시지 전송'}
      >
        {disabled ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </form>
  );
}
