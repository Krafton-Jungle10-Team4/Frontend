# Dashboard Feature

대시보드 및 통계 정보를 표시하는 Feature 모듈입니다. 봇 통계, 활동 내역, 성능 지표 등을 시각화하여 제공합니다.

## 📁 디렉토리 구조

```
dashboard/
├── __tests__/              # 단위 테스트
│   └── dashboardStore.test.ts
├── api/                    # API 통신 레이어
│   └── dashboardApi.ts
├── components/             # Dashboard 관련 컴포넌트
│   ├── DashboardHeader.tsx
│   ├── DashboardStats.tsx
│   ├── DashboardContent.tsx
│   ├── StatsCard.tsx
│   └── ActivityChart.tsx
├── hooks/                  # Custom hooks
│   ├── useDashboard.ts
│   └── useDashboardStats.ts
├── pages/                  # 페이지 컴포넌트
│   └── DashboardPage.tsx
├── stores/                 # Zustand store
│   └── dashboardStore.ts
├── types/                  # TypeScript 타입 정의
│   └── dashboard.types.ts
├── routes.tsx              # Dashboard Feature 라우트 정의
├── index.ts                # Public API
└── README.md
```

## 🎯 주요 기능

### 1. 통계 대시보드

- **Bot 통계**: 전체/활성 Bot 수, 메시지 처리량
- **성능 지표**: 평균 응답 시간, 에러율
- **활동 추이**: 시간대별/일별 활동 그래프
- **사용량 통계**: API 호출 횟수, 토큰 사용량

### 2. 실시간 모니터링

- **라이브 지표**: 실시간 업데이트되는 주요 지표
- **알림**: 임계값 초과 시 알림 표시
- **상태 표시**: 시스템 상태 실시간 모니터링

### 3. 데이터 시각화

- **차트**: Chart.js 기반 그래프 시각화
- **테이블**: 상세 데이터 테이블 뷰
- **필터링**: 기간별, 타입별 데이터 필터링

## 📦 Public API

### Components

```typescript
import {
  DashboardHeader, // 대시보드 헤더
  DashboardStats, // 통계 카드
  DashboardContent, // 대시보드 콘텐츠
  StatsCard, // 개별 통계 카드
  ActivityChart, // 활동 차트
} from '@/features/dashboard';
```

### Hooks

```typescript
import {
  useDashboard, // 대시보드 상태 및 액션
  useDashboardStats, // 통계 데이터 조회
} from '@/features/dashboard';
```

### Store

```typescript
import {
  useDashboardStore, // Dashboard store hook
} from '@/features/dashboard';
```

### Types

```typescript
import type {
  DashboardStats, // 통계 데이터 타입
  DashboardState, // Dashboard store 상태
  TimeRange, // 시간 범위
  ChartData, // 차트 데이터 타입
} from '@/features/dashboard';
```

### Pages

```typescript
import {
  DashboardPage, // 대시보드 페이지
} from '@/features/dashboard';
```

## 🔗 라우트

Dashboard Feature는 다음 라우트를 제공합니다:

```typescript
/dashboard            → DashboardPage (대시보드 메인)
```

## 🪝 Custom Hooks 사용 예시

### useDashboard

```typescript
function DashboardOverview() {
  const {
    stats,
    loading,
    error,
    refreshStats
  } = useDashboard({
    autoFetch: true,
    refreshInterval: 30000, // 30초마다 갱신
  });

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <DashboardStats stats={stats} />
      <button onClick={refreshStats}>Refresh</button>
    </div>
  );
}
```

### useDashboardStats

```typescript
function StatsDisplay() {
  const {
    stats,
    loading,
    fetchStats
  } = useDashboardStats();

  useEffect(() => {
    fetchStats({ timeRange: 'last7days' });
  }, [fetchStats]);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <p>Total Bots: {stats?.totalBots}</p>
      <p>Active Bots: {stats?.activeBots}</p>
      <p>Total Messages: {stats?.totalMessages}</p>
    </div>
  );
}
```

## 🏪 Store 사용 예시

### 기본 사용

```typescript
function DashboardMetrics() {
  const stats = useDashboardStore((state) => state.stats);
  const isLoading = useDashboardStore((state) => state.isLoading);
  const setStats = useDashboardStore((state) => state.setStats);

  useEffect(() => {
    async function loadStats() {
      const data = await dashboardApi.getStats();
      setStats(data);
    }
    loadStats();
  }, [setStats]);

  if (isLoading) return <Skeleton />;

  return (
    <div>
      <h2>Dashboard Metrics</h2>
      <p>Total Bots: {stats?.totalBots}</p>
      <p>Average Response Time: {stats?.avgResponseTime}s</p>
    </div>
  );
}
```

### 에러 처리

```typescript
function DashboardWithError() {
  const error = useDashboardStore((state) => state.error);
  const clearError = useDashboardStore((state) => state.clearError);

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={clearError}>Retry</button>
      </div>
    );
  }

  return <DashboardContent />;
}
```

## 📊 통계 카드 예시

### StatsCard 사용

```typescript
function MetricsOverview() {
  const stats = useDashboardStore((state) => state.stats);

  return (
    <div className="stats-grid">
      <StatsCard
        title="Total Bots"
        value={stats?.totalBots || 0}
        icon={<BotIcon />}
        trend={{ value: 12, direction: 'up' }}
      />
      <StatsCard
        title="Active Bots"
        value={stats?.activeBots || 0}
        icon={<ActivityIcon />}
        trend={{ value: 5, direction: 'up' }}
      />
      <StatsCard
        title="Total Messages"
        value={stats?.totalMessages || 0}
        icon={<MessageIcon />}
        trend={{ value: 23, direction: 'up' }}
      />
      <StatsCard
        title="Error Rate"
        value={`${((stats?.totalErrors || 0) / (stats?.totalMessages || 1) * 100).toFixed(2)}%`}
        icon={<ErrorIcon />}
        trend={{ value: 2, direction: 'down' }}
        variant="danger"
      />
    </div>
  );
}
```

## 📈 차트 사용 예시

### ActivityChart

```typescript
function ActivityTrend() {
  const [timeRange, setTimeRange] = useState<TimeRange>('last7days');
  const { chartData, loading } = useActivityChart(timeRange);

  return (
    <div>
      <div className="chart-controls">
        <button onClick={() => setTimeRange('last24hours')}>24 Hours</button>
        <button onClick={() => setTimeRange('last7days')}>7 Days</button>
        <button onClick={() => setTimeRange('last30days')}>30 Days</button>
      </div>
      {loading ? (
        <Skeleton height={300} />
      ) : (
        <ActivityChart data={chartData} />
      )}
    </div>
  );
}
```

## 🧪 테스트

### 테스트 실행

```bash
# Dashboard Feature 테스트만 실행
npm test -- dashboard

# Watch mode
npm test -- dashboard --watch

# Coverage
npm test -- dashboard --coverage
```

### 테스트 구조

- **dashboardStore.test.ts**: Dashboard store의 모든 기능 테스트
  - 통계 데이터 관리
  - 로딩 상태 관리
  - 에러 처리
  - 통계 계산

## 🔧 개발 가이드

### 새로운 통계 위젯 추가하기

1. **타입 정의** (`types/dashboard.types.ts`)

```typescript
export interface UserActivityStats {
  activeUsers: number;
  newUsers: number;
  userRetention: number;
}

export interface DashboardStats {
  // ... 기존 필드들
  userActivity: UserActivityStats;
}
```

2. **컴포넌트 생성** (`components/UserActivityWidget.tsx`)

```typescript
export function UserActivityWidget({ data }: { data: UserActivityStats }) {
  return (
    <div className="widget">
      <h3>User Activity</h3>
      <div className="widget-body">
        <StatsCard title="Active Users" value={data.activeUsers} />
        <StatsCard title="New Users" value={data.newUsers} />
        <StatsCard
          title="Retention"
          value={`${data.userRetention}%`}
        />
      </div>
    </div>
  );
}
```

3. **API 추가** (`api/dashboardApi.ts`)

```typescript
export const dashboardApi = {
  // ... 기존 함수들
  getUserActivity: async (): Promise<UserActivityStats> => {
    const { data } = await apiClient.get('/dashboard/user-activity');
    return data;
  },
};
```

4. **Hook 생성** (`hooks/useUserActivity.ts`)

```typescript
export function useUserActivity() {
  const [data, setData] = useState<UserActivityStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const result = await dashboardApi.getUserActivity();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch user activity:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { data, loading };
}
```

5. **Public API 노출** (`index.ts`)

```typescript
export { UserActivityWidget } from './components/UserActivityWidget';
export { useUserActivity } from './hooks/useUserActivity';
export type { UserActivityStats } from './types/dashboard.types';
```

### 실시간 업데이트 구현

```typescript
// hooks/useRealtimeDashboard.ts
export function useRealtimeDashboard(refreshInterval = 5000) {
  const setStats = useDashboardStore((state) => state.setStats);
  const setLoading = useDashboardStore((state) => state.setLoading);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await dashboardApi.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    }

    // 초기 로드
    fetchStats();

    // 주기적 업데이트
    const interval = setInterval(fetchStats, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, setStats, setLoading]);
}
```

### 주의사항

⚠️ **성능 최적화**

- 대량의 데이터 로딩 시 페이지네이션 구현
- 차트 렌더링 최적화 (React.memo, useMemo 활용)
- 불필요한 API 호출 방지 (디바운싱, 캐싱)

⚠️ **데이터 정합성**

- 실시간 업데이트와 수동 갱신 간 충돌 방지
- 낙관적 업데이트 시 롤백 처리
- 타임존 고려한 날짜 처리

⚠️ **UX 고려사항**

- 로딩 상태 명확하게 표시
- 에러 발생 시 재시도 옵션 제공
- 데이터 없을 때 적절한 Empty State 표시

## 📚 관련 문서

- [전체 아키텍처 문서](../../ARCHITECTURE.md)
- [Chart.js 공식 문서](https://www.chartjs.org/)
- [API 명세](./api/README.md)
- [테스트 가이드](../../TESTING.md)

## 🤝 기여하기

1. Feature 브랜치 생성 (`feature/dashboard-new-widget`)
2. 변경사항 커밋
3. 테스트 작성 및 실행
4. Pull Request 생성

---

**Last Updated**: 2025-11-03
**Maintainer**: Frontend Team
