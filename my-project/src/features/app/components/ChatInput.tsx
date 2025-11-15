import { useState, FormEvent, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
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
      className="border-t bg-background px-6 py-4 flex gap-3"
    >
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
      />
      <Button
        type="submit"
        disabled={disabled || !message.trim()}
        size="icon"
        className="flex-shrink-0"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
