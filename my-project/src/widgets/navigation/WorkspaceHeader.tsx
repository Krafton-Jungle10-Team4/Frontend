import { UserCircle } from 'lucide-react';
import { Button } from '@/shared/components/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/tooltip';

type Language = 'en' | 'ko';

interface WorkspaceHeaderProps {
  onCreateBot: () => void;
  isCreatingBot?: boolean;
  userName?: string;
  botCount?: number;
  maxBots?: number;
  language: Language;
}

export function WorkspaceHeader({
  onCreateBot,
  isCreatingBot = false,
  userName = 'User',
  botCount = 0,
  maxBots = 5,
  language,
}: WorkspaceHeaderProps) {
  const isLimitReached = botCount >= maxBots;

  const translations = {
    en: {
      workspace: "'s Workspace",
      createBot: '+ Create Bot',
      creating: 'Creating...',
      limitTooltip: 'You have reached the limit of bots you can create.',
      deleteInstruction: 'Please delete the bot and try again.',
    },
    ko: {
      workspace: '의 워크스페이스',
      createBot: '+ 봇 생성',
      creating: '생성 중...',
      limitTooltip: '생성 가능한 봇 개수를 초과했습니다.',
      deleteInstruction: '봇을 삭제한 후 다시 시도해주세요.',
    },
  };

  const t = translations[language];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-teal-400 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <UserCircle className="text-white" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl truncate">
              {userName}
              {t.workspace}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    onClick={onCreateBot}
                    disabled={isLimitReached || isCreatingBot}
                    aria-busy={isCreatingBot}
                    className="bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base px-3 sm:px-4"
                  >
                    <span className="hidden sm:inline">
                      {isCreatingBot ? t.creating : t.createBot}
                    </span>
                    <span className="sm:hidden">
                      {isCreatingBot ? t.creating : '+ Bot'}
                    </span>
                  </Button>
                </div>
              </TooltipTrigger>
              {isLimitReached && (
                <TooltipContent>
                  <p className="max-w-xs text-sm">
                    {t.limitTooltip} <strong>{t.deleteInstruction}</strong>
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
