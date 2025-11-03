import { useNavigate } from 'react-router-dom';
import { BotSetup } from '../components/BotSetup';
import { useApp } from '../contexts/AppContext';

export function BotSetupPage() {
  const navigate = useNavigate();
  const { language } = useApp();

  const handleComplete = (botName: string) => {
    // Navigate to setup complete page with bot name in URL
    navigate(`/setup/complete?name=${encodeURIComponent(botName)}`);
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <BotSetup
      onComplete={handleComplete}
      onBack={handleBack}
      language={language}
    />
  );
}
