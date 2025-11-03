import { Bot as BotIcon, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu';
import { formatTimeAgo } from '@/shared/utils/format';
import type { Language } from '@/shared/types';

export interface BotCardData {
  id: string;
  name: string;
  deployedDate: string;
  messages: number;
  messageChange: string;
  errors: number;
  errorStatus: string;
  createdAt: Date;
}

interface BotCardProps {
  bot: BotCardData;
  onDelete: (botId: string, botName: string) => void;
  viewMode?: 'grid' | 'list';
  language: Language;
}

export function BotCard({
  bot,
  onDelete,
  viewMode = 'grid',
  language,
}: BotCardProps) {
  const translations = {
    en: {
      created: 'Created',
      messages: 'Messages',
      errors: 'Errors',
      edit: 'Edit',
      delete: 'Delete',
    },
    ko: {
      created: '생성:',
      messages: '메시지',
      errors: '오류',
      edit: '수정',
      delete: '삭제',
    },
  };

  const t = translations[language];

  if (viewMode === 'list') {
    return (
      <div className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-teal-400 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <BotIcon className="text-white" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-gray-900 text-sm sm:text-base truncate">
                {bot.name}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                {t.created} {formatTimeAgo(bot.createdAt, language)}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <div>
                <div className="text-sm text-gray-600 mb-1">
                  {bot.messages} {t.messages}
                </div>
                <div className="text-xs text-green-600">
                  {bot.messageChange}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">
                  {bot.errors} {t.errors}
                </div>
                <div className="text-xs text-gray-500">{bot.errorStatus}</div>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 text-gray-400 hover:text-gray-600 rounded ml-4">
                <MoreVertical size={18} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="gap-2">
                <Pencil size={16} />
                {t.edit}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 text-red-600"
                onClick={() => onDelete(bot.id, bot.name)}
              >
                <Trash2 size={16} />
                {t.delete}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-teal-400 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <BotIcon className="text-white" size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-gray-900 text-sm sm:text-base truncate">
              {bot.name}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              {t.created} {formatTimeAgo(bot.createdAt, language)}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
              <MoreVertical size={18} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="gap-2">
              <Pencil size={16} />
              {t.edit}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 text-red-600"
              onClick={() => onDelete(bot.id, bot.name)}
            >
              <Trash2 size={16} />
              {t.delete}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="text-sm text-gray-600 mb-1">
            {bot.messages} {t.messages}
          </div>
          <div className="text-xs text-green-600">{bot.messageChange}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-1">
            {bot.errors} {t.errors}
          </div>
          <div className="text-xs text-gray-500">{bot.errorStatus}</div>
        </div>
      </div>
    </div>
  );
}
