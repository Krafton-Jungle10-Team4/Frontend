import { useAuth } from '@/features/auth';

/**
 * 대시보드 메인 컨텐츠 컴포넌트
 */
export const DashboardContent = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <main className="dashboard-content">
      <div className="welcome-section">
        <h2>환영합니다, {user.name}님!</h2>
        <p>로그인에 성공했습니다.</p>
      </div>

      <div className="user-details">
        <h3>사용자 정보</h3>
        <div className="detail-item">
          <span className="detail-label">이메일:</span>
          <span className="detail-value">{user.email}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">역할:</span>
          <span className="detail-value">{user.role}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">ID:</span>
          <span className="detail-value">{user.id}</span>
        </div>
      </div>
    </main>
  );
};
