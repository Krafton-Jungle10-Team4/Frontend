import { useState } from 'react';
import { Bot as BotIcon, MoreVertical, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu';
import { formatTimeAgo } from '@/shared/utils/format';
import type { Language } from '@/shared/types';
import { TagBadge } from '@/shared/components/TagBadge';

export interface BotCardData {
  id: string;
  name: string;
  deployedDate: string;
  createdAt: Date;
  nodeCount: number;
  edgeCount: number;
  estimatedCost: number;
  tags?: string[];
}

interface BotCardProps {
  bot: BotCardData;
  onDelete: (botId: string, botName: string) => void;
  onClick?: (botId: string) => void;
  viewMode?: 'grid' | 'list';
  language: Language;
}

export function BotCard({
  bot,
  onDelete,
  onClick,
  viewMode = 'grid',
  language,
}: BotCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [suppressNextClick, setSuppressNextClick] = useState(false);
  const translations = {
    en: {
      created: 'Created',
      nodes: 'Nodes',
      edges: 'Edges',
      cost: 'Monthly Cost',
      delete: 'Delete',
    },
    ko: {
      created: '생성:',
      nodes: '노드 수',
      edges: '엣지 수',
      cost: '월 비용',
      delete: '삭제',
    },
  };

  const t = translations[language];
  const stats = [
    { label: t.nodes, value: bot.nodeCount },
    { label: t.edges, value: bot.edgeCount },
    { label: t.cost, value: `$${bot.estimatedCost.toFixed(2)}` },
  ];

  const renderStatItems = () =>
    stats.map((stat) => (
      <div key={stat.label}>
        <p className="text-[10px] uppercase tracking-wide text-gray-400">
          {stat.label}
        </p>
        <p className="text-sm font-semibold text-gray-900">{stat.value}</p>
      </div>
    ));

  const StatsRow = () => (
    <div className="hidden md:flex items-center gap-6 lg:gap-8 text-xs sm:text-sm text-gray-600">
      {renderStatItems()}
    </div>
  );

  const StatsGrid = () => (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div key={stat.label}>
          <p className="text-xs uppercase tracking-wide text-gray-400">
            {stat.label}
          </p>
          <p className="text-sm font-semibold text-gray-900">{stat.value}</p>
        </div>
      ))}
    </div>
  );

  const handleCardClick = () => {
    if (suppressNextClick) {
      setSuppressNextClick(false);
      return;
    }
    if (isMenuOpen) {
      return;
    }
    onClick?.(bot.id);
  };

  if (viewMode === 'list') {
    return (
      <div
        className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleCardClick}
      >
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
              {bot.tags && bot.tags.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {bot.tags.map((tag) => (
                    <TagBadge key={tag} tag={tag} />
                  ))}
                </div>
              )}
            </div>
          </div>
          <StatsRow />
          <DropdownMenu onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1 text-gray-400 hover:text-gray-600 rounded ml-4"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical size={18} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="gap-2 text-red-600"
                onSelect={(event) => {
                  event.stopPropagation();
                  setSuppressNextClick(true);
                  onDelete(bot.id, bot.name);
                }}
              >
                <Trash2 size={16} />
                {t.delete}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-4 w-full md:hidden">
          <StatsGrid />
        </div>
      </div>
    );
  }

  return (
    <div
      className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between">
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
        <DropdownMenu onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical size={18} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="gap-2 text-red-600"
              onSelect={(event) => {
                event.stopPropagation();
                setSuppressNextClick(true);
                onDelete(bot.id, bot.name);
              }}
            >
              <Trash2 size={16} />
              {t.delete}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {bot.tags && bot.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {bot.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}
      <div className="mt-4">
        <StatsGrid />
      </div>
    </div>
  );
}
