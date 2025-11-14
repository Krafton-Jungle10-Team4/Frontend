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

const PORT_SCHEMA_MAP: Record<string, NodePortSchema> = {
  [BlockEnum.Start]: START_SCHEMA,
  [BlockEnum.KnowledgeRetrieval]: KNOWLEDGE_SCHEMA,
  [BlockEnum.LLM]: LLM_SCHEMA,
  [BlockEnum.End]: END_SCHEMA,
};

export const clonePortSchema = (nodeType: string): NodePortSchema | undefined =>
  cloneNodePortSchema(PORT_SCHEMA_MAP[nodeType]);

export const ensurePortSchema = (
  nodeType: string,
  current?: NodePortSchema
): NodePortSchema | undefined => current ?? clonePortSchema(nodeType);

export const V2_NODE_PORT_SCHEMAS = PORT_SCHEMA_MAP;
