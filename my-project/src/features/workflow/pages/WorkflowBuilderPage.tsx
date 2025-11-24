import { useState, memo, useEffect } from 'react';
import { useLocation, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import Workflow from '../components/WorkflowBuilder';
import WorkflowSlimSidebar, {
  type SidebarView,
} from '../components/sidebar/WorkflowSlimSidebar';
import LogsView from '../components/views/LogsView';
import { ChatPreviewPanel } from '@/features/bot/pages/ChatPreviewPanel';
import { useApp } from '@/features/bot/contexts/AppContext';
import { useWorkflowStore } from '../stores/workflowStore';
import { TopNavigation } from '@/widgets';
import { useAuthStore } from '@/features/auth';
import { useUIStore } from '@/shared/stores/uiStore';
import { useBotStore } from '@/features/bot/stores/botStore';
import { useAsyncDocumentStore } from '@/features/documents/stores/documentStore.async';
import { DocumentStatus } from '@/features/documents/types/document.types';
import { useWorkspaceStore } from '@/shared/stores/workspaceStore';
import { useSlackStore } from '@/features/integrations/stores/slackStore';

const WorkflowWithChat = () => {
  const { language } = useApp();
  const { botId } = useParams<{ botId: string }>();
  const location = useLocation();
  const { isChatVisible } = useWorkflowStore();
  const getBotById = useBotStore((state) => state.getBotById);
  const [botName, setBotName] = useState<string>('Bot Workflow');

  // Bot 정보를 API에서 가져오기
  useEffect(() => {
    const fetchBotInfo = async () => {
      if (!botId) return;

      // 마켓플레이스에서 접근할 때는 봇 정보 조회 건너뛰기
      const searchParams = new URLSearchParams(location.search);
      const source = searchParams.get('source');
      if (source === 'marketplace') {
        // 마켓플레이스에서는 state나 기본값 사용
        const state = location.state as { botName?: string } | null;
        setBotName(state?.botName || 'Marketplace Workflow');
        return;
      }

      try {
        const { botApi } = await import('@/features/bot/api/botApi');
        const botData = await botApi.getById(botId);
        setBotName(botData.name);
      } catch (error) {
        console.error('Failed to fetch bot info:', error);
        // 실패 시 스토어나 state에서 가져오기
        const state = location.state as { botName?: string } | null;
        const storeBot = getBotById(botId);
        setBotName(storeBot?.name || state?.botName || 'Bot Workflow');
      }
    };

    fetchBotInfo();
  }, [botId, getBotById, location.state, location.search]);

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
  const [searchParams, setSearchParams] = useSearchParams();
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

  // Slack store - 연동 상태 새로고침
  const fetchBotIntegration = useSlackStore((state) => state.fetchBotIntegration);

  // Keep bot store in sync with the workflow route param so other features (documents, knowledge nodes)
  // know which bot is currently being configured.
  useEffect(() => {
    if (botId) {
      setSelectedBotId(botId);
    } else {
      setSelectedBotId(null);
    }
  }, [botId, setSelectedBotId]);

  // Slack OAuth 성공 후 연동 상태 새로고침
  useEffect(() => {
    const slackSuccess = searchParams.get('slack');
    const slackError = searchParams.get('slack_error');

    if (slackSuccess === 'success' && botId) {
      console.log('[WorkflowBuilder] Slack OAuth success detected, refreshing integration');
      toast.success('Slack 연동이 완료되었습니다!');
      
      // Slack 연동 상태 새로고침
      fetchBotIntegration(botId);
      
      // URL에서 파라미터 제거
      searchParams.delete('slack');
      setSearchParams(searchParams, { replace: true });
    } else if (slackError) {
      console.error('[WorkflowBuilder] Slack OAuth error:', slackError);
      toast.error(`Slack 연동 실패: ${slackError}`);
      
      // URL에서 파라미터 제거
      searchParams.delete('slack_error');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, botId, fetchBotIntegration]);

  // 문서 스토어를 미리 로드해 지식 노드/패널에서 바로 사용할 수 있도록 함
  // ✅ 완료된 문서만 조회하여 불필요한 폴링 방지
  useEffect(() => {
    if (!botId) return;

    fetchDocuments({ 
      botId,
      status: DocumentStatus.DONE, // 완료된 문서만 조회
      limit: 100,
      offset: 0,
    }).catch((error) => {
      console.error('Failed to prefetch documents for workflow builder:', error);
    });
  }, [botId, fetchDocuments]);

  // 챗봇 생성 후 성공 토스트 표시
  useEffect(() => {
    const state = location.state as { botName?: string; showSuccessToast?: boolean } | null;
    if (state?.showSuccessToast) {
      const message = language === 'ko'
        ? '서비스가 성공적으로 생성되었습니다'
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
          userName={userName}
          userEmail={userEmail}
          onHomeClick={() => navigate('/workspace/studio')}
          language={language}
          onLanguageChange={setLanguage}
          onLogout={handleLogout}
          currentPage={botName}
          showSidebarToggle={false}
          showInlineLogo
        />

        {/* Content */}
        <div className="flex-1 overflow-hidden">{renderContent()}</div>
      </div>
    </div>
  );
};
