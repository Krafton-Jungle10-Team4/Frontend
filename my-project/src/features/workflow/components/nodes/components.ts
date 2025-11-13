import type { ComponentType } from 'react';
import { BlockEnum } from '@/shared/types/workflow.types';

// Node 컴포넌트 (캔버스 UI)
import StartNode from './start/node';
import LLMNode from './llm/node';
import EndNode from './end/node';
import KnowledgeRetrievalNode from './knowledge-retrieval/node';
import MCPNode from './mcp/node';

// Panel 컴포넌트 (설정 UI)
import { StartPanel } from './start/panel';
import { LLMPanel } from './llm/panel';
import { KnowledgeRetrievalPanel } from './knowledge-retrieval/panel';
import { MCPPanel } from './mcp/panel';

/**
 * 노드 타입 → 캔버스 컴포넌트 매핑
 * BlockEnum의 각 노드 타입을 실제 React 컴포넌트로 연결
 */
export const NodeComponentMap: Record<BlockEnum, ComponentType<any>> = {
  [BlockEnum.Start]: StartNode,
  [BlockEnum.LLM]: LLMNode,
  [BlockEnum.End]: EndNode,
  [BlockEnum.KnowledgeRetrieval]: KnowledgeRetrievalNode,
  [BlockEnum.MCP]: MCPNode,
};

/**
 * 노드 타입 → 설정 패널 컴포넌트 매핑
 */
export const PanelComponentMap: Partial<Record<BlockEnum, ComponentType<any>>> = {
  [BlockEnum.Start]: StartPanel,
  [BlockEnum.LLM]: LLMPanel,
  [BlockEnum.KnowledgeRetrieval]: KnowledgeRetrievalPanel,
  [BlockEnum.MCP]: MCPPanel,
  // End는 설정 패널 없음
};
