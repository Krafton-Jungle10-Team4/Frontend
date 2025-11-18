import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { workflowApi } from '../api/workflowApi';
import type {
  WorkflowLogFilters,
  WorkflowTokenStatistics,
} from '../types/log.types';

interface UseTokenStatisticsOptions {
  botId?: string | null;
  filters: WorkflowLogFilters;
  runId?: string | null;
  enabled?: boolean;
  refetchIntervalMs?: number | false;
}

const EMPTY_STATS: WorkflowTokenStatistics = {
  total_tokens: 0,
  total_runs: 0,
  average_tokens_per_run: 0,
  by_node_type: {},
  by_date: [],
};

export function useTokenStatistics({
  botId,
  filters,
  runId,
  enabled = true,
  refetchIntervalMs,
}: UseTokenStatisticsOptions) {
  const startDate = filters.startDate?.toISOString();
  const endDate = filters.endDate?.toISOString();

  const queryKey = useMemo(
    () => [
      'workflow-token-stats',
      botId,
      runId ?? null,
      filters.status ?? 'all',
      startDate ?? null,
      endDate ?? null,
      filters.searchQuery ?? null,
    ],
    [botId, endDate, filters.searchQuery, filters.status, runId, startDate]
  );

  const query = useQuery({
    queryKey,
    enabled: Boolean(botId) && enabled,
    queryFn: () =>
      workflowApi.getTokenStatistics(botId!, {
        runId: runId ?? undefined,
        startDate,
        endDate,
      }),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchInterval:
      typeof refetchIntervalMs === 'number' ? refetchIntervalMs : false,
  });

  const stats = query.data ?? EMPTY_STATS;
  const hasData =
    stats.total_runs > 0 || Object.keys(stats.by_node_type).length > 0;

  return {
    stats,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    hasData,
  };
}
