/**
 * CreateBotCard Component
 * Dify 스타일의 "앱 만들기" 카드
 * BotList 그리드의 첫 칸에 표시되어 항상 봇 생성 경로 제공
 */

import { RiAddLine, RiFileTextLine } from '@remixicon/react';
import { Button } from '@/shared/components/button';
import type { Language } from '@/shared/types';

interface CreateBotCardProps {
  onCreateBlank: () => void;
  onCreateFromTemplate: () => void;
  language: Language;
}

export function CreateBotCard({
  onCreateBlank,
  onCreateFromTemplate,
  language,
}: CreateBotCardProps) {
  const translations = {
    en: {
      title: 'Create App',
      subtitle: 'Start building your bot',
      blank: 'Start from Blank',
      template: 'Start from Template',
    },
    ko: {
      title: '앱 만들기',
      subtitle: '새로운 봇을 만들어보세요',
      blank: '빈 상태로 시작',
      template: '템플릿에서 시작',
    },
  };

  const t = translations[language];

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary hover:shadow-md transition-all cursor-default bg-muted/30">
      <div className="flex flex-col items-center justify-center gap-4 h-full min-h-[200px]">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
          <RiAddLine className="text-primary" size={24} />
        </div>

        <div className="text-center">
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            {t.title}
          </h3>
          <p className="text-sm text-gray-500">
            {t.subtitle}
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full mt-2">
          <Button
            onClick={onCreateBlank}
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
          >
            <RiAddLine className="h-4 w-4" />
            {t.blank}
          </Button>

          <Button
            onClick={onCreateFromTemplate}
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
          >
            <RiFileTextLine className="h-4 w-4" />
            {t.template}
          </Button>
        </div>
      </div>
    </div>
  );
}
