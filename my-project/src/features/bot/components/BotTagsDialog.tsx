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
import {
  DEFAULT_TAGS,
  TAG_BACKGROUND_MAP,
  TAG_ICON_COLOR_MAP,
  TAG_ICON_MAP,
  type DefaultTag,
} from '@/features/studio/constants/tagIcons';

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

const TAG_DESCRIPTIONS: Record<DefaultTag, string> = {
  고객지원: '문의 응대, FAQ, 상담 챗봇에 활용',
  마케팅: '캠페인, 콘텐츠 아이디어, 홍보 메시지',
  데이터분석: '지표 요약, 리포트 자동화, 대시보드 설명',
  문서작성: '초안 작성, 정리, 편집 보조',
  기타: '범용 태그로 자유롭게 활용',
};

const RECOMMENDED_TAGS = DEFAULT_TAGS.map((tag) => ({
  value: tag,
  label: tag,
  description: TAG_DESCRIPTIONS[tag],
  background: TAG_BACKGROUND_MAP[tag],
  color: TAG_ICON_COLOR_MAP[tag],
  Icon: TAG_ICON_MAP[tag],
}));

const DEFAULT_CATEGORY: DefaultTag =
  (DEFAULT_TAGS.find((tag) => tag === '기타') as DefaultTag | undefined) || DEFAULT_TAGS[0];

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
  const t = translations.ko;
  const recommendedTagValues = DEFAULT_TAGS;

  const [selectedCategory, setSelectedCategory] = useState<DefaultTag>(DEFAULT_CATEGORY);
  const [otherTags, setOtherTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      const initialCategory =
        (currentTags.find((tag) => recommendedTagValues.includes(tag as DefaultTag)) as
          | DefaultTag
          | undefined) || DEFAULT_CATEGORY;
      const initialOthers = currentTags
        .filter((tag) => tag !== initialCategory)
        .filter((tag, idx, arr) => arr.indexOf(tag) === idx);

      setSelectedCategory(initialCategory);
      setOtherTags(initialOthers);
      setInputValue('');
    }
  }, [open, currentTags, recommendedTagValues]);

  const currentAllTags = [selectedCategory, ...otherTags];

  const handleAddTag = () => {
    const trimmedValue = inputValue.trim();

    if (!trimmedValue) return;

    if (currentAllTags.length >= 10) {
      alert(t.maxTags);
      return;
    }

    if (recommendedTagValues.includes(trimmedValue as DefaultTag)) {
      setSelectedCategory(trimmedValue as DefaultTag);
      setOtherTags((prev) => prev.filter((tag) => tag !== trimmedValue));
      setInputValue('');
      return;
    }

    if (currentAllTags.includes(trimmedValue)) {
      alert(t.tagExists);
      return;
    }

    setSelectedCategory(DEFAULT_CATEGORY);
    setOtherTags((prev) => [...prev, trimmedValue]);
    setInputValue('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (tagToRemove === selectedCategory) {
      setSelectedCategory(DEFAULT_CATEGORY);
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
            <p className="text-sm font-semibold text-gray-800">추천 태그</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {RECOMMENDED_TAGS.map((option) => {
                const { Icon } = option;
                const isActive = selectedCategory === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(option.value);
                      setOtherTags((prev) => prev.filter((tag) => tag !== option.value));
                    }}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition ${
                      isActive
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                    style={{
                      backgroundColor: isActive ? option.background : undefined,
                    }}
                  >
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-lg border text-white shadow-sm"
                      style={{
                        backgroundColor: option.background,
                        color: option.color,
                        borderColor: `${option.color}30`,
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-gray-900">{option.label}</p>
                      <p className="text-[12px] text-gray-500">{option.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-500">
              추천 태그 중 하나를 선택하면 카드 색상과 아이콘이 함께 적용됩니다.
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
              disabled={currentAllTags.length >= 10}
            />
            <Button
              type="button"
              onClick={handleAddTag}
              disabled={!inputValue.trim() || currentAllTags.length >= 10}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              {t.add}
            </Button>
          </div>

          {/* 태그 목록 */}
          <div className="min-h-[100px] p-4 border border-gray-200 rounded-lg">
            {currentAllTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {currentAllTags.map((tag) => (
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

          {currentAllTags.length >= 10 && (
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
