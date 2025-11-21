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

interface BotCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: Language;
  onSubmit: (input: { name: string; description?: string }) => Promise<void>;
  isCreating?: boolean;
}

const translations = {
  en: {
    title: 'Create New Bot',
    description: 'Enter a name and description for your bot',
    nameLabel: 'Bot Name',
    namePlaceholder: 'e.g., Customer Support Assistant',
    descriptionLabel: 'Description (Optional)',
    descriptionPlaceholder: 'What is the purpose of this bot?',
    cancel: 'Cancel',
    create: 'Create Bot',
    creating: 'Creating...',
    nameRequired: 'Bot name is required',
  },
  ko: {
    title: '새 에이전트 만들기',
    description: '에이전트의 이름과 설명을 입력하세요',
    nameLabel: '에이전트 이름',
    namePlaceholder: '예: 고객 지원 도우미',
    descriptionLabel: '설명 (선택사항)',
    descriptionPlaceholder: '이 봇의 목적은 무엇인가요?',
    cancel: '취소',
    create: '생성하기',
    creating: '생성 중...',
    nameRequired: '에이전트 이름은 필수입니다',
  },
};

export function BotCreateDialog({
  open,
  onOpenChange,
  language,
  onSubmit,
  isCreating = false,
}: BotCreateDialogProps) {
  const t = translations[language];

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
  translations: (typeof translations)['en'];
  isCreating: boolean;
  onSubmit: (input: { name: string; description?: string }) => Promise<void>;
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

  const handleSubmit = async () => {
    if (!botName.trim()) {
      return;
    }

    await onSubmit({
      name: botName.trim(),
      description: botDescription.trim() || undefined,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && botName.trim() && !isCreating) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  return (
    <DialogContent className="max-w-xs">
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
