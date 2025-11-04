import { useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Workflow from '../components/WorkflowBuilder';
import WorkflowSlimSidebar, {
  type SidebarView,
} from '../components/sidebar/WorkflowSlimSidebar';
import MonitoringView from '../components/views/MonitoringView';
import LogsView from '../components/views/LogsView';
import type { Node, Edge, CommonNodeType } from '../types/workflow.types';
import { BlockEnum } from '../types/workflow.types';
import { ChatPreviewPanel } from '@/features/bot/pages/ChatPreviewPanel';
import { useApp } from '@/features/bot/contexts/AppContext';

/**
 * RAG (Retrieval-Augmented Generation) 워크플로우 샘플
 */
const sampleNodes: Node[] = [
  {
    id: '1',
    type: 'custom',
    position: { x: 100, y: 150 },
    data: {
      type: BlockEnum.Start,
      title: 'Start',
      desc: '사용자 질문 입력',
    },
  },
  {
    id: '2',
    type: 'custom',
    position: { x: 400, y: 150 },
    data: {
      type: BlockEnum.KnowledgeRetrieval,
      title: 'Knowledge Retrieval',
      desc: '관련 문서 검색',
      dataset: 'Product Documentation',
      retrievalMode: 'Semantic Search',
    } as CommonNodeType<{
      dataset?: string;
      retrievalMode?: string;
    }>,
  },
  {
    id: '3',
    type: 'custom',
    position: { x: 700, y: 150 },
    data: {
      type: BlockEnum.LLM,
      title: 'LLM',
      desc: 'AI 응답 생성',
      model: {
        provider: 'OpenAI',
        name: 'GPT-4',
      },
      prompt: '검색된 문서를 기반으로 사용자 질문에 답변하세요.',
    } as CommonNodeType<{
      model?: { provider: string; name: string };
      prompt?: string;
    }>,
  },
  {
    id: '4',
    type: 'custom',
    position: { x: 1000, y: 150 },
    data: {
      type: BlockEnum.End,
      title: 'End',
      desc: '최종 답변 출력',
    },
  },
];

const sampleEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'custom',
    data: {
      sourceType: BlockEnum.Start,
      targetType: BlockEnum.KnowledgeRetrieval,
    },
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    type: 'custom',
    data: {
      sourceType: BlockEnum.KnowledgeRetrieval,
      targetType: BlockEnum.LLM,
    },
  },
  {
    id: 'e3-4',
    source: '3',
    target: '4',
    type: 'custom',
    data: {
      sourceType: BlockEnum.LLM,
      targetType: BlockEnum.End,
    },
  },
];

const WorkflowWithChat = () => {
  const { language } = useApp();
  const { botId } = useParams<{ botId: string }>();
  const location = useLocation();

  // Get bot data from URL params and navigation state
  const state = location.state as { botName?: string } | null;
  const botName = state?.botName || 'AI Support Agent';

  // 🔍 Bot ID 확인
  console.log('📍 [Workflow] Current Bot ID:', botId);

  return (
    <div className="flex h-full w-full">
      {/* Left: Workflow Graph */}
      <div className="flex-1 relative">
        <Workflow initialNodes={sampleNodes} initialEdges={sampleEdges} />
      </div>

      {/* Divider */}
      <div className="w-px bg-gray-200 dark:bg-gray-700" />

      {/* Right: Chatbot Preview */}
      <div className="w-96 flex-shrink-0">
        <ChatPreviewPanel botName={botName} language={language} />
      </div>
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
