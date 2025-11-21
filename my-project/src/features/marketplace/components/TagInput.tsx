/**
 * TagInput
 * Phase 6: 태그 입력 유틸리티 컴포넌트
 */

import { useState } from 'react';
import { Input } from '@/shared/components/input';
import { Badge } from '@/shared/components/badge';
import { X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  className?: string;
}

export function TagInput({
  value,
  onChange,
  placeholder = '태그 입력 후 Enter',
  maxTags = 10,
  className
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && !e.nativeEvent.isComposing) {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const addTag = () => {
    const newTag = inputValue.trim();
    if (!newTag) return;

    if (value.includes(newTag)) {
      setInputValue('');
      return;
    }

    if (value.length >= maxTags) {
      return;
    }

    onChange([...value, newTag]);
    setInputValue('');
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap gap-2 p-2 border border-gray-200 rounded-md min-h-[42px]">
        {value.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="flex items-center gap-1 px-2 py-1"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="hover:bg-gray-300 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] border-none shadow-none focus-visible:ring-0 px-1"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {value.length} / {maxTags} 태그 (Enter 또는 쉼표로 추가)
      </p>
    </div>
  );
}
