/**
 * PublishDropdown Component
 * 라이브러리에 게시 버튼
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@shared/components/button';
import { usePublishActions } from '../../hooks/usePublishActions';
import { botApi } from '@/features/bot/api/botApi';
import { GitCommit, Loader2 } from 'lucide-react';

interface PublishDropdownProps {
  botId: string;
}

export function PublishDropdown({ botId }: PublishDropdownProps) {
  const navigate = useNavigate();
  const { publishUpdate } = usePublishActions(botId);

  const [botName, setBotName] = useState<string>('');
  const [isPublishing, setIsPublishing] = useState(false);

  // 봇 정보 조회
  useEffect(() => {
    const fetchBotInfo = async () => {
      try {
        const bot = await botApi.getById(botId);
        setBotName(bot.name || '');
      } catch (error) {
        console.error('Failed to fetch bot info:', error);
      }
    };
    if (botId) {
      fetchBotInfo();
    }
  }, [botId]);

  // 라이브러리에 게시 버튼 클릭 - 모달 없이 바로 커밋
  const handlePublishClick = async () => {
    setIsPublishing(true);
    try {
      await publishUpdate({
        library_name: botName || 'Workflow',
        library_description: '',
        library_category: '',
        library_tags: [],
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="!text-white !bg-blue-600 hover:!bg-blue-700 !border-blue-600 hover:!border-blue-700 transition-all duration-300 hover:scale-105"
      onClick={handlePublishClick}
      disabled={isPublishing}
    >
      {isPublishing ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          커밋 중...
        </>
      ) : (
        <>
          <GitCommit className="w-4 h-4" />
          버전 커밋
        </>
      )}
    </Button>
  );
}
