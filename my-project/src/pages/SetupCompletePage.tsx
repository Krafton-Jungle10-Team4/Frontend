import { useNavigate, useSearchParams } from 'react-router-dom';
import { SetupComplete } from '../components/SetupComplete';
import { useUIStore } from '../store/uiStore';

export function SetupCompletePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const language = useUIStore((state) => state.language);

  const botName = searchParams.get('name') || 'Bot';

  const handleComplete = () => {
    navigate(`/preview?name=${encodeURIComponent(botName)}`);
  };

  return (
    <SetupComplete
      botName={botName}
      onComplete={handleComplete}
      language={language}
    />
  );
}
