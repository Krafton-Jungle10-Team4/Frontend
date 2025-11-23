import { useNavigate, useSearchParams } from 'react-router-dom';
import { BotPreview } from '../components/BotPreview';
import { useUIStore } from '@/shared/stores/uiStore';
import { useBotStore } from '../stores/botStore';
import { useActivityStore } from '@/features/activity';
import { useAuthStore } from '@/features/auth';

export function BotPreviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const language = useUIStore((state) => state.language);
  const addBot = useBotStore((state) => state.addBot);
  const addActivity = useActivityStore((state) => state.addActivity);
  const user = useAuthStore((state) => state.user);
  const userName = user?.name || 'User';

  const botName = searchParams.get('name') || 'Bot';

  const handleContinue = () => {
    // Create new bot
    const newBot = {
      id: `bot_${Date.now()}`,
      name: botName,
      description: `AI assistant created by ${userName}`,
      status: 'active' as const,
      messagesCount: 0,
      errorsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add bot to store
    addBot(newBot);

    // Add activity log
    const translations = {
      en: { action: 'created bot' },
      ko: { action: '서비스를 생성했습니다' },
    };
    addActivity({
      type: 'bot_created',
      botId: newBot.id,
      botName: newBot.name,
      message: `${userName} ${translations[language].action}: ${newBot.name}`,
    });

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
