import { useState } from 'react';
import { Button } from '@/shared/components/button';
import { ArrowRight, ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBotSetup } from '../BotSetupContext';
import { useCreateBot } from '../../../hooks/useCreateBot';
import { buildCreateBotDto } from '../../../utils/botSetupHelpers';
import { botApi } from '../../../api/botApi';
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
    knowledgeText,
    setShowCustomInput,
    hasAnyData,
    setShowExitDialog,
    botName,
    createdBotId,
    setCreatedBotId,
  } = context;

  const { createBot, isCreating } = useCreateBot();
  const [isUpdating, setIsUpdating] = useState(false);

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
    try {
      if (step === 1) {
        // Step 1 → Step 2: Create bot with just name (DRAFT status)
        if (!createdBotId) {
          setIsUpdating(true);
          const newBot = await botApi.create({ name: botName.trim() });
          setCreatedBotId(newBot.id);
          console.log('✅ [Step 1] Bot created:', newBot.id);
          setIsUpdating(false);
        }
        setStep(2);
      } else if (step === 2) {
        // Step 2 → Step 3: PATCH bot with goal/personality
        if (createdBotId) {
          setIsUpdating(true);
          const goal = selectedGoal === 'other' ? customGoal.trim() : selectedGoal;
          await botApi.update(createdBotId, { goal } as any);
          console.log('✅ [Step 2] Bot updated with goal:', goal);
          setIsUpdating(false);
        }
        setStep(3);
        setShowCustomInput(false);
      } else if (step === 3) {
        // Step 3: Complete setup - PATCH status to ACTIVE
        if (!createdBotId) {
          toast.error(
            language === 'ko' ? '봇 ID를 찾을 수 없습니다' : 'Bot ID not found'
          );
          return;
        }

        setIsUpdating(true);

        // Update knowledge with uploaded file IDs
        const uploadedFileIds = context.files
          .filter((f) => f.status === 'uploaded')
          .map((f) => f.id);

        if (uploadedFileIds.length > 0) {
          await botApi.update(createdBotId, { knowledge: uploadedFileIds } as any);
          console.log('✅ [Step 3] Bot updated with knowledge:', uploadedFileIds);
        }

        // Set status to ACTIVE
        await botApi.updateStatus(createdBotId, 'active');
        console.log('✅ [Step 3] Bot status set to ACTIVE');

        // 성공 메시지
        toast.success(
          language === 'ko' ? '봇이 생성되었습니다' : 'Bot created successfully'
        );

        // Workflow 화면으로 이동
        navigate(`/bot/${createdBotId}/workflow`, {
          state: {
            botName: botName,
            goal: selectedGoal === 'other' ? customGoal : selectedGoal,
            knowledge: knowledgeText,
          },
        });

        setIsUpdating(false);
      }
    } catch (error) {
      console.error('Bot setup error:', error);
      toast.error(
        language === 'ko'
          ? '봇 설정 중 오류가 발생했습니다'
          : 'Error during bot setup'
      );
      setIsUpdating(false);
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
              {t.step} {step} {t.of} 3
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
              style={{ width: `${(step / 3) * 100}%` }}
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
            disabled={!isStepValid(step) || isUpdating}
            className={`h-12 bg-teal-500 hover:bg-teal-600 text-white ${
              step > 1 ? 'flex-[8]' : 'w-full'
            }`}
          >
            {isUpdating
              ? language === 'ko'
                ? '처리 중...'
                : 'Processing...'
              : step === 3
                ? t.trainAgent
                : t.next}
            {!isUpdating && <ArrowRight size={18} className="ml-2" />}
          </Button>
        </div>
      </div>
    </>
  );
}
