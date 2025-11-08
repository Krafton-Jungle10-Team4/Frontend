import { useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Workflow from '../components/WorkflowBuilder';
import WorkflowSlimSidebar, {
  type SidebarView,
} from '../components/sidebar/WorkflowSlimSidebar';
import MonitoringView from '../components/views/MonitoringView';
import LogsView from '../components/views/LogsView';
import { ChatPreviewPanel } from '@/features/bot/pages/ChatPreviewPanel';
import { useApp } from '@/features/bot/contexts/AppContext';
import { useWorkflowStore } from '../stores/workflowStore';

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
            <ChatPreviewPanel botName={botName} language={language} />
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
  const [activeView, setActiveView] = useState<SidebarView>('flow');

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
    <div className="h-screen w-screen flex">
      <WorkflowSlimSidebar
        activeView={activeView}
        onViewChange={setActiveView}
      />
      <div className="flex-1 overflow-hidden">{renderContent()}</div>
    </div>
  );
};
