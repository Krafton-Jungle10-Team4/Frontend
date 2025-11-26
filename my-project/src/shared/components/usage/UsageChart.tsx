import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  type TooltipProps,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/card';
import { DailyUsage } from '@/shared/data/mockUsageData';

interface UsageChartProps {
  data: DailyUsage[];
  title?: string;
}

const formatCurrency = (value: number) => {
  if (!Number.isFinite(value)) return '$0.00';
  if (value >= 1) return `$${value.toFixed(2)}`;
  if (value >= 0.01) return `$${value.toFixed(3)}`;
  return `$${value.toFixed(5)}`;
};

const formatDateLabel = (value: string | number) => {
  const date = typeof value === 'string' ? value : String(value);
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });
};

const COST_COLOR = '#5f5bff'; // 브랜드 인디고
const COST_COLOR_DARK = '#3735c3';
const REQUEST_COLOR = '#7ac8ff'; // 브랜드 라이트 블루

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (!active || !payload?.length) return null;

  const requests = payload.find((p) => p.dataKey === 'requests')?.value as number | undefined;
  const cost = payload.find((p) => p.dataKey === 'cost')?.value as number | undefined;

  return (
    <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-lg shadow-indigo-100/70">
      <p className="text-xs font-semibold text-slate-900">
        {formatDateLabel(label)}
      </p>
      <div className="mt-2 space-y-1 text-xs text-slate-600">
        {requests !== undefined && (
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[hsl(var(--primary))]" />
            <span>요청: </span>
            <span className="font-semibold text-slate-900">
              {requests.toLocaleString()}
            </span>
          </div>
        )}
        {cost !== undefined && (
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-2))]" />
            <span>비용: </span>
            <span className="font-semibold text-emerald-600">
              {formatCurrency(cost)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export function UsageChart({ data, title = 'Usage Over Time' }: UsageChartProps) {
  const chartData = [...data]
    .sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    .map((item) => ({
      date: item.date,
      dateLabel: formatDateLabel(item.date),
      requests: item.requests,
      tokens: item.tokens,
      cost: item.cost,
    }));

  const hasData = chartData.length > 0;
  const maxRequests = chartData.reduce(
    (max, cur) => Math.max(max, cur.requests ?? 0),
    0
  );
  const maxCost = chartData.reduce(
    (max, cur) => Math.max(max, cur.cost ?? 0),
    0
  );

  const requestDomain: [number, number] = [
    0,
    maxRequests > 0 ? Math.ceil(maxRequests * 1.1) : 10,
  ];
  const costDomain: [number, number] = [
    0,
    maxCost > 0 ? maxCost * 1.2 : 1,
  ];

  if (!hasData) {
    return (
      <Card className="border border-indigo-50/80 shadow-md shadow-indigo-50/60">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-900">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[260px] items-center justify-center text-sm text-slate-500">
            표시할 사용량 데이터가 없습니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-indigo-50/80 shadow-md shadow-indigo-50/60">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 24, left: 4, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(55,53,195,0.12)" />
            <XAxis
              dataKey="dateLabel"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <YAxis
              yAxisId="left"
              domain={requestDomain}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickFormatter={(v) => Number(v).toLocaleString()}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={costDomain}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickFormatter={(v) => formatCurrency(Number(v))}
            />
            <Tooltip
              cursor={{ stroke: 'rgba(91,105,223,0.25)', strokeWidth: 2 }}
              content={<CustomTooltip />}
            />
            <Legend
              formatter={(value) => (
                <span className="text-xs text-slate-700">{value}</span>
              )}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cost"
              stroke={COST_COLOR_DARK}
              strokeWidth={2.4}
              dot={{ r: 3.5, strokeWidth: 0, fill: COST_COLOR }}
              activeDot={{ r: 6, fill: COST_COLOR_DARK, strokeWidth: 0 }}
              name="비용 추세"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="requests"
              stroke={REQUEST_COLOR}
              strokeWidth={2.8}
              dot={{ r: 3, strokeWidth: 0, fill: REQUEST_COLOR }}
              activeDot={{ r: 6, fill: REQUEST_COLOR, strokeWidth: 0 }}
              name="요청 추세"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
