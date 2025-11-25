import { useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Header } from '../components/Header';
import { useWorkspaceStore } from '@/shared/stores/workspaceStore';

export function WorkspaceLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const { logout } = useAuth();

  // Determine active tab from location
  const detectedTab = useMemo(() => {
    const path = location.pathname;
    if (path.includes('/marketplace')) return 'marketplace';
    if (path.includes('/studio')) return 'studio';
    if (path.includes('/knowledge')) return 'knowledge';
    if (path.includes('/library')) return 'library';
    return 'studio';
  }, [location.pathname]);

  const { activeTab, setActiveTab } = useWorkspaceStore();

  useEffect(() => {
    if (activeTab !== detectedTab) {
      setActiveTab(detectedTab);
    }
  }, [activeTab, detectedTab, setActiveTab]);

  const handleTabChange = (tab: 'marketplace' | 'studio' | 'knowledge' | 'library') => {
    setActiveTab(tab);
    navigate(`/workspace/${tab}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/landing');
  };

  return (
    <div className="flex h-screen bg-[#f8f9fb] overflow-x-hidden">
      <div className="flex-1 flex flex-col overflow-auto overflow-x-hidden">
        <Header
          activeTab={activeTab}
          onTabChange={handleTabChange}
          userName={user?.name || 'User'}
          userEmail={user?.email || ''}
          onLogout={handleLogout}
          onLogoClick={() => navigate('/landing')}
        />
        <div className="flex-1 overflow-auto overflow-x-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
