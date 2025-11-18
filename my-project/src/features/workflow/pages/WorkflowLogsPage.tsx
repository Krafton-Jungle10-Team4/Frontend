import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import LogsView from '../components/views/LogsView';
import { useBotStore } from '@/features/bot/stores/botStore';

export const WorkflowLogsPage = () => {
  const { botId } = useParams<{ botId: string }>();
  const setSelectedBotId = useBotStore((state) => state.setSelectedBotId);

  useEffect(() => {
    setSelectedBotId(botId ?? null);
    return () => setSelectedBotId(null);
  }, [botId, setSelectedBotId]);

  return <LogsView />;
};
