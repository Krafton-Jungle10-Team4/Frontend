import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CreditCard } from 'lucide-react';
import { useBotStore } from '@/features/bot/stores/botStore';
import { EmptyState } from '@/shared/components/EmptyState';
import { Card } from '@/shared/components/card';
import { Skeleton } from '@/shared/components/skeleton';
import { Button } from '@/shared/components/button';
import { Switch } from '@/shared/components/switch';
import { WorkflowLogFilters } from '../logs/WorkflowLogFilters';
import { WorkflowLogRow } from '../logs/WorkflowLogRow';
import { useWorkflowLogs } from '../../hooks/useWorkflowLogs';
import type {
  WorkflowLogFilters as WorkflowLogFiltersType,
  WorkflowRunStatus,
  WorkflowRunSummary,
} from '../../types/log.types';

const parseDateParam = (value: string | null) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const isWorkflowStatus = (
  value: string | null
): value is WorkflowRunStatus => {
  return value === 'running' || value === 'succeeded' || value === 'failed';
};

const DEFAULT_FILTERS: WorkflowLogFiltersType = {
  status: 'all',
};

const LogsView = () => {
  const navigate = useNavigate();
  const botId = useBotStore((state) => state.selectedBotId);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const filters = useMemo<WorkflowLogFiltersType>(() => {
    const statusParam = searchParams.get('status');
    const parsedStatus = isWorkflowStatus(statusParam)
      ? statusParam
      : undefined;
    return {
      status: parsedStatus ?? 'all',
      startDate: parseDateParam(searchParams.get('start')),
      endDate: parseDateParam(searchParams.get('end')),
      searchQuery: searchParams.get('q') ?? undefined,
    };
  }, [searchParams]);

  const {
    runs,
    selectedRunId,
    selectedRun,
    isLoading,
    isFetchingMore,
    error,
    hasMore,
    loadMore,
    selectRun,
    refresh,
  } = useWorkflowLogs({
    botId,
    filters,
  });

  const updateSearchParams = useCallback(
    (updater: (params: URLSearchParams) => void) => {
      const nextParams = new URLSearchParams(searchParams);
      updater(nextParams);
      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const handleFiltersChange = useCallback(
    (nextFilters: WorkflowLogFiltersType) => {
      updateSearchParams((params) => {
        if (nextFilters.status && nextFilters.status !== 'all') {
          params.set('status', nextFilters.status);
        } else {
          params.delete('status');
        }

        if (nextFilters.startDate) {
          params.set('start', nextFilters.startDate.toISOString());
        } else {
          params.delete('start');
        }

        if (nextFilters.endDate) {
          params.set('end', nextFilters.endDate.toISOString());
        } else {
          params.delete('end');
        }

        if (nextFilters.searchQuery) {
          params.set('q', nextFilters.searchQuery);
        } else {
          params.delete('q');
        }
      });
    },
    [updateSearchParams]
  );

  const handleResetFilters = useCallback(() => {
    handleFiltersChange(DEFAULT_FILTERS);
  }, [handleFiltersChange]);

  const handleRunSelect = useCallback(
    (run: WorkflowRunSummary) => {
      selectRun(run.id);
    },
    [selectRun]
  );

  useEffect(() => {
    if (!isRealtimeEnabled) return;
    const intervalId = window.setInterval(() => {
      refresh();
    }, 15_000);
    return () => window.clearInterval(intervalId);
  }, [isRealtimeEnabled, refresh]);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const target = sentinelRef.current;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        loadMore();
      }
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const renderSkeletons = () => (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-32 w-full" />
      ))}
    </div>
  );

  if (!botId) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <EmptyState
          icon={Loader2}
          title="서비스를 선택해 주세요"
          description="좌측 사이드바에서 로그를 확인할 서비스를 먼저 선택해야 합니다."
        />
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto bg-gray-50 p-6">
      <div className="mx-auto flex h-full max-w-[60%] flex-col gap-6">
        <header>
          <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-foreground">
              Workflow Logs
            </h1>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 gap-1 px-2 text-xs"
              onClick={() => navigate('/billing-settings#daily-usage')}
            >
              <CreditCard className="h-3.5 w-3.5" />
              총 비용
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            상태, 기간, 키워드로 실행을 필터링하고 상세 패널에서 토큰 및 노드 타임라인을 확인하세요.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <Switch
              checked={isRealtimeEnabled}
              onCheckedChange={setIsRealtimeEnabled}
              id="realtime-toggle"
            />
            <label
              htmlFor="realtime-toggle"
              className="text-sm text-muted-foreground"
            >
              실시간 모드 {isRealtimeEnabled ? '켜짐 (15초 간격)' : '꺼짐'}
            </label>
          </div>
        </header>

        <WorkflowLogFilters
          filters={filters}
          onChange={handleFiltersChange}
          onReset={handleResetFilters}
          isDisabled={isLoading && runs.length === 0}
        />

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="flex-1 space-y-4">
            {isLoading && runs.length === 0 ? (
              renderSkeletons()
            ) : runs.length === 0 ? (
              <Card className="rounded-lg p-8 text-center text-muted-foreground transition-all hover:scale-[1.005]">
                조건에 맞는 실행 로그가 없습니다.
              </Card>
            ) : (
              runs.map((run) => (
                <WorkflowLogRow
                  key={run.id}
                  run={run}
                  isActive={selectedRunId === run.id}
                  onSelect={handleRunSelect}
                  botId={botId}
                />
              ))
            )}

            <div ref={sentinelRef} />
            {hasMore && !isFetchingMore && (
              <Button
                type="button"
                variant="outline"
                onClick={loadMore}
                className="w-full"
              >
                더 불러오기
              </Button>
            )}
            {isFetchingMore && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                다음 실행을 불러오는 중입니다...
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default memo(LogsView);
