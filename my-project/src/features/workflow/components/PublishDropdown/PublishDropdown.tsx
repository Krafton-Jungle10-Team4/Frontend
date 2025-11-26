/**
 * PublishDropdown Component
 * 라이브러리에 게시 버튼 및 배포 관리 드롭다운
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@shared/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shared/components/dropdown-menu';
import { usePublishActions } from '../../hooks/usePublishActions';
import { botApi } from '@/features/bot/api/botApi';
import { GitCommit, Loader2, ChevronDown, Rocket } from 'lucide-react';
import { DeploymentModal } from '@/features/deployment/components/DeploymentModal';

interface PublishDropdownProps {
  botId: string;
}

export function PublishDropdown({ botId }: PublishDropdownProps) {
  const navigate = useNavigate();
  const { publishUpdate } = usePublishActions(botId);

  const [botName, setBotName] = useState<string>('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeploymentModalOpen, setIsDeploymentModalOpen] = useState(false);

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
    <>
      <div className="inline-flex items-stretch h-10 rounded-md overflow-hidden border border-blue-700">
        {/* 버전 커밋 버튼 */}
        <button
          onClick={handlePublishClick}
          disabled={isPublishing}
          className="relative px-4 !text-white !bg-blue-700 overflow-hidden group transition-all duration-300 flex items-center gap-2 border-0"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-gray-800 to-blue-700 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
          {isPublishing ? (
            <>
              <Loader2 className="relative z-10 w-4 h-4 animate-spin" />
              <span className="relative z-10">커밋 중...</span>
            </>
          ) : (
            <>
              <GitCommit className="relative z-10 w-4 h-4" />
              <span className="relative z-10">버전 커밋</span>
            </>
          )}
        </button>

        {/* 세로 구분선 wrapper */}
        <div className="bg-blue-700 flex items-center justify-center">
          <div className="w-px h-6 bg-white/30"></div>
        </div>

        {/* 드롭다운 트리거 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              disabled={isPublishing}
              className="relative px-3 !text-white !bg-blue-700 overflow-hidden group transition-all duration-300 flex items-center border-0"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-gray-800 to-blue-700 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
              <ChevronDown className="relative z-10 w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => setIsDeploymentModalOpen(true)}
              className="cursor-pointer"
            >
              <Rocket className="w-4 h-4 mr-2" />
              배포 관리
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 배포 관리 모달 */}
      <DeploymentModal
        open={isDeploymentModalOpen}
        onOpenChange={setIsDeploymentModalOpen}
        botId={botId}
      />
    </>
  );
}
