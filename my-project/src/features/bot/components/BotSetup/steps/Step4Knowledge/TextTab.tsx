import { Textarea } from '@/shared/components/textarea';
import { useBotSetup } from '../../BotSetupContext';
import { TEXT_LIMITS } from '@/shared/constants/textLimits';
import type { Language } from '@/shared/types';

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
          setKnowledgeText(e.target.value.slice(0, TEXT_LIMITS.KNOWLEDGE_TEXT.MAX))
        }
        placeholder={t.placeholder}
        className="min-h-[250px] resize-none bg-gray-50 border-gray-200"
      />
      <p className="text-xs text-gray-500 text-right">
        {TEXT_LIMITS.KNOWLEDGE_TEXT.MAX - knowledgeText.length} {t.charactersRemaining}
      </p>
    </div>
  );
}
