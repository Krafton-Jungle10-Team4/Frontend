import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { workflowApi } from '../api/workflowApi';
import type {
  WorkflowLogFilters,
  WorkflowRunSummary,
} from '../types/log.types';

const DEFAULT_PAGE_SIZE = 20;

interface UseWorkflowLogsParams {
  botId?: string | null;
  filters: WorkflowLogFilters;
  pageSize?: number;
}

const createInitialPagination = (limit: number) => ({
  limit,
  offset: 0,
  total: 0,
});

export function useWorkflowLogs({
  botId,
  filters,
  pageSize = DEFAULT_PAGE_SIZE,
}: UseWorkflowLogsParams) {
  const [runs, setRuns] = useState<WorkflowRunSummary[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState(() =>
    createInitialPagination(pageSize)
  );

  const requestIdRef = useRef(0);
  const offsetRef = useRef(0);

  const buildFilterParams = useCallback(() => {
    const params: Record<string, string | number> = {
      limit: pageSize,
      offset: offsetRef.current,
    };

    if (filters.status && filters.status !== 'all') {
      params.status = filters.status;
    }
    if (filters.startDate) {
      params.start_date = filters.startDate.toISOString();
    }
    if (filters.endDate) {
      params.end_date = filters.endDate.toISOString();
    }
    if (filters.searchQuery) {
      params.search = filters.searchQuery.trim();
    }

    return params;
  }, [filters, pageSize]);

  const fetchRuns = useCallback(
    async (append = false) => {
      if (!botId) {
        setRuns([]);
        setSelectedRunId(null);
        setPagination(createInitialPagination(pageSize));
        return;
      }

      const requestId = ++requestIdRef.current;
      const nextOffset = append ? offsetRef.current + pageSize : 0;
      offsetRef.current = nextOffset;

      const params = {
        ...buildFilterParams(),
        limit: pageSize,
        offset: nextOffset,
      };

      setError(null);
      if (append) {
        setIsFetchingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const response = await workflowApi.listWorkflowRuns(botId, params);

        if (requestId !== requestIdRef.current) {
          return;
        }

        offsetRef.current = response.offset ?? nextOffset;

        setRuns((prev) =>
          append ? [...prev, ...response.runs] : response.runs
        );
        setPagination({
          limit: response.limit ?? pageSize,
          offset: response.offset ?? nextOffset,
          total: response.total ?? response.runs.length,
        });

        if (!append) {
          setSelectedRunId((current) => {
            if (current && response.runs.some((run) => run.id === current)) {
              return current;
            }
            return response.runs[0]?.id ?? null;
          });
        }
      } catch (err) {
        console.error('Failed to load workflow logs:', err);
        if (requestId === requestIdRef.current) {
          setError('실행 로그를 불러오는 중 문제가 발생했습니다.');
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
          setIsFetchingMore(false);
        }
      }
    },
    [botId, buildFilterParams, pageSize]
  );

  useEffect(() => {
    offsetRef.current = 0;
    if (!botId) {
      setRuns([]);
      setSelectedRunId(null);
      setPagination(createInitialPagination(pageSize));
      return;
    }
    fetchRuns(false);
  }, [botId, fetchRuns, pageSize]);

  const hasMore = useMemo(() => {
    if (pagination.total === 0) return false;
    return runs.length < pagination.total;
  }, [pagination.total, runs.length]);

  const loadMore = useCallback(() => {
    if (isLoading || isFetchingMore || !hasMore) return;
    fetchRuns(true);
  }, [fetchRuns, hasMore, isFetchingMore, isLoading]);

  const refresh = useCallback(() => {
    fetchRuns(false);
  }, [fetchRuns]);

  const selectRun = useCallback((runId: string | null) => {
    setSelectedRunId(runId);
  }, []);

  const selectedRun = useMemo(
    () => runs.find((run) => run.id === selectedRunId) ?? null,
    [runs, selectedRunId]
  );

  return {
    runs,
    selectedRunId,
    selectedRun,
    isLoading,
    isFetchingMore,
    error,
    hasMore,
    loadMore,
    refresh,
    selectRun,
    pagination,
  };
}
