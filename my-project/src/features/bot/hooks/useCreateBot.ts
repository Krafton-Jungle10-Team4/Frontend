/**
 * useCreateBot Hook
 * Bot 생성 로직을 캡슐화한 커스텀 훅
 */

import { useState, useCallback } from 'react';
import { botApi } from '../api/botApi';
import { useBotStore } from '../stores/botStore';
import type { CreateBotDto, Bot } from '../types/bot.types';

interface UseCreateBotResult {
  createBot: (dto: CreateBotDto) => Promise<Bot>;
  isCreating: boolean;
  error: Error | null;
  reset: () => void;
}

/**
 * Bot 생성 기능을 제공하는 커스텀 훅
 */
export function useCreateBot(): UseCreateBotResult {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const addBot = useBotStore((state) => state.addBot);

  const createBot = useCallback(
    async (dto: CreateBotDto): Promise<Bot> => {
      setIsCreating(true);
      setError(null);

      try {
        const newBot = await botApi.create(dto);
        addBot(newBot);
        return newBot;
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setIsCreating(false);
      }
    },
    [addBot]
  );

  const reset = useCallback(() => {
    setIsCreating(false);
    setError(null);
  }, []);

  return {
    createBot,
    isCreating,
    error,
    reset,
  };
}
