import Workflow from '../components/WorkflowBuilder';
import type { Node, Edge } from '../types/workflow.types';
import { BlockEnum } from '../types/workflow.types';

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
export const WorkflowBuilderPage = () => {
  return (
    <div className="h-screen w-screen">
      <Workflow initialNodes={sampleNodes} initialEdges={sampleEdges} />
    </div>
  );
};
