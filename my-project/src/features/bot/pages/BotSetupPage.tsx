import { useNavigate } from 'react-router-dom';
import { BotSetup } from '../components/BotSetup';
import { useUIStore } from '@/shared/stores/uiStore';

export function BotSetupPage() {
  const navigate = useNavigate();
  const language = useUIStore((state) => state.language);

  const handleBack = () => {
    navigate('/home');
  };

  return <BotSetup onBack={handleBack} language={language} />;
}
