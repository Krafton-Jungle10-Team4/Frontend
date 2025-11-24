/**
 * BotCreateDialog Component
 * 봇 생성을 위한 다이얼로그 컴포넌트
 * 봇 이름과 설명을 입력받아 생성 요청을 처리합니다.
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/components/dialog';
import { Button } from '@shared/components/button';
import { Input } from '@shared/components/input';
import { Label } from '@shared/components/label';
import { Textarea } from '@shared/components/textarea';
import type { Language } from '@shared/types';
import { cn } from '@shared/components/utils';
import { BOT_CATEGORY_PRESETS, DEFAULT_CATEGORY_PRESET, getCategoryIcon, getCategoryPreset } from '../constants/categoryPresets';

interface BotCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language?: Language;
  onSubmit: (input: { name: string; description?: string; tags: string[] }) => Promise<void>;
  isCreating?: boolean;
}

const translations = {
  ko: {
    title: '새 서비스 만들기',
    description: '서비스의 이름과 설명을 입력하세요',
    nameLabel: '서비스 이름',
    namePlaceholder: '예: 고객 지원 도우미',
    descriptionLabel: '설명 (선택사항)',
    descriptionPlaceholder: '이 봇의 목적은 무엇인가요?',
    categoryLabel: '카테고리 태그',
    categoryHelper: '봇의 역할에 맞는 태그를 선택하면 카드 색상과 아이콘이 함께 설정됩니다.',
    cancel: '취소',
    create: '생성하기',
    creating: '생성 중...',
    nameRequired: '서비스 이름은 필수입니다',
  },
};

export function BotCreateDialog({
  open,
  onOpenChange,
  language = 'ko',
  onSubmit,
  isCreating = false,
}: BotCreateDialogProps) {
  const t = translations.ko;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <BotCreateForm
        key={open ? 'bot-create-form-open' : 'bot-create-form-closed'}
        translations={t}
        isCreating={isCreating}
        onSubmit={onSubmit}
        onClose={() => onOpenChange(false)}
      />
    </Dialog>
  );
}

interface BotCreateFormProps {
  translations: (typeof translations)['ko'];
  isCreating: boolean;
  onSubmit: (input: { name: string; description?: string; tags: string[] }) => Promise<void>;
  onClose: () => void;
}

function BotCreateForm({
  translations: t,
  isCreating,
  onSubmit,
  onClose,
}: BotCreateFormProps) {
  const [botName, setBotName] = useState('');
  const [botDescription, setBotDescription] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>(
    DEFAULT_CATEGORY_PRESET.value
  );

  const handleSubmit = async () => {
    if (!botName.trim()) {
      return;
    }

    await onSubmit({
      name: botName.trim(),
      description: botDescription.trim() || undefined,
      tags: selectedTag ? [selectedTag] : [],
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && botName.trim() && !isCreating) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  const selectedPreset = getCategoryPreset(selectedTag);
  const SelectedIcon = getCategoryIcon(selectedTag);

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>{t.title}</DialogTitle>
        <DialogDescription>{t.description}</DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="bot-name">{t.nameLabel}</Label>
          <Input
            id="bot-name"
            value={botName}
            onChange={(e) => setBotName(e.target.value.slice(0, 100))}
            placeholder={t.namePlaceholder}
            autoFocus
            onKeyDown={handleKeyDown}
            disabled={isCreating}
            maxLength={100}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bot-description">{t.descriptionLabel}</Label>
          <Textarea
            id="bot-description"
            value={botDescription}
            onChange={(e) => setBotDescription(e.target.value.slice(0, 500))}
            placeholder={t.descriptionPlaceholder}
            rows={4}
            onKeyDown={handleKeyDown}
            disabled={isCreating}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground">
            {botDescription.length}/500
          </p>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="bot-category">{t.categoryLabel}</Label>
            <p className="text-xs text-muted-foreground">
              {t.categoryHelper}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {BOT_CATEGORY_PRESETS.map((preset) => {
              const CategoryIcon = getCategoryIcon(preset.value);
              const isActive = selectedTag === preset.value;
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setSelectedTag(preset.value)}
                  disabled={isCreating}
                  className={cn(
                    'flex items-start gap-3 rounded-xl border p-3 text-left transition-all',
                    'hover:border-[#3735c3]/50 hover:shadow-md',
                    isActive
                      ? 'border-[#3735c3] bg-gradient-to-r from-white via-white to-[#f5f7ff]'
                      : 'border-gray-200 bg-white'
                  )}
                >
                  <span
                    className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-lg text-white shadow-sm"
                    style={{
                      background: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})`,
                    }}
                  >
                    <CategoryIcon className="h-5 w-5 drop-shadow-sm" />
                  </span>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {preset.label}
                      </p>
                      {isActive && (
                        <span className="rounded-full bg-[#3735c3]/10 px-2 py-0.5 text-[11px] font-semibold text-[#3735c3]">
                          선택됨
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] leading-relaxed text-gray-500">
                      {preset.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-2 text-[12px] text-gray-600">
            <span
              className="inline-flex h-6 w-6 items-center justify-center rounded-md text-white"
              style={{
                background: `linear-gradient(135deg, ${selectedPreset.primary}, ${selectedPreset.secondary})`,
              }}
            >
              <SelectedIcon className="h-4 w-4 drop-shadow-sm" />
            </span>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-800">{selectedPreset.label}</span>
              <span className="text-[11px] text-gray-500">
                이 태그가 카드 색상과 아이콘을 결정합니다.
              </span>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isCreating}>
          {t.cancel}
        </Button>
        <Button
          onClick={() => {
            void handleSubmit();
          }}
          disabled={!botName.trim() || isCreating}
          className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300"
        >
          {isCreating ? t.creating : t.create}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
