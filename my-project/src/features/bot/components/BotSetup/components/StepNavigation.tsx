import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBotSetup } from '../BotSetupContext';
import { ApiClient } from '@/utils/api';
import { toast } from 'sonner';
import type { Language } from '@/types';

interface StepNavigationProps {
  onBack: () => void;
  onComplete: (botName: string) => void;
  language: Language;
}

export function StepNavigation({
  onBack,
  onComplete,
  language,
}: StepNavigationProps) {
  const {
    step,
    setStep,
    isStepValid,
    botName,
    selectedGoal,
    customGoal,
    descriptionSource,
    websiteUrl,
    personalityText,
    knowledgeText,
    sessionId,
    showCustomInput,
    setShowCustomInput,
    hasAnyData,
    setShowExitDialog,
  } = useBotSetup();

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
        // TODO: Replace with real API call when ready
        // const data = await ApiClient.createBot({
        //   name: botName,
        //   goal: selectedGoal === 'other' ? customGoal : selectedGoal || '',
        //   descriptionSource,
        //   websiteUrl: descriptionSource === 'website' ? websiteUrl : undefined,
        //   personalityText: descriptionSource === 'text' ? personalityText : undefined,
        //   knowledgeText,
        //   sessionId,
        // });

        // Mock implementation
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (botName.trim()) {
          // onComplete(botName);
          // Step 4: Train Agent button clicked - Navigate to WorkflowBuilder
          navigate('/workflow-builder', {
            state: {
              botName,
              goal: selectedGoal === 'other' ? customGoal : selectedGoal,
              personality: personalityText,
              knowledge: knowledgeText,
            },
          });
        }
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
            disabled={!isStepValid(step)}
            className={`h-12 bg-teal-500 hover:bg-teal-600 text-white ${
              step > 1 ? 'flex-[8]' : 'w-full'
            }`}
          >
            {step === 4 ? t.trainAgent : t.next}
            <ArrowRight size={18} className="ml-2" />
          </Button>
        </div>
      </div>
    </>
  );
}
