/**
 * PublishDropdown Component
 * Dify 스타일 게시하기 드롭다운 메뉴
 */

import { useState, useEffect } from 'react';
import { ChevronDown, Play, Code, Compass, FileCode } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shared/components/dropdown-menu';
import { Button } from '@shared/components/button';
import { Badge } from '@shared/components/badge';
import { useDeploymentStore } from '@/features/deployment/stores/deploymentStore';
import { DEPLOYMENT_STATUS_LABELS } from '@/features/deployment/types/deployment';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@shared/components/tooltip';
import { usePublishActions } from '../../hooks/usePublishActions';
import { LibrarySaveDialog } from '../dialogs/LibrarySaveDialog';
import { DeployConfirmDialog } from '../dialogs/DeployConfirmDialog';
import { botApi } from '@/features/bot/api/botApi';

interface PublishDropdownProps {
  botId: string;
}

/**
 * 상대 시간 포맷 (예: "3시간 전")
 */
function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return '정보 없음';

  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return '방금 전';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}분 전`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}시간 전`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}일 전`;
  }
}

/**
 * 배포 상태별 배지 스타일
 */
function getStatusVariant(status: string | null) {
  switch (status) {
    case 'published':
      return 'default';
    case 'draft':
      return 'secondary';
    case 'suspended':
      return 'destructive';
    default:
      return 'outline';
  }
}

export function PublishDropdown({ botId }: PublishDropdownProps) {
  const { deployment, fetchDeployment } = useDeploymentStore();
  const {
    publishUpdate,
    runApp,
    embedWebsite,
    openExplore,
    apiReference,
    canRunApp,
    isDeployDialogOpen,
    setIsDeployDialogOpen,
    publishedVersionId,
  } = usePublishActions(botId);

  const [isOpen, setIsOpen] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [isLibraryDialogOpen, setIsLibraryDialogOpen] = useState(false);
  const [botName, setBotName] = useState<string>('');

  // 현재 봇의 deployment인지 확인
  const currentBotDeployment = deployment?.bot_id === botId ? deployment : null;

  // 봇 정보 조회
  useEffect(() => {
    const fetchBotInfo = async () => {
      try {
        const bot = await botApi.getBot(botId);
        setBotName(bot.bot_name || '');
      } catch (error) {
        console.error('Failed to fetch bot info:', error);
      }
    };
    if (botId) {
      fetchBotInfo();
    }
  }, [botId]);

  // 드롭다운이 열릴 때만 배포 정보 로드
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && !hasFetched) {
      fetchDeployment(botId);
      setHasFetched(true);
    }
  };

  // 업데이트 게시 버튼 클릭 시 LibrarySaveDialog 열기
  const handlePublishClick = () => {
    setIsOpen(false); // 드롭다운 닫기
    setIsLibraryDialogOpen(true); // 다이얼로그 열기
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            className="!bg-blue-600 !text-white hover:!bg-blue-700 flex items-center gap-1.5"
          >
            게시하기
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64">
          {/* 상단: 배포 상태 및 업데이트 버튼 */}
          <div className="p-3 border-b">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={getStatusVariant(currentBotDeployment?.status || null)}>
                {currentBotDeployment?.status
                  ? DEPLOYMENT_STATUS_LABELS[currentBotDeployment.status]
                  : '미배포'}
              </Badge>
              {currentBotDeployment?.version && (
                <span className="text-xs text-muted-foreground">
                  v{currentBotDeployment.version}
                </span>
              )}
            </div>

            {currentBotDeployment?.updated_at && (
              <p className="text-xs text-muted-foreground mb-2">
                발행일 {formatRelativeTime(currentBotDeployment.updated_at)}
              </p>
            )}

            <Button
              size="sm"
              className="w-full"
              onClick={handlePublishClick}
            >
              라이브러리에 게시
            </Button>
          </div>

          <DropdownMenuSeparator />

          {/* 메뉴 항목들 */}
          {canRunApp ? (
            <DropdownMenuItem onClick={runApp}>
              <Play className="mr-2 h-4 w-4" />앱 실행
            </DropdownMenuItem>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem
                  onSelect={(event) => event.preventDefault()}
                  className="cursor-not-allowed opacity-70"
                >
                  <Play className="mr-2 h-4 w-4" />앱 실행 (게시 필요)
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent>
                봇을 게시하고 Widget Key를 발급받으면 실행할 수 있습니다.
              </TooltipContent>
            </Tooltip>
          )}

          <DropdownMenuItem onClick={embedWebsite}>
            <Code className="mr-2 h-4 w-4" />
            사이트에 삽입
          </DropdownMenuItem>

          <DropdownMenuItem onClick={openExplore}>
            <Compass className="mr-2 h-4 w-4" />
            Explore에서 열기
          </DropdownMenuItem>

          <DropdownMenuItem onClick={apiReference}>
            <FileCode className="mr-2 h-4 w-4" />
            API 참조 접근
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
