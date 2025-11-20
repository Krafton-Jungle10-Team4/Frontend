import { useState, memo, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Workflow from '../components/WorkflowBuilder';
import WorkflowSlimSidebar, {
  type SidebarView,
} from '../components/sidebar/WorkflowSlimSidebar';
import MonitoringView from '../components/views/MonitoringView';
import LogsView from '../components/views/LogsView';
import { LegacyDocumentsView } from '@/features/documents/pages/DocumentsPage';
import { ChatPreviewPanel } from '@/features/bot/pages/ChatPreviewPanel';
import { useApp } from '@/features/bot/contexts/AppContext';
import { useWorkflowStore } from '../stores/workflowStore';
import { TopNavigation } from '@/widgets';
import { useAuthStore } from '@/features/auth';
import { useUIStore } from '@/shared/stores/uiStore';
import { useBotStore } from '@/features/bot/stores/botStore';
import { useAsyncDocumentStore } from '@/features/documents/stores/documentStore.async';
import { NavigationTabs } from '@/features/workspace/components/NavigationTabs';
import { useWorkspaceStore } from '@/shared/stores/workspaceStore';

// Memoized wrapper to prevent unnecessary re-renders
const KnowledgeView = memo(({ botId }: { botId?: string }) => {
  return <LegacyDocumentsView botId={botId} />;
});
KnowledgeView.displayName = 'KnowledgeView';

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
            <ChatPreviewPanel
              botId={botId}
              botName={botName}
              language={language}
            />
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
  const setSelectedBotId = useBotStore((state) => state.setSelectedBotId);
  const fetchDocuments = useAsyncDocumentStore(
    (state) => state.fetchDocuments
  );

  // Auth store - 사용자 정보
  const user = useAuthStore((state) => state.user);
  const userName = user?.name || 'User';
  const userEmail = user?.email || '';

  // UI store - 언어 설정
  const language = useUIStore((state) => state.language);
  const setLanguage = useUIStore((state) => state.setLanguage);

  // Keep bot store in sync with the workflow route param so other features (documents, knowledge nodes)
  // know which bot is currently being configured.
  useEffect(() => {
    if (botId) {
      setSelectedBotId(botId);
    } else {
      setSelectedBotId(null);
    }
  }, [botId, setSelectedBotId]);

  // 문서 스토어를 미리 로드해 지식 노드/패널에서 바로 사용할 수 있도록 함
  useEffect(() => {
    if (!botId) return;

    fetchDocuments({ botId }).catch((error) => {
      console.error('Failed to prefetch documents for workflow builder:', error);
    });
  }, [botId, fetchDocuments]);

  // 챗봇 생성 후 성공 토스트 표시
  useEffect(() => {
    const state = location.state as { botName?: string; showSuccessToast?: boolean } | null;
    if (state?.showSuccessToast) {
      const message = language === 'ko'
        ? '챗봇이 성공적으로 생성되었습니다'
        : 'Bot created successfully';
      toast.success(message);

      // state 정리하여 새로고침 시 토스트가 다시 표시되지 않도록
      window.history.replaceState({}, document.title);
    }
  }, [location.state, language]);

  // Workspace store - 탭 상태
  const workspaceActiveTab = useWorkspaceStore((state) => state.activeTab);
  const setWorkspaceActiveTab = useWorkspaceStore((state) => state.setActiveTab);

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

  const handleWorkspaceTabChange = (tab: 'marketplace' | 'studio' | 'knowledge' | 'tools') => {
    setWorkspaceActiveTab(tab);
    navigate(`/workspace/${tab}`);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'flow':
        return <WorkflowWithChat />;
      case 'knowledge':
        return <KnowledgeView botId={botId} />;
      case 'monitoring':
        return <MonitoringView />;
      case 'logs':
        return <LogsView />;
      default:
        return <WorkflowWithChat />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Workflow Sidebar (플로팅 위젯) */}
      <WorkflowSlimSidebar
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <TopNavigation
          onToggleSidebar={() => {}}
          userName={userName}
          userEmail={userEmail}
          onHomeClick={() => navigate('/workspace/studio')}
          language={language}
          onLanguageChange={setLanguage}
          onLogout={handleLogout}
          currentPage={botName}
          showSidebarToggle={false}
          navigationTabs={
            <NavigationTabs
              activeTab={workspaceActiveTab}
              onTabChange={handleWorkspaceTabChange}
              language={language}
            />
          }
        />

        {/* Content */}
        <div className="flex-1 overflow-hidden">{renderContent()}</div>
      </div>
    </div>
  );
};
