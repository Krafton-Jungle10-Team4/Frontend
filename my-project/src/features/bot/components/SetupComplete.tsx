import { useEffect, useState } from 'react';
import { Coffee, Check } from 'lucide-react';
import { Progress } from '@/shared/components/progress';
import type { Language } from '@/shared/types';

interface SetupCompleteProps {
  botName: string;
  onComplete: () => void;
  language: Language;
}

export function SetupComplete({ botName: _botName, onComplete, language }: SetupCompleteProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  // const [botId, setBotId] = useState<string | null>(null); // Backend should provide this

  const translations = {
    en: {
      steps: [
        'Defining instructions for your bot...',
        'Processing knowledge sources...',
        'Your bot is learning from your content...',
        'Training AI model...',
        'Optimizing responses...',
      ],
      title: 'Setup complete',
      description: 'Personalizing your agent with your content.',
      finishedTraining: 'Finished training',
      mayTakeTime: 'This may take some time',
      sitBackRelax: 'Sit back and relax while we set your bot up for you.'
    },
    ko: {
      steps: [
        '챗봇 지침을 정의하는 중...',
        '지식 소스를 처리하는 중...',
        '챗봇이 콘텐츠를 학습하는 중...',
        'AI 모델을 학습하는 중...',
        '응답을 최적화하는 중...',
      ],
      title: '설정 완료',
      description: '콘텐츠로 챗봇을 개인화하는 중입니다.',
      finishedTraining: '학습 완료',
      mayTakeTime: '시간이 다소 걸릴 수 있습니다',
      sitBackRelax: '챗봇을 설정하는 동안 편히 쉬세요.'
    }
  };

  const t = translations[language];

  useEffect(() => {
    // TODO: GET /api/bots/{botId}/training-status
    // Poll backend for real-time training progress
    //
    // Request: GET /api/bots/${botId}/training-status
    // Response: {
    //   progress: number,         // 0-100
    //   currentStep: number,      // 0-4 (index of current step)
    //   stepDescription: string,  // Current step description from backend
    //   isComplete: boolean       // Training finished
    // }
    //
    // Implementation:
    // const pollTrainingStatus = async () => {
    //   try {
    //     const response = await fetch(`/api/bots/${botId}/training-status`);
    //     const data = await response.json();
    //
    //     setProgress(data.progress);
    //     setCurrentStep(data.currentStep);
    //     setIsFinished(data.isComplete);
    //
    //     if (data.isComplete) {
    //       // Navigate to preview page
    //       setTimeout(() => onComplete(), 1000);
    //     }
    //   } catch (error) {
    //     console.error('Failed to fetch training status:', error);
    //   }
    // };
    //
    // Poll every 1 second
    // const pollInterval = setInterval(pollTrainingStatus, 1000);
    //
    // Initial call
    // pollTrainingStatus();
    //
    // Cleanup
    // return () => clearInterval(pollInterval);

    // ===== MOCK IMPLEMENTATION (REPLACE WITH REAL API) =====
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 50);

    // Step progression
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= t.steps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);

    // Finish training
    const finishTimer = setTimeout(() => {
      setIsFinished(true);
      setTimeout(() => {
        // NAVIGATE: Go to BotPreview page
        onComplete();
      }, 1000);
    }, 6500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearTimeout(finishTimer);
    };
  }, [onComplete, t.steps.length]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl mb-4">{t.title}</h1>
          <p className="text-gray-600">
            {t.description}
          </p>
        </div>

        <div className="space-y-8">
          {/* Current Step */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              {isFinished ? t.finishedTraining : t.steps[currentStep]}
            </p>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Finished Check */}
          {isFinished && (
            <div className="flex items-center justify-center gap-2 text-green-600">
              <Check size={20} />
              <span className="text-sm">{t.finishedTraining}</span>
            </div>
          )}

          {/* Coffee Icon and Message */}
          <div className="text-center pt-8">
            <Coffee size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">{t.mayTakeTime}</p>
            <p className="text-sm text-gray-500">
              {t.sitBackRelax}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
