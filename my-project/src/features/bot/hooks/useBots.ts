/**
 * useBots Hook
 * Bot 목록 조회 및 관리를 위한 커스텀 훅
 */

import { useEffect } from 'react';
import { useBotStore } from '../stores/botStore';
import { botApi } from '../api/botApi';

interface UseBotsOptions {
  searchQuery?: string;
  autoFetch?: boolean;
}

/**
 * Bot 목록을 조회하고 관리하는 커스텀 훅
 */
export function useBots(options: UseBotsOptions = {}) {
  const { searchQuery, autoFetch = true } = options;

  const { bots, loading, error, setBots, setLoading, setError } = useBotStore();

  useEffect(() => {
    if (!autoFetch) return;

    const fetchBots = async () => {
      setLoading(true);
      try {
        const data = await botApi.getAll({ search: searchQuery });
        setBots(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchBots();
  }, [searchQuery, autoFetch, setBots, setLoading, setError]);

  return { bots, loading, error };
}
