import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { ROUTES } from '@/shared/constants/routes';

/**
 * 대시보드 헤더 컴포넌트
 */
export const DashboardHeader = () => {
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
    return null;
  }

  return (
    <header className="dashboard-header">
      <div className="header-content">
        <h1>RAG Platform</h1>
        <div className="user-info">
          {user.picture && (
            <img src={user.picture} alt={user.name} className="user-avatar" />
          )}
          <span className="user-name">{user.name}</span>
          <button onClick={handleLogout} className="logout-button">
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
};
