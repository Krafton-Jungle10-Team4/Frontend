import type { DashboardStats as StatsType } from '../types/dashboard.types';

/**
 * DashboardStats Props
 */
type DashboardStatsProps = {
  stats: StatsType | null;
  loading?: boolean;
};

/**
 * 대시보드 통계 컴포넌트
 */
export const DashboardStats = ({ stats, loading }: DashboardStatsProps) => {
  if (loading) {
    return (
      <div className="dashboard-stats">
        <div className="stats-loading">통계를 불러오는 중...</div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="dashboard-stats">
      <div className="stat-card">
        <h3>전체 봇</h3>
        <p className="stat-value">{stats.totalBots}</p>
      </div>
      <div className="stat-card">
        <h3>활성 봇</h3>
        <p className="stat-value">{stats.activeBots}</p>
      </div>
      <div className="stat-card">
        <h3>총 쿼리</h3>
        <p className="stat-value">{stats.totalQueries.toLocaleString()}</p>
      </div>
      <div className="stat-card">
        <h3>평균 응답 시간</h3>
        <p className="stat-value">{stats.avgResponseTime.toFixed(2)}ms</p>
      </div>
    </div>
  );
};
