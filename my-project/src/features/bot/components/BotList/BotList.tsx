/**
 * BotList Component
 * Bot 목록을 보여주는 Presentational 컴포넌트
 */

import { BotCard, type BotCardData } from '../BotCard';
import { EmptyState } from '../EmptyState';
import type { Language, ViewMode } from '@/types';

interface BotListProps {
  bots: BotCardData[];
  searchQuery: string;
  viewMode: ViewMode;
  language: Language;
  isEmpty: boolean;
  hasResults: boolean;
  onDelete: (botId: string, botName: string) => void;
  onCreateBot: () => void;
}

/**
 * Bot 목록 표시 컴포넌트
 * - 빈 상태 (EmptyState)
 * - 검색 결과 없음
 * - Bot 목록 (Grid/List)
 */
export function BotList({
  bots,
  searchQuery,
  viewMode,
  language,
  isEmpty,
  hasResults,
  onDelete,
  onCreateBot,
}: BotListProps) {
  const translations = {
    en: {
      noBotsFound: 'No bots found matching',
    },
    ko: {
      noBotsFound: '와 일치하는 봇이 없습니다',
    },
  };

  const t = translations[language];

  // Empty state: 봇이 하나도 없음
  if (isEmpty) {
    return <EmptyState onCreateBot={onCreateBot} language={language} />;
  }

  // No results: 검색 결과 없음
  if (!hasResults) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p className="text-sm sm:text-base text-center px-4">
          {language === 'en'
            ? `No bots found matching "${searchQuery}"`
            : `"${searchQuery}"${t.noBotsFound}`}
        </p>
      </div>
    );
  }

  // Bot 목록 (Grid or List)
  return (
    <div
      className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          : 'flex flex-col gap-4'
      }
    >
      {bots.map((bot) => (
        <BotCard
          key={bot.id}
          bot={bot}
          onDelete={onDelete}
          viewMode={viewMode}
          language={language}
        />
      ))}
    </div>
  );
}
