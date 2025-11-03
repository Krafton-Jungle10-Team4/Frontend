import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import type { Language } from '@/types';

interface WorkspaceHeaderProps {
  onCreateBot: () => void;
  userName?: string;
  botCount?: number;
  maxBots?: number;
  language: Language;
}

export function WorkspaceHeader({ onCreateBot, userName = 'User', botCount = 0, maxBots = 5, language }: WorkspaceHeaderProps) {
  const userInitial = userName.charAt(0).toUpperCase();
  const isLimitReached = botCount >= maxBots;

  const translations = {
    en: {
      workspace: "'s Workspace",
      createBot: '+ Create Bot',
      limitTooltip: 'You have reached the limit of bots you can create.',
      deleteInstruction: 'Please delete the bot and try again.'
    },
    ko: {
      workspace: '의 워크스페이스',
      createBot: '+ 챗봇 생성',
      limitTooltip: '생성 가능한 챗봇 개수를 초과했습니다.',
      deleteInstruction: '챗봇을 삭제한 후 다시 시도해주세요.'
    }
  };

  const t = translations[language];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-teal-400 to-teal-500 rounded-xl flex-shrink-0"></div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl truncate">{userName}{t.workspace}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Avatar className="w-8 h-8 sm:w-10 sm:h-10 hidden sm:flex">
            <AvatarFallback className="bg-teal-500 text-white">{userInitial}</AvatarFallback>
          </Avatar>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button 
                    onClick={onCreateBot} 
                    disabled={isLimitReached}
                    className="bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base px-3 sm:px-4"
                  >
                    <span className="hidden sm:inline">{t.createBot}</span>
                    <span className="sm:hidden">+ Bot</span>
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
