import { useNavigate, useSearchParams } from 'react-router-dom';
import { SetupComplete } from '../components/SetupComplete';
import { useUIStore } from '@/shared/stores/uiStore';
import { toast } from 'sonner';

/**
 * Bot Setup 완료 페이지
 * Bot 생성 완료 후 표시되는 페이지
 */
export function SetupCompletePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const language = useUIStore((state) => state.language);

  const botName = searchParams.get('name') || 'Bot';
  const botId = searchParams.get('botId');

  const handleComplete = () => {
    // botId 유효성 검증
    if (!botId) {
      toast.error(
        language === 'ko'
          ? '봇 ID를 찾을 수 없습니다. 홈으로 이동합니다.'
          : 'Bot ID not found. Redirecting to home.'
      );
      navigate('/home');
      return;
    }

    // 봇 생성 완료 후 Workflow 화면으로 이동
    navigate(`/workflow/${botId}`, { state: { botName } });
  };

  return (
    <SetupComplete
      botName={botName}
      onComplete={handleComplete}
      language={language}
    />
  );
}
