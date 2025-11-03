/**
 * Dashboard 통계 타입
 */
export type DashboardStats = {
  totalBots: number;
  activeBots: number;
  totalQueries: number;
  totalMessages: number;
  totalErrors: number;
  avgResponseTime: number;
};

/**
 * Dashboard 활동 로그 타입
 */
export type ActivityLog = {
  id: string;
  botName: string;
  action: 'created' | 'updated' | 'deleted' | 'queried';
  timestamp: string;
  details?: string;
};

/**
 * Dashboard 성능 메트릭 타입
 */
export type PerformanceMetric = {
  date: string;
  queries: number;
  avgResponseTime: number;
  successRate: number;
};

/**
 * Dashboard 데이터 타입
 */
export type DashboardData = {
  stats: DashboardStats;
  recentActivities: ActivityLog[];
  performanceMetrics: PerformanceMetric[];
};
