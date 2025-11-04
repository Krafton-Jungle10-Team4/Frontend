import { Button } from '@/shared/components/button';
import { ArrowRight, ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBotSetup } from '../BotSetupContext';
import { useCreateBot } from '../../../hooks/useCreateBot';
import { buildCreateBotDto } from '../../../utils/botSetupHelpers';
import { toast } from 'sonner';
import type { Language } from '@/shared/types';

interface StepNavigationProps {
  onBack: () => void;
  language: Language;
}

export function StepNavigation({ onBack, language }: StepNavigationProps) {
  const context = useBotSetup();
  const {
    step,
    setStep,
    isStepValid,
    selectedGoal,
    customGoal,
    personalityText,
    knowledgeText,
    setShowCustomInput,
    hasAnyData,
    setShowExitDialog,
  } = context;

  const { createBot, isCreating } = useCreateBot();

  const translations = {
    en: {
      step: 'Step',
      of: 'of',
      next: 'Next',
      trainAgent: 'Train agent',
      prev: 'Prev',
    },
    ko: {
      step: '단계',
      of: '/',
      next: '다음',
      trainAgent: '챗봇 학습',
      prev: '이전',
    },
  };

  const t = translations[language];
  const navigate = useNavigate();

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
      if (step === 2) {
        setShowCustomInput(false);
      }
    } else {
      // Step 4: Train Agent button clicked
      try {
        const dto = buildCreateBotDto(context);

        // 🔍 백엔드로 전달되는 데이터 확인
        console.log('📤 [Bot Creation] DTO to Backend:', dto);
        console.log('📋 [Bot Creation] Context Data:', {
          botName: context.botName,
          selectedGoal: context.selectedGoal,
          customGoal: context.customGoal,
          descriptionSource: context.descriptionSource,
          personalityText: context.personalityText,
          websiteUrl: context.websiteUrl,
          uploadedFiles: context.files
            .filter((f) => f.status === 'uploaded')
            .map((f) => ({
              id: f.id,
              file: f.file,
              status: f.status,
            })),
        });

        // 봇 생성 API 호출
        const newBot = await createBot(dto);

        // 🔍 백엔드 응답 데이터 확인
        console.log('📥 [Bot Creation] Response from Backend:', newBot);
        console.log('✅ [Bot Creation] Created Bot Info:', {
          id: newBot.id,
          name: newBot.name,
          status: newBot.status,
          messagesCount: newBot.messagesCount,
          errorsCount: newBot.errorsCount,
          createdAt: newBot.createdAt,
        });

        // 성공 메시지
        toast.success(
          language === 'ko' ? '봇이 생성되었습니다' : 'Bot created successfully'
        );

        // Workflow 화면으로 이동 (botId 포함)
        navigate(`/workflow/${newBot.id}`, {
          state: {
            botName: newBot.name,
            goal: selectedGoal === 'other' ? customGoal : selectedGoal,
            personality: personalityText,
            knowledge: knowledgeText,
          },
        });
      } catch (error) {
        console.error('Bot creation error:', error);
        toast.error(
          language === 'ko' ? '봇 생성에 실패했습니다' : 'Failed to create bot'
        );
      }
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCloseClick = () => {
    if (hasAnyData()) {
      setShowExitDialog(true);
    } else {
      onBack();
    }
  };

  return (
    <>
      {/* Top Progress Bar & Close Button */}
      <div className="absolute top-0 left-0 right-0 px-6 py-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-700">
              {t.step} {step} {t.of} 4
            </span>
            <button
              onClick={handleCloseClick}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Navigation Buttons */}
      <div className="absolute bottom-0 left-0 right-0 px-6 py-6">
        <div className="max-w-md mx-auto flex items-center gap-3">
          {step > 1 && (
            <Button
              onClick={handlePrev}
              variant="outline"
              className="flex-[2] h-12 border-gray-300"
            >
              <ArrowLeft size={18} />
            </Button>
          )}

          <Button
            onClick={handleNext}
            disabled={!isStepValid(step) || isCreating}
            className={`h-12 bg-teal-500 hover:bg-teal-600 text-white ${
              step > 1 ? 'flex-[8]' : 'w-full'
            }`}
          >
            {isCreating
              ? language === 'ko'
                ? '생성 중...'
                : 'Creating...'
              : step === 4
                ? t.trainAgent
                : t.next}
            {!isCreating && <ArrowRight size={18} className="ml-2" />}
          </Button>
        </div>
      </div>
    </>
  );
}
