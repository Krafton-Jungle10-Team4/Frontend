/**
 * useFilteredBots Hook
 * Bot 목록 필터링 로직을 캡슐화한 커스텀 훅
 */

import { useMemo } from 'react';
import { useBotStore } from '../stores/botStore';
import type { Bot } from '../types/bot.types';

export interface BotCardData {
  id: string;
  name: string;
  deployedDate: string;
  createdAt: Date;
  nodeCount: number;
  edgeCount: number;
  estimatedCost: number;
}

interface UseFilteredBotsOptions {
  searchQuery?: string;
}

/**
 * Bot 타입을 BotCardData 타입으로 변환
 */
function convertToBotCardData(bot: Bot): BotCardData {
  const derivedNodeCount =
    bot.workflow?.nodes?.length ??
    Math.max(3, Math.round(bot.messagesCount / 40) || 3);
  const derivedEdgeCount =
    bot.workflow?.edges?.length ??
    Math.max(2, Math.round(derivedNodeCount * 0.6));
  const estimatedCost = Number(
    (
      Math.max(bot.messagesCount, 10) * 0.02 +
      derivedEdgeCount * 0.15
    ).toFixed(2)
  );

  return {
    id: bot.id,
    name: bot.name,
    deployedDate: bot.createdAt,
    createdAt: new Date(bot.createdAt),
    nodeCount: derivedNodeCount,
    edgeCount: derivedEdgeCount,
    estimatedCost,
  };
}

/**
 * Bot 목록을 필터링하는 커스텀 훅
 * @param options - 필터링 옵션 (searchQuery)
 * @returns 필터링된 Bot 목록 (BotCardData 형태)
 */
export function useFilteredBots(options: UseFilteredBotsOptions = {}) {
  const { searchQuery = '' } = options;
  const bots = useBotStore((state) => state.bots);

  const filteredBots = useMemo(() => {
    let filtered = bots;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = bots.filter((bot) => bot.name.toLowerCase().includes(query));
    }

    // Bot 타입을 BotCardData 타입으로 변환
    return filtered.map(convertToBotCardData);
  }, [bots, searchQuery]);

  return {
    bots: filteredBots,
    totalCount: bots.length,
    filteredCount: filteredBots.length,
    hasResults: filteredBots.length > 0,
    isEmpty: bots.length === 0,
  };
}
