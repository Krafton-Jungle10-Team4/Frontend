/**
 * NodeSelector 상수 정의
 */

import { NodeCategory } from './types';

/**
 * 카테고리 라벨 (표시용)
 */
export const CATEGORY_LABELS: Record<NodeCategory, string> = {
  [NodeCategory.Default]: '', // 기본 카테고리는 라벨 없음
  [NodeCategory.QuestionUnderstand]: '질문 이해',
  [NodeCategory.Logic]: '논리',
  [NodeCategory.Transform]: '변환',
  [NodeCategory.Utilities]: '유틸리티',
};

/**
 * 카테고리 표시 순서
 */
export const CATEGORY_ORDER: NodeCategory[] = [
  NodeCategory.Default,
  NodeCategory.QuestionUnderstand,
  NodeCategory.Logic,
  NodeCategory.Transform,
  NodeCategory.Utilities,
];

/**
 * 노드 타입별 카테고리 매핑
 */
export const NODE_CATEGORIES: Record<string, NodeCategory> = {
  // 기본 노드
  start: NodeCategory.Default,
  llm: NodeCategory.Default,
  'knowledge-retrieval': NodeCategory.Default,
  answer: NodeCategory.Default,
  end: NodeCategory.Default,
  mcp: NodeCategory.Default,

  // 질문 이해
  'question-classifier': NodeCategory.QuestionUnderstand,

  // 논리
  'if-else': NodeCategory.Logic,

  // 변환
  'variable-assigner': NodeCategory.Transform,
  assigner: NodeCategory.Transform,
  'template-transform': NodeCategory.Transform,

  // 유틸리티
  'tavily-search': NodeCategory.Utilities,
  http: NodeCategory.Utilities,
  code: NodeCategory.Utilities,
  slack: NodeCategory.Utilities,
};

/**
 * 아이콘 배경색 매핑
 */
export const ICON_BG_COLORS: Record<string, string> = {
  start: 'bg-blue-500',
  llm: 'bg-indigo-500',
  'knowledge-retrieval': 'bg-emerald-500',
  answer: 'bg-cyan-500',
  end: 'bg-amber-500',
  mcp: 'bg-purple-500',
  'question-classifier': 'bg-teal-500',
  'if-else': 'bg-cyan-500',
  'variable-assigner': 'bg-blue-400',
  assigner: 'bg-blue-400',
  'template-transform': 'bg-violet-500',
  'tavily-search': 'bg-blue-500',
  http: 'bg-pink-500',
  code: 'bg-slate-500',
  slack: 'bg-fuchsia-500',
};
