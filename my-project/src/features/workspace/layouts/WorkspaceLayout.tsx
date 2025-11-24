import { useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Header } from '../components/Header';
import { WorkspaceSidebar } from '../components/WorkspaceSidebar';
import { useWorkspaceStore } from '@/shared/stores/workspaceStore';
import { useState } from 'react';

export function WorkspaceLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
    <div className="flex h-screen bg-[#f1f2f5]">
      <WorkspaceSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isOpen={isSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-auto">
        <Header
          activeTab={activeTab}
          onTabChange={handleTabChange}
          userName={user?.name || 'User'}
          userEmail={user?.email || ''}
          onLogout={handleLogout}
          onLogoClick={() => navigate('/landing')}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          isSidebarOpen={isSidebarOpen}
        />
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
