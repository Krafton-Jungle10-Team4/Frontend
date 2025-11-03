import { DashboardHeader } from '../components/DashboardHeader';
import { DashboardContent } from '../components/DashboardContent';
import { DashboardStats } from '../components/DashboardStats';
import { useDashboard } from '../hooks/useDashboard';

/**
 * 대시보드 페이지 (로그인 후 메인 화면)
 */
export const DashboardPage = () => {
  const { stats, loading } = useDashboard({ autoFetch: false });

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <DashboardStats stats={stats} loading={loading} />
      <DashboardContent />
    </div>
  );
};
