import { Input } from '@/shared/components/input';
import { Textarea } from '@/shared/components/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/select';
import { useBotSetup } from '../BotSetupContext';
import { TEXT_LIMITS } from '@/shared/constants/textLimits';
import type { Language } from '@/shared/types';
import type { DescriptionSource } from '@/shared/types';

interface Step3PersonalityProps {
  language: Language;
}

export function Step3Personality({ language }: Step3PersonalityProps) {
  const {
    descriptionSource,
    setDescriptionSource,
    websiteUrl,
    setWebsiteUrl,
    personalityText,
    setPersonalityText,
  } = useBotSetup();

  const translations = {
    en: {
      title: 'Personality',
      subtitle:
        "Share a website or description to shape your bot's tone and appearance.",
      descriptionFrom: 'Description from',
      website: 'Website',
      text: 'Text',
      websiteUrlPlaceholder: 'https://yourwebsite.com',
      personalityPlaceholder:
        'Share FAQs, guides, or any info your agent can use to help',
      charactersRemaining: 'characters remaining',
    },
    ko: {
      title: '성격',
      subtitle: '웹사이트나 설명을 공유하여 챗봇의 톤과 외관을 구성하세요.',
      descriptionFrom: '설명 방식',
      website: '웹사이트',
      text: '텍스트',
      websiteUrlPlaceholder: 'https://yourwebsite.com',
      personalityPlaceholder:
        'FAQ, 가이드 또는 챗봇이 사용할 수 있는 정보를 공유하세요',
      charactersRemaining: '자 남음',
    },
  };

  const t = translations[language];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <p className="text-sm text-gray-600 leading-relaxed">{t.subtitle}</p>
      </div>

      <div className="space-y-4">
        {/* Description Source Selector */}
        <div className="space-y-2">
          <label className="text-sm text-gray-600">{t.descriptionFrom}</label>
          <Select
            value={descriptionSource}
            onValueChange={(value: DescriptionSource) =>
              setDescriptionSource(value)
            }
          >
            <SelectTrigger className="w-full h-11 bg-white border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="website">{t.website}</SelectItem>
              <SelectItem value="text">{t.text}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Input Fields */}
        {descriptionSource === 'website' ? (
          <div className="space-y-2">
            <Input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder={t.websiteUrlPlaceholder}
              className="w-full h-11 bg-gray-50 border-gray-200"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Textarea
              value={personalityText}
              onChange={(e) =>
                setPersonalityText(
                  e.target.value.slice(0, TEXT_LIMITS.BOT_PERSONALITY.MAX)
                )
              }
              placeholder={t.personalityPlaceholder}
              className="min-h-[200px] resize-none bg-gray-50 border-gray-200"
            />
            <p className="text-xs text-gray-500 text-right">
              {TEXT_LIMITS.BOT_PERSONALITY.MAX - personalityText.length}{' '}
              {t.charactersRemaining}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
