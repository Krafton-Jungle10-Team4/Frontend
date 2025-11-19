/**
 * PublishDropdown Component
 * 라이브러리에 게시 버튼
 */

import { useState, useEffect } from 'react';
import { Button } from '@shared/components/button';
import { usePublishActions } from '../../hooks/usePublishActions';
import { LibrarySaveDialog } from '../dialogs/LibrarySaveDialog';
import { DeployConfirmDialog } from '../dialogs/DeployConfirmDialog';
import { botApi } from '@/features/bot/api/botApi';

interface PublishDropdownProps {
  botId: string;
}

export function PublishDropdown({ botId }: PublishDropdownProps) {
  const {
    publishUpdate,
    fetchDeployment,
    isDeployDialogOpen,
    setIsDeployDialogOpen,
    publishedVersionId,
  } = usePublishActions(botId);

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

  return (
    <>
      <Button
        variant="default"
        className="!bg-blue-600 !text-white hover:!bg-blue-700"
        onClick={handlePublishClick}
      >
        라이브러리에 게시
      </Button>

      {/* LibrarySaveDialog */}
      <LibrarySaveDialog
        open={isLibraryDialogOpen}
        onOpenChange={setIsLibraryDialogOpen}
        onPublish={publishUpdate}
        defaultBotName={botName}
      />

      {/* DeployConfirmDialog */}
      {publishedVersionId && (
        <DeployConfirmDialog
          open={isDeployDialogOpen}
          onOpenChange={setIsDeployDialogOpen}
          botId={botId}
          versionId={publishedVersionId}
          onDeploySuccess={() => {
            // 배포 성공 시 배포 정보 refetch
            fetchDeployment(botId);
          }}
        />
      )}
    </>
  );
}
