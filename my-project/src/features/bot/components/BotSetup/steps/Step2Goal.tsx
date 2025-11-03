import { Button } from '@/shared/components/button';
import { Textarea } from '@/shared/components/textarea';
import { Headphones, Briefcase, Hand, Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import { useBotSetup } from '../BotSetupContext';
import { TEXT_LIMITS } from '@/shared/constants/textLimits';
import { toast } from 'sonner';
import type { Language } from '@/shared/types';
import type { GoalType } from '@/shared/types';

interface Step2GoalProps {
  language: Language;
}

const goalIcons = {
  'customer-support': Headphones,
  'ai-assistant': Briefcase,
  'sales': Hand,
  'other': Sparkles,
};

export function Step2Goal({ language }: Step2GoalProps) {
  const {
    selectedGoal,
    setSelectedGoal,
    customGoal,
    setCustomGoal,
    showCustomInput,
    setShowCustomInput,
    isRefiningPrompt,
    setIsRefiningPrompt,
  } = useBotSetup();

  const translations = {
    en: {
      title: 'Goal',
      subtitleSelect: "Select your bot's primary goal so we can tailor its behavior.",
      subtitleCustom: "Describe your bot's primary goal so we can tailor its behavior.",
      customerSupport: 'Customer Support',
      customerSupportDesc: 'Fix problems and help users along the way',
      aiAssistant: 'AI Assistant',
      aiAssistantDesc: 'Help customers with anything about your brand',
      sales: 'Sales',
      salesDesc: 'Help customers discover the right products for them',
      other: 'Other',
      otherDesc: "Shape your agent's unique personality",
      backToUseCases: 'Back to all use cases',
      refinePrompt: 'Refine Prompt',
      customGoalPlaceholder:
        'Describe the role of this AI agent in less than 1500 characters',
      charactersRemaining: 'characters remaining',
    },
    ko: {
      title: '목표',
      subtitleSelect: '챗봇의 주요 목표를 선택하여 동작 방식을 맞춤화하세요.',
      subtitleCustom: '챗봇의 주요 목표를 설명하여 동작 방식을 맞춤화하세요.',
      customerSupport: '고객 지원',
      customerSupportDesc: '문제를 해결하고 사용자를 지원합니다',
      aiAssistant: 'AI 어시스턴트',
      aiAssistantDesc: '브랜드에 대한 모든 것을 도와드립니다',
      sales: '영업',
      salesDesc: '고객이 적합한 제품을 찾도록 도와드립니다',
      other: '기타',
      otherDesc: '고유한 성격을 만들어보세요',
      backToUseCases: '모든 사용 사례로 돌아가기',
      refinePrompt: '프롬프트 개선',
      customGoalPlaceholder: 'AI 에이전트의 역할을 1500자 이내로 설명해주세요',
      charactersRemaining: '자 남음',
    },
  };

  const t = translations[language];

  const goals: Array<{ type: GoalType; label: string; description: string }> = [
    {
      type: 'customer-support',
      label: t.customerSupport,
      description: t.customerSupportDesc,
    },
    {
      type: 'ai-assistant',
      label: t.aiAssistant,
      description: t.aiAssistantDesc,
    },
    {
      type: 'sales',
      label: t.sales,
      description: t.salesDesc,
    },
    {
      type: 'other',
      label: t.other,
      description: t.otherDesc,
    },
  ];

  const handleGoalSelect = (goal: GoalType) => {
    setSelectedGoal(goal);
    if (goal === 'other') {
      setShowCustomInput(true);
    }
  };

  const handleBackToUseCases = () => {
    setShowCustomInput(false);
    setSelectedGoal(null);
    setCustomGoal('');
  };

  const handleRefinePrompt = async () => {
    if (!customGoal.trim()) return;

    setIsRefiningPrompt(true);

    try {
      // TODO: Replace with real API call when ready
      // const data = await ApiClient.refinePrompt(customGoal);
      // setCustomGoal(data.refinedPrompt);

      // Mock implementation for now
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const refined = customGoal.trim() + '\n\n[This is a refined version from the LLM]';
      setCustomGoal(refined.slice(0, TEXT_LIMITS.BOT_GOAL.MAX));

      toast.success(
        language === 'ko' ? '프롬프트가 최적화되었습니다!' : 'Prompt refined successfully!'
      );
    } catch {
      toast.error(
        language === 'ko' ? '프롬프트 최적화 실패' : 'Failed to refine prompt'
      );
    } finally {
      setIsRefiningPrompt(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          {showCustomInput ? t.subtitleCustom : t.subtitleSelect}
        </p>
      </div>

      {!showCustomInput ? (
        <div className="grid grid-cols-2 gap-4">
          {goals.map((goal) => {
            const Icon = goalIcons[goal.type!];
            const isSelected = selectedGoal === goal.type;

            return (
              <button
                key={goal.type}
                onClick={() => handleGoalSelect(goal.type)}
                className={`p-6 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-teal-500 bg-teal-50/50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div
                    className={`p-3 rounded-full ${
                      isSelected ? 'bg-teal-100' : 'bg-gray-100'
                    }`}
                  >
                    <Icon
                      size={24}
                      className={isSelected ? 'text-teal-600' : 'text-gray-600'}
                    />
                  </div>
                  <div>
                    <h3 className="mb-1 text-gray-900">
                      {goal.label}
                    </h3>
                    <p className="text-sm text-gray-600">{goal.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          <button
            onClick={handleBackToUseCases}
            className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700"
          >
            <ArrowLeft size={16} />
            {t.backToUseCases}
          </button>

          <div className="space-y-2">
            <div className="flex items-center justify-end mb-2">
              <Button
                onClick={handleRefinePrompt}
                disabled={isRefiningPrompt || !customGoal.trim()}
                variant="ghost"
                size="sm"
                className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
              >
                {isRefiningPrompt ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    {language === 'ko' ? '최적화 중...' : 'Refining...'}
                  </>
                ) : (
                  <>
                    <Sparkles size={16} className="mr-2" />
                    {t.refinePrompt}
                  </>
                )}
              </Button>
            </div>
            <Textarea
              value={customGoal}
              onChange={(e) =>
                setCustomGoal(e.target.value.slice(0, TEXT_LIMITS.BOT_GOAL.MAX))
              }
              placeholder={t.customGoalPlaceholder}
              className="min-h-[200px] resize-none bg-gray-50 border-gray-200"
            />
            <div className="flex items-center justify-end">
              <p className="text-xs text-gray-500">
                {TEXT_LIMITS.BOT_GOAL.MAX - customGoal.length} {t.charactersRemaining}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
