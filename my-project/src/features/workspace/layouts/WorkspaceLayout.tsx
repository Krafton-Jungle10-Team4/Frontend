import { useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useUIStore } from '@/shared/stores/uiStore';
import { Header } from '../components/Header';
import { useWorkspaceStore } from '@/shared/stores/workspaceStore';

export function WorkspaceLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const { logout } = useAuth();
  const language = useUIStore((state) => state.language);
  const setLanguage = useUIStore((state) => state.setLanguage);
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);

  // Determine active tab from location
  const detectedTab = useMemo(() => {
    const path = location.pathname;
    if (path.includes('/explore')) return 'explore';
    if (path.includes('/studio')) return 'studio';
    if (path.includes('/knowledge')) return 'knowledge';
    if (path.includes('/tools')) return 'tools';
    return 'studio';
  }, [location.pathname]);

  const { activeTab, setActiveTab } = useWorkspaceStore();

  useEffect(() => {
    if (activeTab !== detectedTab) {
      setActiveTab(detectedTab);
    }
  }, [activeTab, detectedTab, setActiveTab]);

  const handleTabChange = (tab: 'explore' | 'studio' | 'knowledge' | 'tools') => {
    setActiveTab(tab);
    navigate(`/workspace/${tab}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/landing');
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        workspaceName={`${user?.name || 'Workspace'}`}
        userName={user?.name || 'User'}
        userEmail={user?.email || ''}
        language={language}
        onLanguageChange={setLanguage}
        onToggleSidebar={() => setSidebarOpen(true)}
        onLogout={handleLogout}
        onLogoClick={() => navigate('/landing')}
      />
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
