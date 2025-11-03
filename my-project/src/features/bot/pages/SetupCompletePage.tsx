import { useNavigate, useSearchParams } from 'react-router-dom';
import { SetupComplete } from '../components/SetupComplete';
import { useUIStore } from '@/shared/stores/uiStore';

/**
 * Bot Setup 완료 페이지
 * Bot 생성 완료 후 표시되는 페이지
 */
export function SetupCompletePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const language = useUIStore((state) => state.language);

  const botName = searchParams.get('name') || 'Bot';

  const handleComplete = () => {
    // 봇 생성 완료 후 Workflow 화면으로 이동
    navigate('/workflow', { state: { botName } });
  };

  return (
    <SetupComplete
      botName={botName}
      onComplete={handleComplete}
      language={language}
    />
  );
}
