/**
 * 템플릿 검증 유틸리티
 */
import Ajv, { type JSONSchemaType } from 'ajv';
import type { WorkflowTemplate, PortDefinition } from '../types/template.types';
import {
  TEMPLATE_LIMITS,
  SUPPORTED_NODE_TYPES,
} from '../constants/templateDefaults';

const ajv = new Ajv();

/**
 * 템플릿 JSON 스키마
 */
const templateSchema: JSONSchemaType<WorkflowTemplate> = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string', minLength: 1, maxLength: TEMPLATE_LIMITS.MAX_NAME_LENGTH },
    description: { type: 'string', nullable: true },
    version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' },
    created_at: { type: 'string' },
    updated_at: { type: 'string', nullable: true },
    author: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string', nullable: true },
      },
      required: ['id', 'name'],
    },
    metadata: {
      type: 'object',
      properties: {
        tags: { type: 'array', items: { type: 'string' } },
        category: { type: 'string', nullable: true },
        visibility: { type: 'string', enum: ['private', 'team', 'public'] },
        source_workflow_id: { type: 'string' },
        source_version_id: { type: 'string' },
        node_count: { type: 'number' },
        edge_count: { type: 'number' },
        estimated_tokens: { type: 'number', nullable: true },
        estimated_cost: { type: 'number', nullable: true },
      },
      required: ['tags', 'visibility', 'source_workflow_id', 'source_version_id', 'node_count', 'edge_count'],
    },
    graph: {
      type: 'object',
      properties: {
        nodes: { type: 'array' },
        edges: { type: 'array' },
      },
      required: ['nodes', 'edges'],
    },
    input_schema: { type: 'array' },
    output_schema: { type: 'array' },
    thumbnail_url: { type: 'string', nullable: true },
  },
  required: [
    'id',
    'name',
    'version',
    'created_at',
    'author',
    'metadata',
    'graph',
    'input_schema',
    'output_schema',
  ],
};

const validate = ajv.compile(templateSchema);

/**
 * 템플릿 구조 검증
 */
export function validateTemplateStructure(
  template: unknown
): { valid: boolean; errors: string[] } {
  const valid = validate(template);

  if (!valid) {
    return {
      valid: false,
      errors: validate.errors?.map((e) => `${e.instancePath}: ${e.message}`) || [],
    };
  }

  return { valid: true, errors: [] };
}

/**
 * 비즈니스 규칙 검증
 */
export function validateBusinessRules(
  template: WorkflowTemplate
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 1. 노드 개수 제한
  if (template.graph.nodes.length > TEMPLATE_LIMITS.MAX_NODES) {
    errors.push(`노드 개수가 ${TEMPLATE_LIMITS.MAX_NODES}개를 초과합니다.`);
  }

  if (template.graph.nodes.length < TEMPLATE_LIMITS.MIN_NODES) {
    errors.push(`최소 ${TEMPLATE_LIMITS.MIN_NODES}개의 노드가 필요합니다.`);
  }

  // 2. 엣지 개수 제한
  if (template.graph.edges.length > TEMPLATE_LIMITS.MAX_EDGES) {
    errors.push(`엣지 개수가 ${TEMPLATE_LIMITS.MAX_EDGES}개를 초과합니다.`);
  }

  // 3. Start/End 노드 확인
  const hasStart = template.graph.nodes.some(
    (node: any) => node.data?.type === 'start'
  );
  const hasEnd = template.graph.nodes.some((node: any) =>
    ['end', 'answer'].includes(node.data?.type)
  );

  if (!hasStart) {
    errors.push('Start 노드가 필요합니다.');
  }

  if (!hasEnd) {
    errors.push('End 또는 Answer 노드가 필요합니다.');
  }

  // 4. 노드 타입 호환성
  const unsupportedTypes = template.graph.nodes
    .map((node: any) => node.data?.type)
    .filter((type: string) => type && !SUPPORTED_NODE_TYPES.includes(type as any));

  if (unsupportedTypes.length > 0) {
    errors.push(
      `지원하지 않는 노드 타입: ${[...new Set(unsupportedTypes)].join(', ')}`
    );
  }

  // 5. 포트 스키마 확인
  if (!template.input_schema || template.input_schema.length === 0) {
    errors.push('입력 포트 스키마가 정의되지 않았습니다.');
  }

  // 6. 메타데이터 검증
  if (template.metadata.node_count !== template.graph.nodes.length) {
    errors.push(
      `메타데이터의 node_count(${template.metadata.node_count})와 실제 노드 개수(${template.graph.nodes.length})가 일치하지 않습니다.`
    );
  }

  if (template.metadata.edge_count !== template.graph.edges.length) {
    errors.push(
      `메타데이터의 edge_count(${template.metadata.edge_count})와 실제 엣지 개수(${template.graph.edges.length})가 일치하지 않습니다.`
    );
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 전체 템플릿 검증
 */
export function validateTemplate(
  template: unknown
): { valid: boolean; errors: string[] } {
  // 1. 구조 검증
  const structureValidation = validateTemplateStructure(template);
  if (!structureValidation.valid) {
    return structureValidation;
  }

  // 2. 비즈니스 규칙 검증
  const businessValidation = validateBusinessRules(template as WorkflowTemplate);

  return businessValidation;
}
