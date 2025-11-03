import { useNavigate } from 'react-router-dom';

import { useAuth } from '@hooks/useAuth';
import { ROUTES } from '@constants/routes';

import './DashboardPage.css';

/**
 * 대시보드 페이지 (로그인 후 메인 화면)
 */
export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>RAG Platform</h1>
          <div className="user-info">
            {user.picture && (
              <img
                src={user.picture}
                alt={user.name}
                className="user-avatar"
              />
            )}
            <span className="user-name">{user.name}</span>
            <button onClick={handleLogout} className="logout-button">
              로그아웃
            </button>
          </div>
        </div>
      </header>

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
    </div>
  );
};
