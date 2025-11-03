import type { ComponentType } from 'react';
import { BlockEnum } from '../../types/workflow.types';
import StartNode from './start/node';
import LLMNode from './llm/node';
import EndNode from './end/node';
import KnowledgeRetrievalNode from './knowledge-retrieval/node';

/**
 * 노드 타입 → 컴포넌트 매핑
 * BlockEnum의 각 노드 타입을 실제 React 컴포넌트로 연결
 */
export const NodeComponentMap: Record<BlockEnum, ComponentType<unknown>> = {
  [BlockEnum.Start]: StartNode,
  [BlockEnum.LLM]: LLMNode,
  [BlockEnum.End]: EndNode,
  [BlockEnum.KnowledgeRetrieval]: KnowledgeRetrievalNode,
};
