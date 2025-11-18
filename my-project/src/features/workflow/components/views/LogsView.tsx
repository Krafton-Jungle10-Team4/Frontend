import {
  Suspense,
  lazy,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
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

const WorkflowLogDetailPanel = lazy(() =>
  import('../logs/WorkflowLogDetailPanel').then((module) => ({
    default: module.WorkflowLogDetailPanel,
  }))
);

const LogsView = () => {
  const botId = useBotStore((state) => state.selectedBotId);
  const [searchParams, setSearchParams] = useSearchParams();
  const runParam = searchParams.get('run');
  const isDetailOpen = Boolean(runParam);
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
      updateSearchParams((params) => {
        params.set('run', run.id);
      });
    },
    [updateSearchParams]
  );

  const handlePanelOpenChange = (next: boolean) => {
    if (!next) {
      updateSearchParams((params) => {
        params.delete('run');
      });
    }
  };

  useEffect(() => {
    if (runParam) {
      selectRun(runParam);
    }
  }, [runParam, selectRun]);

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
          title="봇을 선택해 주세요"
          description="좌측 사이드바에서 로그를 확인할 봇을 먼저 선택해야 합니다."
        />
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto bg-gray-50 p-6">
      <div className="mx-auto flex h-full max-w-7xl flex-col gap-6">
        <header>
          <p className="text-sm font-medium text-primary">Workflow Logs</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">
            실행 기록과 입력/출력을 한눈에
          </h1>
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

        <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {isLoading && runs.length === 0 ? (
              renderSkeletons()
            ) : runs.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                조건에 맞는 실행 로그가 없습니다.
              </Card>
            ) : (
              runs.map((run) => (
                <WorkflowLogRow
                  key={run.id}
                  run={run}
                  isActive={selectedRunId === run.id}
                  onSelect={handleRunSelect}
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

          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-foreground">
                실행 선택
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                왼쪽 실행을 클릭하면 상세 패널이 열리며, 입력/출력과 노드 타임라인을 확인할 수 있습니다.
              </p>
            </Card>
          </div>
        </div>
      </div>

      <Suspense fallback={null}>
        <WorkflowLogDetailPanel
          botId={botId}
          runId={selectedRun?.id ?? null}
          open={isDetailOpen}
          onOpenChange={handlePanelOpenChange}
          filters={filters}
          isRealtime={isRealtimeEnabled}
        />
      </Suspense>
    </div>
  );
};

export default memo(LogsView);
