import type { ComponentType } from 'react';
import { BlockEnum } from '@/shared/types/workflow.types';

// Node 컴포넌트 (캔버스 UI)
import StartNode from './start/node';
import LLMNode from './llm/node';
import EndNode from './end/node';
import KnowledgeRetrievalNode from './knowledge-retrieval/node';
import MCPNode from './mcp/node';
import AnswerNode from './answer/node';
import TemplateTransformNode from './template-transform/node';
import IfElseNode from './if-else/node';
import QuestionClassifierNode from './question-classifier/node';
import { VariableAssignerNode } from '@features/workflow/nodes/variable-assigner/components/VariableAssignerNode';
import AssignerNode from './assigner/node';
import TavilySearchNode from './tavily-search/node';
import { ImportedWorkflowNode } from './imported-workflow';
import { SlackNode } from './slack';
import { HttpNode } from './http';

// Panel 컴포넌트 (설정 UI)
import { StartPanel } from './start/panel';
import { EndPanel } from './end/panel';
import { LLMPanel } from './llm/panel';
import { KnowledgeRetrievalPanel } from './knowledge-retrieval/panel';
import { MCPPanel } from './mcp/panel';
import { AnswerPanel } from './answer/panel';
import { TemplateTransformPanel } from './template-transform/panel';
import { IfElsePanel } from './if-else/panel';
import { QuestionClassifierPanel } from './question-classifier/panel';
import { VariableAssignerPanel } from '@features/workflow/nodes/variable-assigner/components/VariableAssignerPanel';
import { AssignerPanel } from './assigner/panel';
import { TavilySearchPanel } from './tavily-search/panel';
import { ImportedWorkflowPanel } from './imported-workflow';
import { SlackPanel } from './slack';
import { HttpPanel } from './http';

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
  [BlockEnum.Answer]: AnswerNode,
  [BlockEnum.TemplateTransform]: TemplateTransformNode,
  [BlockEnum.IfElse]: IfElseNode,
  [BlockEnum.QuestionClassifier]: QuestionClassifierNode,
  [BlockEnum.VariableAssigner]: VariableAssignerNode, // Legacy
  [BlockEnum.Assigner]: AssignerNode, // New
  [BlockEnum.TavilySearch]: TavilySearchNode,
  [BlockEnum.ImportedWorkflow]: ImportedWorkflowNode,
  [BlockEnum.Slack]: SlackNode,
  [BlockEnum.Http]: HttpNode,
  [BlockEnum.Code]: (() => null) as any,
  [BlockEnum.KnowledgeBase]: (() => null) as any,
};

/**
 * 노드 타입 → 설정 패널 컴포넌트 매핑
 */
export const PanelComponentMap: Partial<Record<BlockEnum, ComponentType<any>>> = {
  [BlockEnum.Start]: StartPanel,
  [BlockEnum.End]: EndPanel,
  [BlockEnum.LLM]: LLMPanel,
  [BlockEnum.KnowledgeRetrieval]: KnowledgeRetrievalPanel,
  [BlockEnum.MCP]: MCPPanel,
  [BlockEnum.Answer]: AnswerPanel,
  [BlockEnum.TemplateTransform]: TemplateTransformPanel,
  [BlockEnum.IfElse]: IfElsePanel,
  [BlockEnum.QuestionClassifier]: QuestionClassifierPanel,
  [BlockEnum.VariableAssigner]: VariableAssignerPanel, // Legacy
  [BlockEnum.Assigner]: AssignerPanel, // New
  [BlockEnum.TavilySearch]: TavilySearchPanel,
  [BlockEnum.ImportedWorkflow]: ImportedWorkflowPanel,
  [BlockEnum.Slack]: SlackPanel,
  [BlockEnum.Http]: HttpPanel,
};
