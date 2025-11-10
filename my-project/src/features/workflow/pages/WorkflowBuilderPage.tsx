import { useState, useMemo } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Home, Spline, Activity, FileText } from 'lucide-react';
import Workflow from '../components/WorkflowBuilder';
import WorkflowSlimSidebar, {
  type SidebarView,
} from '../components/sidebar/WorkflowSlimSidebar';
import MonitoringView from '../components/views/MonitoringView';
import LogsView from '../components/views/LogsView';
import { ChatPreviewPanel } from '@/features/bot/pages/ChatPreviewPanel';
import { useApp } from '@/features/bot/contexts/AppContext';
import { useWorkflowStore } from '../stores/workflowStore';
import { TopNavigation, WorkspaceSidebar, type MenuItem } from '@/widgets';
import { useAuthStore } from '@/features/auth';
import { useUIStore } from '@/shared/stores/uiStore';

const WorkflowWithChat = () => {
  const { language } = useApp();
  const { botId } = useParams<{ botId: string }>();
  const location = useLocation();
  const { isChatVisible } = useWorkflowStore();

  // Get bot data from URL params and navigation state
  const state = location.state as { botName?: string } | null;
  const botName = state?.botName || 'AI Support Agent';

  // Bot ID 확인
  console.log('[Workflow] Current Bot ID:', botId);

  return (
    <div className="flex h-full w-full">
      {/* Left: Workflow Graph */}
      <div className="flex-1 relative">
        {/* props 없음, 내부에서 botId로 로드 */}
        <Workflow />
      </div>

      {/* Right: Chatbot Preview (Preview 버튼 클릭 시에만 표시) */}
      {isChatVisible && (
        <>
          {/* Divider */}
          <div className="w-px bg-gray-200 dark:bg-gray-700" />

          {/* Chatbot Preview */}
          <div className="w-96 flex-shrink-0">
            <ChatPreviewPanel botId={botId} botName={botName} language={language} />
          </div>
        </>
      )}
    </div>
  );
};

/**
 * 워크플로우 빌더 페이지
 * Dify 스타일의 사이드바와 멀티뷰 지원
 */
export const WorkflowBuilderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { botId } = useParams<{ botId: string }>();
  const [activeView, setActiveView] = useState<SidebarView>('flow');

  // Auth store - 사용자 정보
  const user = useAuthStore((state) => state.user);
  const userName = user?.name || 'User';
  const userEmail = user?.email || '';

  // UI store - 언어 설정 및 사이드바 상태
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
  const language = useUIStore((state) => state.language);
  const setLanguage = useUIStore((state) => state.setLanguage);

  // Bot 이름 가져오기 (navigation state에서)
  const state = location.state as { botName?: string } | null;
  const botName = state?.botName || 'Bot Workflow';

  const handleLogout = async () => {
    const { logout } = await import('@/features/auth');
    try {
      await logout();
      useAuthStore.getState().reset();
      navigate('/landing');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Workflow-specific menu items
  const workflowMenuItems = useMemo((): MenuItem[] => {
    const labels =
      language === 'ko'
        ? ['홈', '오케스트레이션', '모니터링', '로그 및 어노테이션']
        : ['Home', 'Orchestration', 'Monitoring', 'Logs & Annotations'];

    return [
      {
        id: 'home',
        icon: Home,
        label: labels[0],
        onClick: () => navigate('/home'),
      },
      {
        id: 'flow',
        icon: Spline,
        label: labels[1],
        onClick: () => setActiveView('flow'),
      },
      {
        id: 'monitoring',
        icon: Activity,
        label: labels[2],
        onClick: () => setActiveView('monitoring'),
      },
      {
        id: 'logs',
        icon: FileText,
        label: labels[3],
        onClick: () => setActiveView('logs'),
      },
    ];
  }, [language, navigate]);

  const renderContent = () => {
    switch (activeView) {
      case 'flow':
        return <WorkflowWithChat />;
      case 'monitoring':
        return <MonitoringView />;
      case 'logs':
        return <LogsView />;
      default:
        return <WorkflowWithChat />;
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Workspace Sidebar */}
      <WorkspaceSidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName={userName}
        currentPage={botName}
        language={language}
        menuItems={workflowMenuItems}
        activeItemId={activeView}
      />

      {/* Workflow Sidebar - 전체 높이 */}
      <WorkflowSlimSidebar
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <TopNavigation
          onToggleSidebar={() => setSidebarOpen(true)}
          userName={userName}
          userEmail={userEmail}
          onHomeClick={() => navigate('/home')}
          language={language}
          onLanguageChange={setLanguage}
          onLogout={handleLogout}
          currentPage={botName}
        />

        {/* Content */}
        <div className="flex-1 overflow-hidden">{renderContent()}</div>
      </div>
    </div>
  );
};
