import { useNavigate, useSearchParams } from 'react-router-dom';
import { BotPreview } from '../components/BotPreview';
import { useApp } from '../contexts/AppContext';

export function BotPreviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language, addBot } = useApp();

  const botName = searchParams.get('name') || 'Bot';

  const handleContinue = () => {
    // Add the bot to the list
    addBot(botName);
    
    // Navigate back to home
    navigate('/');
  };

  return (
    <BotPreview
      botName={botName}
      onContinue={handleContinue}
      language={language}
    />
  );
}
