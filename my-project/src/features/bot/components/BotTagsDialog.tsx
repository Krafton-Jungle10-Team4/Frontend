/**
 * BotTagsDialog Component
 * 봇 태그 추가/편집 다이얼로그
 */

import { useState, useEffect } from 'react';
import { X, Plus, Tag as TagIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/dialog';
import { Button } from '@/shared/components/button';
import { Input } from '@/shared/components/input';
import { Badge } from '@/shared/components/badge';
import type { Language } from '@/shared/types';

interface BotTagsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  botId: string;
  currentTags: string[];
  onSave: (botId: string, tags: string[]) => Promise<void>;
  language?: Language;
}

export function BotTagsDialog({
  open,
  onOpenChange,
  botId,
  currentTags,
  onSave,
  language: _language = 'ko',
}: BotTagsDialogProps) {
  const [tags, setTags] = useState<string[]>(currentTags);
  const [inputValue, setInputValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTags(currentTags);
      setInputValue('');
    }
  }, [open, currentTags]);

  const translations = {
    ko: {
      title: '태그 편집',
      description: '이 서비스의 태그를 추가하거나 제거하세요',
      placeholder: '태그 이름 입력...',
      add: '추가',
      cancel: '취소',
      save: '저장',
      maxTags: '최대 10개의 태그까지 허용됩니다',
      tagExists: '이미 존재하는 태그입니다',
    },
  };

  const t = translations.ko;

  const handleAddTag = () => {
    const trimmedValue = inputValue.trim();

    if (!trimmedValue) return;

    if (tags.length >= 10) {
      alert(t.maxTags);
      return;
    }

    if (tags.includes(trimmedValue)) {
      alert(t.tagExists);
      return;
    }

    setTags([...tags, trimmedValue]);
    setInputValue('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(botId, tags);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save tags:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TagIcon className="h-5 w-5" />
            {t.title}
          </DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 태그 입력 */}
          <div className="flex gap-2">
            <Input
              placeholder={t.placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={20}
              disabled={tags.length >= 10}
            />
            <Button
              type="button"
              onClick={handleAddTag}
              disabled={!inputValue.trim() || tags.length >= 10}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              {t.add}
            </Button>
          </div>

          {/* 태그 목록 */}
          <div className="min-h-[100px] p-4 border border-gray-200 rounded-lg">
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-sm pl-3 pr-2 py-1.5"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 hover:text-red-600 transition-colors"
                      type="button"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                태그가 없습니다
              </div>
            )}
          </div>

          {tags.length >= 10 && (
            <p className="text-xs text-amber-600">{t.maxTags}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            {t.cancel}
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? '저장 중...' : t.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
