import { Textarea } from '@/components/ui/textarea';
import { useBotSetup } from '../../BotSetupContext';
import { TEXT_LIMITS } from '@/constants/textLimits';
import type { Language } from '@/types';

interface TextTabProps {
  language: Language;
}

export function TextTab({ language }: TextTabProps) {
  const { knowledgeText, setKnowledgeText } = useBotSetup();

  const translations = {
    en: {
      placeholder: 'Add FAQs, documentation, or any text content your bot should reference',
      charactersRemaining: 'characters remaining',
    },
    ko: {
      placeholder: 'FAQ, 문서 또는 챗봇이 참조할 텍스트 콘텐츠를 추가하세요',
      charactersRemaining: '자 남음',
    },
  };

  const t = translations[language];

  return (
    <div className="space-y-2">
      <Textarea
        value={knowledgeText}
        onChange={(e) =>
          setKnowledgeText(e.target.value.slice(0, TEXT_LIMITS.KNOWLEDGE))
        }
        placeholder={t.placeholder}
        className="min-h-[250px] resize-none bg-gray-50 border-gray-200"
      />
      <p className="text-xs text-gray-500 text-right">
        {TEXT_LIMITS.KNOWLEDGE - knowledgeText.length} {t.charactersRemaining}
      </p>
    </div>
  );
}
