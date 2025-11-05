import { Input } from '@/shared/components/input';
import { useBotSetup } from '../BotSetupContext';
import { TEXT_LIMITS } from '@/shared/constants/textLimits';
import type { Language } from '@/shared/types';

interface Step1NameProps {
  language: Language;
}

export function Step1Name({ language }: Step1NameProps) {
  const { botName, setBotName } = useBotSetup();

  const translations = {
    en: {
      title: 'Setup',
      subtitle:
        "We'll guide you through four quick steps. First, name your bot.",
      placeholder: 'What should we call your bot?',
    },
    ko: {
      title: '설정',
      subtitle: '4단계로 챗봇을 설정합니다. 먼저 챗봇의 이름을 정해주세요.',
      placeholder: '챗봇 이름을 입력하세요',
    },
  };

  const t = translations[language];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <p className="text-sm text-gray-600 leading-relaxed">{t.subtitle}</p>
      </div>

      <div className="space-y-2">
        <Input
          value={botName}
          onChange={(e) =>
            setBotName(e.target.value.slice(0, TEXT_LIMITS.BOT_NAME.MAX))
          }
          placeholder={t.placeholder}
          className="w-full h-11 bg-gray-50 border-gray-200 px-3"
          autoFocus
        />
      </div>
    </div>
  );
}
