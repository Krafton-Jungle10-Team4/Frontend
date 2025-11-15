import type { NodePortSchema } from '@/shared/types/workflow';
import { PortType } from '@/shared/types/workflow';
import { BlockEnum } from '@/shared/types/workflow.types';

export const cloneNodePortSchema = (
  schema: NodePortSchema | undefined
): NodePortSchema | undefined => {
  if (!schema) return undefined;
  return {
    inputs: schema.inputs.map((port) => ({ ...port })),
    outputs: schema.outputs.map((port) => ({ ...port })),
  };
};

const START_SCHEMA: NodePortSchema = {
  inputs: [],
  outputs: [
    {
      name: 'query',
      type: PortType.STRING,
      required: true,
      default_value: '',
      description: '사용자 질문 또는 메시지',
      display_name: '사용자 질문',
    },
    {
      name: 'session_id',
      type: PortType.STRING,
      required: false,
      default_value: '',
      description: '세션 ID',
      display_name: '세션 ID',
    },
  ],
};

const KNOWLEDGE_SCHEMA: NodePortSchema = {
  inputs: [
    {
      name: 'query',
      type: PortType.STRING,
      required: true,
      default_value: '',
      description: '검색할 쿼리 텍스트',
      display_name: '검색 쿼리',
    },
  ],
  outputs: [
    {
      name: 'context',
      type: PortType.STRING,
      required: true,
      default_value: '',
      description: '검색된 문서 컨텍스트',
      display_name: '컨텍스트',
    },
    {
      name: 'documents',
      type: PortType.ARRAY,
      required: false,
      default_value: [],
      description: '검색된 문서 목록',
      display_name: '문서 목록',
    },
    {
      name: 'doc_count',
      type: PortType.NUMBER,
      required: false,
      default_value: 0,
      description: '검색된 문서 개수',
      display_name: '문서 개수',
    },
  ],
};

const LLM_SCHEMA: NodePortSchema = {
  inputs: [
    {
      name: 'query',
      type: PortType.STRING,
      required: true,
      default_value: '',
      description: '사용자 질문',
      display_name: '질문',
    },
    {
      name: 'context',
      type: PortType.STRING,
      required: false,
      default_value: '',
      description: '컨텍스트 정보',
      display_name: '컨텍스트',
    },
    {
      name: 'system_prompt',
      type: PortType.STRING,
      required: false,
      default_value: '',
      description: '시스템 프롬프트',
      display_name: '시스템 프롬프트',
    },
  ],
  outputs: [
    {
      name: 'response',
      type: PortType.STRING,
      required: true,
      default_value: '',
      description: 'LLM 응답',
      display_name: '응답',
    },
    {
      name: 'tokens',
      type: PortType.NUMBER,
      required: false,
      default_value: 0,
      description: '사용된 토큰 수',
      display_name: '토큰 수',
    },
    {
      name: 'model',
      type: PortType.STRING,
      required: false,
      default_value: '',
      description: '사용된 모델명',
      display_name: '모델',
    },
  ],
};

const END_SCHEMA: NodePortSchema = {
  inputs: [
    {
      name: 'response',
      type: PortType.STRING,
      required: true,
      default_value: '',
      description: '최종 응답 텍스트',
      display_name: '응답',
    },
  ],
  outputs: [
    {
      name: 'final_output',
      type: PortType.OBJECT,
      required: true,
      default_value: {},
      description: '최종 결과 객체',
      display_name: '최종 결과',
    },
  ],
};

const TAVILY_SEARCH_SCHEMA: NodePortSchema = {
  inputs: [
    {
      name: 'query',
      type: PortType.STRING,
      required: true,
      default_value: '',
      description: 'Tavily로 검색할 쿼리',
      display_name: '검색 쿼리',
    },
  ],
  outputs: [
    {
      name: 'context',
      type: PortType.STRING,
      required: true,
      default_value: '',
      description: '검색 결과를 문자열로 결합 (LLM에 직접 전달 가능)',
      display_name: '검색 컨텍스트',
    },
    {
      name: 'retrieved_documents',
      type: PortType.ARRAY,
      required: true,
      default_value: [],
      description: 'LLM 노드 호환 문서 배열 (Knowledge 노드와 동일 형식)',
      display_name: '검색 문서 (배열)',
    },
    {
      name: 'results',
      type: PortType.ARRAY,
      required: true,
      default_value: [],
      description: '검색 결과 배열 (원본 Tavily 응답)',
      display_name: '검색 결과',
    },
    {
      name: 'answer',
      type: PortType.STRING,
      required: false,
      default_value: '',
      description: 'AI가 생성한 답변 (include_answer=true일 때)',
      display_name: '답변',
    },
    {
      name: 'result_count',
      type: PortType.NUMBER,
      required: true,
      default_value: 0,
      description: '검색 결과 개수',
      display_name: '결과 개수',
    },
    {
      name: 'response_time',
      type: PortType.NUMBER,
      required: true,
      default_value: 0,
      description: '응답 시간 (초)',
      display_name: '응답 시간',
    },
  ],
};

const ANSWER_SCHEMA: NodePortSchema = {
  inputs: [],
  outputs: [
    {
      name: 'final_output',
      type: PortType.STRING,
      required: true,
      default_value: '',
      description: '생성된 최종 응답 텍스트',
      display_name: '최종 출력',
    },
  ],
};

const PORT_SCHEMA_MAP: Record<string, NodePortSchema> = {
  [BlockEnum.Start]: START_SCHEMA,
  [BlockEnum.KnowledgeRetrieval]: KNOWLEDGE_SCHEMA,
  [BlockEnum.LLM]: LLM_SCHEMA,
  [BlockEnum.End]: END_SCHEMA,
  [BlockEnum.TavilySearch]: TAVILY_SEARCH_SCHEMA,
  [BlockEnum.Answer]: ANSWER_SCHEMA,
};

export const clonePortSchema = (nodeType: string): NodePortSchema | undefined =>
  cloneNodePortSchema(PORT_SCHEMA_MAP[nodeType]);

export const ensurePortSchema = (
  nodeType: string,
  current?: NodePortSchema
): NodePortSchema | undefined => current ?? clonePortSchema(nodeType);

export const V2_NODE_PORT_SCHEMAS = PORT_SCHEMA_MAP;
