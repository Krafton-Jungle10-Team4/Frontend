/**
 * PublishDropdown Component
 * 라이브러리에 게시 버튼
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@shared/components/button';
import { usePublishActions } from '../../hooks/usePublishActions';
import { LibrarySaveDialog } from '../dialogs/LibrarySaveDialog';
import { botApi } from '@/features/bot/api/botApi';
import { GitCommit } from 'lucide-react';

interface PublishDropdownProps {
  botId: string;
}

export function PublishDropdown({ botId }: PublishDropdownProps) {
  const navigate = useNavigate();
  const { publishUpdate } = usePublishActions(botId);

  const [isLibraryDialogOpen, setIsLibraryDialogOpen] = useState(false);
  const [botName, setBotName] = useState<string>('');

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

  // 라이브러리에 게시 버튼 클릭
  const handlePublishClick = () => {
    setIsLibraryDialogOpen(true);
  };

  // 커밋 성공 시 배포 관리 페이지로 이동
  const handlePublishSuccess = () => {
    navigate(`/workspace/deployment/${botId}`);
  };

  return (
    <>
      <Button
        variant="outline"
        className="!text-white !bg-blue-600 hover:!bg-blue-700 !border-blue-600 hover:!border-blue-700 transition-all duration-300 hover:scale-105"
        onClick={handlePublishClick}
      >
        <GitCommit className="w-4 h-4" />
        버전 커밋
      </Button>

      {/* LibrarySaveDialog */}
      <LibrarySaveDialog
        open={isLibraryDialogOpen}
        onOpenChange={setIsLibraryDialogOpen}
        onPublish={publishUpdate}
        defaultBotName={botName}
        botId={botId}
        onSuccess={handlePublishSuccess}
      />
    </>
  );
}
