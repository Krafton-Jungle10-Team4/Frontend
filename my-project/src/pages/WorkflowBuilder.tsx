import { useState } from 'react';
import Workflow from '@/components/common/workflow';
import WorkflowSidebar, {
  type SidebarView,
} from '@/components/workflow-builder/WorkflowSidebar';
import MonitoringView from '@/components/workflow-builder/views/MonitoringView';
import LogsView from '@/components/workflow-builder/views/LogsView';
import type { Node, Edge } from '@/types/workflow';
import { BlockEnum } from '@/types/workflow';

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
    },
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
    },
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

/**
 * 워크플로우 빌더 페이지
 */
const WorkflowBuilder = () => {
  const [activeView, setActiveView] = useState<SidebarView>('flow');

  const renderView = () => {
    switch (activeView) {
      case 'flow':
        return (
          <div className="h-full w-full">
            <Workflow initialNodes={sampleNodes} initialEdges={sampleEdges} />
          </div>
        );
      case 'monitoring':
        return <MonitoringView />;
      case 'logs':
        return <LogsView />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen w-screen flex">
      {/* 왼쪽 사이드바 */}
      <WorkflowSidebar activeView={activeView} onViewChange={setActiveView} />

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 overflow-hidden">{renderView()}</div>
    </div>
  );
};

export default WorkflowBuilder;
