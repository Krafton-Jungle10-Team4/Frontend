import { useEffect, useMemo, useState, memo } from 'react';
import { DollarSign, Activity, Zap } from 'lucide-react';
import { StatCard } from '@/shared/components/usage/UsageStats';
import { UsageChart } from '@/shared/components/usage/UsageChart';
import {
  calculateSummary,
  type DailyUsage,
} from '@/shared/data/mockUsageData';
import { workflowApi } from '../../api/workflowApi';
import { useBotStore } from '@/features/bot/stores/botStore';

/**
 * 모니터링 뷰 - API 사용량 및 비용 통계
 */
const MonitoringView = () => {
  const botId = useBotStore((state) => state.selectedBotId);
  const [usageData, setUsageData] = useState<DailyUsage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!botId) return;

    setLoading(true);
    setError(null);
    workflowApi
      .listWorkflowRuns(botId, { limit: 100 })
      .then((response) => {
        const grouped = groupRunsByDay(response.runs);
        setUsageData(grouped);
      })
      .catch((err) => {
        console.error('Failed to load runs:', err);
        setError('실행 이력을 불러오지 못했습니다.');
        setUsageData([]);
      })
      .finally(() => setLoading(false));
  }, [botId]);

  const summary = useMemo(() => calculateSummary(usageData), [usageData]);

  return (
    <div className="h-full w-full overflow-auto bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl">Usage</h1>
          <p className="text-muted-foreground">
            Monitor workflow executions, token usage, and cost estimates
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {!botId && (
          <div className="mb-6 text-sm text-muted-foreground">
            워크플로우 사용 현황을 보려면 먼저 봇을 선택하세요.
          </div>
        )}
        {error && (
          <div className="mb-6 text-sm text-red-500">
            {error}
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Total Requests"
            value={summary.totalRequests.toLocaleString()}
            icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title="Total Tokens"
            value={summary.totalTokens.toLocaleString()}
            icon={<Zap className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title="Total Cost"
            value={`$${summary.totalCost.toFixed(2)}`}
            icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title="Avg Requests/Week"
            value={summary.averageRequestsPerDay.toLocaleString()}
            icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          />
        </div>

        {loading ? (
          <div className="text-center text-sm text-muted-foreground">
            실행 이력을 불러오는 중입니다...
          </div>
        ) : (
          <UsageChart data={usageData} />
        )}
      </div>
    </div>
  );
};

export default memo(MonitoringView);

function groupRunsByDay(runs: Array<{ started_at: string; total_tokens?: number | null }>): DailyUsage[] {
  const grouped: Record<string, DailyUsage> = {};

  runs.forEach((run) => {
    const dateKey = run.started_at
      ? run.started_at.slice(0, 10)
      : new Date().toISOString().slice(0, 10);

    if (!grouped[dateKey]) {
      grouped[dateKey] = {
        date: dateKey,
        requests: 0,
        tokens: 0,
        cost: 0,
      };
    }

    grouped[dateKey].requests += 1;
    grouped[dateKey].tokens += run.total_tokens ?? 0;
    grouped[dateKey].cost += ((run.total_tokens ?? 0) / 1000) * 0.002;
  });

  return Object.values(grouped).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}
