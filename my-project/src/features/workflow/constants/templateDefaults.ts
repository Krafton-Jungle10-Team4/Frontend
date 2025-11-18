/**
 * 템플릿 관련 기본값 및 상수
 */
import type { PortDefinition } from '../types/template.types';

/**
 * 기본 포트 정의
 */
export const DEFAULT_INPUT_PORT: PortDefinition = {
  name: 'input',
  type: 'any',
  required: true,
  description: '입력 데이터',
  display_name: '입력',
};

export const DEFAULT_OUTPUT_PORT: PortDefinition = {
  name: 'output',
  type: 'any',
  required: true,
  description: '출력 데이터',
  display_name: '출력',
};

/**
 * 템플릿 검증 제한
 */
export const TEMPLATE_LIMITS = {
  MAX_NODES: 100,
  MAX_EDGES: 200,
  MAX_NAME_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 1000,
  MIN_NODES: 2, // Start + End
} as const;

/**
 * 지원되는 노드 타입 (Import 검증용)
 */
export const SUPPORTED_NODE_TYPES = [
  'start',
  'end',
  'answer',
  'llm',
  'knowledge',
  'knowledge-retrieval',
  'if-else',
  'code',
  'http-request',
  'template-transform',
  'assigner',
  'question-classifier',
  'mcp',
  'tavily-search',
  'imported-workflow',
] as const;

/**
 * 템플릿 Visibility 옵션
 */
export const TEMPLATE_VISIBILITY_OPTIONS = [
  { value: 'private', label: '비공개', description: '나만 볼 수 있음' },
  { value: 'team', label: '팀 공유', description: '팀원들과 공유' },
  { value: 'public', label: '공개', description: '모든 사용자에게 공개' },
] as const;

/**
 * 템플릿 카테고리
 */
export const TEMPLATE_CATEGORIES = [
  'RAG',
  '분류',
  '응답 생성',
  '데이터 처리',
  '검색',
  '기타',
] as const;

/**
 * ImportedWorkflowNode 기본 크기
 */
export const IMPORTED_NODE_SIZE = {
  collapsed: {
    width: 300,
    minHeight: 200,
  },
  expanded: {
    width: 600,
    minHeight: 400,
  },
} as const;

/**
 * 템플릿 파일 확장자
 */
export const TEMPLATE_FILE_EXTENSION = '.json' as const;
export const TEMPLATE_MIME_TYPE = 'application/json' as const;
