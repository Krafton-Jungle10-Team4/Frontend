import { useNavigate, useSearchParams } from 'react-router-dom';
import { SetupComplete } from '../components/SetupComplete';
import { useApp } from '../contexts/AppContext';

export function SetupCompletePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useApp();

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
