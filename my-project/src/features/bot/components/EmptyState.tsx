import { Button } from '@/shared/components/button';
import type { Language } from '@/shared/types';

interface EmptyStateProps {
  onCreateBot: () => void;
  language: Language;
}

export function EmptyState({ onCreateBot, language }: EmptyStateProps) {
  const translations = {
    en: {
      title: 'Workspace has no bots',
      description:
        'Your workspace has no bots. Get started by creating a new bot.',
      button: '+ Create Bot',
    },
    ko: {
      title: '워크스페이스에 챗봇이 없습니다',
      description: '새로운 챗봇을 생성하여 시작하세요.',
      button: '+ 챗봇 생성',
    },
  };

  const t = translations[language];

  return (
    <div className="flex flex-col items-center justify-center h-full px-4">
      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
        <div className="space-y-2">
          <div className="h-2 sm:h-3 w-12 sm:w-16 bg-gray-200 rounded mx-auto"></div>
          <div className="h-2 sm:h-3 w-8 sm:w-12 bg-gray-200 rounded mx-auto"></div>
        </div>
      </div>
      <h3 className="text-gray-900 mb-2 text-center text-base sm:text-lg">
        {t.title}
      </h3>
      <p className="text-gray-500 text-sm mb-4 text-center max-w-md">
        {t.description}
      </p>
      <Button
        onClick={onCreateBot}
        className="bg-blue-500 hover:bg-blue-600 text-white"
      >
        {t.button}
      </Button>
    </div>
  );
}
