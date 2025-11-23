import { useState, useMemo } from 'react';
import { Bot as BotIcon, MoreVertical, Trash2, Rocket, Settings, History, Plus, Tag as TagIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu';
import { Badge } from '@/shared/components/badge';
import { formatTimeAgo } from '@/shared/utils/format';
import type { Language } from '@/shared/types';
import { VersionBadge } from '@/features/workflow/components/VersionBadge';

export interface BotCardData {
  id: string;
  name: string;
  deployedDate: string;
  createdAt: Date;
  nodeCount: number;
  edgeCount: number;
  estimatedCost: number;
  tags?: string[];
  latestVersion?: string;
  isDeployed?: boolean;
  previousVersionCount?: number;
}

interface BotCardProps {
  bot: BotCardData;
  onDelete: (botId: string, botName: string) => void;
  onClick?: (botId: string) => void;
  onDeploy?: (botId: string) => void;
  onNavigateDeployment?: (botId: string) => void;
  onVersionHistory?: (botId: string) => void;
  onEditTags?: (botId: string, currentTags: string[]) => void;
  viewMode?: 'grid' | 'list';
  language?: Language;
}

const StatsGrid = ({ stats, bot }: { stats: Array<{ label: string; value: string | number; isVersion?: boolean }>; bot: BotCardData }) => (
  <div className="grid grid-cols-3 gap-4">
    {stats.map((stat) => (
      <div key={stat.label}>
        <p className="text-xs uppercase tracking-wide text-gray-400">
          {stat.label}
        </p>
        {stat.isVersion ? (
          <VersionBadge version={stat.value as string} className="mt-1" />
        ) : (
          <p className="text-sm font-semibold text-gray-900">{stat.value}</p>
        )}
      </div>
    ))}
  </div>
);

function BotCard({
  bot,
  onDelete,
  onClick,
  onDeploy,
  onNavigateDeployment,
  onVersionHistory,
  onEditTags,
  viewMode = 'grid',
  language = 'ko',
}: BotCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [suppressNextClick, setSuppressNextClick] = useState(false);
  const translations = {
    ko: {
      created: '생성:',
      nodes: '노드 수',
      edges: '엣지 수',
      version: '버전',
      deploy: '배포',
      deploymentManage: '배포 관리',
      delete: '삭제',
      versionHistory: '버전 히스토리',
      addTag: '태그 추가',
    },
  };

  const t = translations.ko;
  const stats = useMemo(
    () => [
      { label: t.nodes, value: bot.nodeCount },
      { label: t.edges, value: bot.edgeCount },
      { label: t.version, value: bot.latestVersion || 'v1.0', isVersion: true },
    ],
    [t.nodes, t.edges, t.version, bot.nodeCount, bot.edgeCount, bot.latestVersion]
  );

  const statItems = useMemo(
    () =>
      stats.map((stat) => (
        <div key={stat.label}>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">
            {stat.label}
          </p>
          {stat.isVersion ? (
            <VersionBadge version={stat.value as string} className="mt-1" />
          ) : (
            <p className="text-sm font-semibold text-gray-900">{stat.value}</p>
          )}
        </div>
      )),
    [stats]
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
        className={`relative border border-gray-300 rounded-lg p-4 sm:p-6 hover:shadow-md hover:border-gray-400 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
          bot.isDeployed ? 'border-t-4 border-t-transparent bg-gradient-to-r from-teal-400 to-teal-500 bg-clip-border' : 'border-t-4 border-t-gray-300'
        }`}
        onClick={handleCardClick}
      >
        <div className="bg-white rounded-lg -m-[1px] p-4 sm:p-6">
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
              {/* 태그 영역 */}
              {onEditTags && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {bot.tags && bot.tags.length > 0 ? (
                    bot.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs cursor-pointer hover:bg-gray-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditTags(bot.id, bot.tags || []);
                        }}
                      >
                        <TagIcon className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTags(bot.id, []);
                      }}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 border border-dashed border-gray-300 rounded hover:border-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      {t.addTag}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-xs sm:text-sm text-gray-600">
            {statItems}
          </div>
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
                className="gap-2"
                onSelect={(event) => {
                  event.stopPropagation();
                  setSuppressNextClick(true);
                  onDeploy?.(bot.id);
                }}
              >
                <Rocket size={16} />
                {t.deploy}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2"
                onSelect={(event) => {
                  event.stopPropagation();
                  setSuppressNextClick(true);
                  onNavigateDeployment?.(bot.id);
                }}
              >
                <Settings size={16} />
                {t.deploymentManage}
              </DropdownMenuItem>
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
          <StatsGrid stats={stats} bot={bot} />
        </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative border border-gray-300 rounded-lg p-4 sm:p-6 hover:shadow-md hover:border-gray-400 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
        bot.isDeployed ? 'border-t-4 border-t-transparent bg-gradient-to-r from-teal-400 to-teal-500 bg-clip-border' : 'border-t-4 border-t-gray-300'
      }`}
      onClick={handleCardClick}
    >
      <div className="bg-white rounded-lg -m-[1px] p-4 sm:p-6">
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
            {/* 태그 영역 */}
            {onEditTags && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {bot.tags && bot.tags.length > 0 ? (
                  bot.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs cursor-pointer hover:bg-gray-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTags(bot.id, bot.tags || []);
                      }}
                    >
                      <TagIcon className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditTags(bot.id, []);
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 border border-dashed border-gray-300 rounded hover:border-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    {t.addTag}
                  </button>
                )}
              </div>
            )}
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
              className="gap-2"
              onSelect={(event) => {
                event.stopPropagation();
                setSuppressNextClick(true);
                onDeploy?.(bot.id);
              }}
            >
              <Rocket size={16} />
              {t.deploy}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2"
              onSelect={(event) => {
                event.stopPropagation();
                setSuppressNextClick(true);
                onNavigateDeployment?.(bot.id);
              }}
            >
              <Settings size={16} />
              {t.deploymentManage}
            </DropdownMenuItem>
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
      <div className="mt-3">
        <StatsGrid stats={stats} bot={bot} />
      </div>
      {onVersionHistory && (
        <div className="mt-4 flex items-center justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onVersionHistory(bot.id);
            }}
            className="flex items-center gap-1 text-xs text-teal-500 hover:text-teal-600 transition-colors"
          >
            <History className="h-3 w-3" />
            <span>{t.versionHistory}</span>
          </button>
        </div>
      )}
      </div>
    </div>
  );
}

export { BotCard };
