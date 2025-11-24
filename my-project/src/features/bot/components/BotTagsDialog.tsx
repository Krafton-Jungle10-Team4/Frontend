/**
 * BotTagsDialog Component
 * 봇 태그 추가/편집 다이얼로그
 */

import { useState, useEffect, useMemo } from 'react';
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
import {
  BOT_CATEGORY_PRESETS,
  DEFAULT_CATEGORY_PRESET,
  getCategoryIcon,
} from '../constants/categoryPresets';

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
  const categoryOptions = useMemo(
    () => BOT_CATEGORY_PRESETS.filter((preset) => preset.value !== '기타'),
    []
  );
  const categoryValues = categoryOptions.map((preset) => preset.value);

  const [selectedCategory, setSelectedCategory] = useState<string>(
    DEFAULT_CATEGORY_PRESET.value
  );
  const [otherTags, setOtherTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      const initialCategory =
        currentTags.find((tag) => categoryValues.includes(tag)) ||
        DEFAULT_CATEGORY_PRESET.value;
      const initialOthers = currentTags
        .filter((tag) => tag !== initialCategory)
        .filter((tag, idx, arr) => arr.indexOf(tag) === idx);

      setSelectedCategory(initialCategory);
      setOtherTags(initialOthers);
      setInputValue('');
    }
  }, [open, currentTags, categoryValues]);

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

    if ([selectedCategory, ...otherTags].length >= 10) {
      alert(t.maxTags);
      return;
    }

    if ([selectedCategory, ...otherTags].includes(trimmedValue)) {
      alert(t.tagExists);
      return;
    }

    // 선택 가능한 4개 카테고리 이외의 직접 입력은 기타로 분류
    if (categoryValues.includes(trimmedValue)) {
      setSelectedCategory(trimmedValue);
    } else {
      setSelectedCategory(DEFAULT_CATEGORY_PRESET.value);
      setOtherTags([...otherTags, trimmedValue]);
    }

    setInputValue('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (tagToRemove === selectedCategory) {
      setSelectedCategory(DEFAULT_CATEGORY_PRESET.value);
      return;
    }
    setOtherTags(otherTags.filter((tag) => tag !== tagToRemove));
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
      const combined = [selectedCategory, ...otherTags].slice(0, 10);
      await onSave(botId, combined);
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
        {/* 카테고리 선택 */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-800">카테고리 태그</p>
          <div className="grid grid-cols-2 gap-2">
            {categoryOptions.map((preset) => {
              const Icon = getCategoryIcon(preset.value);
              const isActive = selectedCategory === preset.value;
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setSelectedCategory(preset.value)}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition ${
                    isActive
                      ? 'border-[#3735c3] bg-[#f4f5ff]'
                      : 'border-gray-200 bg-white hover:border-[#3735c3]/50'
                  }`}
                >
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-white shadow-sm"
                    style={{
                      background: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})`,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-gray-900">{preset.label}</p>
                    <p className="text-[12px] text-gray-500">{preset.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-500">
            직접 입력한 태그는 자동으로 "기타" 카테고리로 분류됩니다.
          </p>
        </div>

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
            {[selectedCategory, ...otherTags].length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {[selectedCategory, ...otherTags].map((tag) => (
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
