/**
 * 템플릿 검증 유틸리티
 */
import Ajv, { type JSONSchemaType } from 'ajv';
import type { WorkflowTemplate } from '../types/template.types';
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

  console.log('[validateBusinessRules] Starting validation:', {
    templateId: template.id,
    templateName: template.name,
    nodeCount: template.graph.nodes.length,
    edgeCount: template.graph.edges.length,
  });

  // 1. 노드 개수 제한
  if (template.graph.nodes.length > TEMPLATE_LIMITS.MAX_NODES) {
    errors.push(`노드 개수가 ${TEMPLATE_LIMITS.MAX_NODES}개를 초과합니다.`);
    console.error('[validateBusinessRules] Too many nodes:', {
      current: template.graph.nodes.length,
      max: TEMPLATE_LIMITS.MAX_NODES,
    });
  }

  if (template.graph.nodes.length < TEMPLATE_LIMITS.MIN_NODES) {
    errors.push(`최소 ${TEMPLATE_LIMITS.MIN_NODES}개의 노드가 필요합니다.`);
    console.error('[validateBusinessRules] Too few nodes:', {
      current: template.graph.nodes.length,
      min: TEMPLATE_LIMITS.MIN_NODES,
    });
  }

  // 2. 엣지 개수 제한
  if (template.graph.edges.length > TEMPLATE_LIMITS.MAX_EDGES) {
    errors.push(`엣지 개수가 ${TEMPLATE_LIMITS.MAX_EDGES}개를 초과합니다.`);
    console.error('[validateBusinessRules] Too many edges:', {
      current: template.graph.edges.length,
      max: TEMPLATE_LIMITS.MAX_EDGES,
    });
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
    console.error('[validateBusinessRules] Missing start node');
  }

  if (!hasEnd) {
    errors.push('End 또는 Answer 노드가 필요합니다.');
    console.error('[validateBusinessRules] Missing end/answer node');
  }

  // 4. 각 노드의 구조 검증 (NEW!)
  console.log('[validateBusinessRules] Validating node structures...');
  template.graph.nodes.forEach((node: any, index: number) => {
    const nodeErrors: string[] = [];

    // 필수 필드 확인
    if (!node.id) {
      nodeErrors.push('ID 누락');
      errors.push(`노드 #${index}에 ID가 없습니다`);
    }
    if (!node.position || typeof node.position !== 'object') {
      nodeErrors.push('position 누락 또는 잘못된 형식');
      errors.push(`노드 ${node.id || `#${index}`}에 position이 없거나 잘못되었습니다`);
    } else {
      if (typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
        nodeErrors.push('position.x 또는 position.y가 숫자가 아님');
        errors.push(`노드 ${node.id}의 position.x 또는 position.y가 숫자가 아닙니다`);
      }
    }
    if (!node.data || typeof node.data !== 'object') {
      nodeErrors.push('data 누락 또는 잘못된 형식');
      errors.push(`노드 ${node.id || `#${index}`}에 data가 없거나 잘못되었습니다`);
    } else if (!node.data.type) {
      nodeErrors.push('data.type 누락');
      errors.push(`노드 ${node.id}의 data.type이 없습니다`);
    }

    if (nodeErrors.length > 0) {
      console.error('[validateBusinessRules] Invalid node structure:', {
        nodeId: node.id || `#${index}`,
        nodeIndex: index,
        errors: nodeErrors,
        node,
      });
    }
  });

  // 5. 중복 노드 ID 검증 (NEW!)
  const nodeIds = template.graph.nodes.map((node: any) => node.id).filter(Boolean);
  const uniqueIds = new Set(nodeIds);
  if (nodeIds.length !== uniqueIds.size) {
    errors.push('중복된 노드 ID가 존재합니다');
    console.error('[validateBusinessRules] Duplicate node IDs detected:', {
      totalNodes: nodeIds.length,
      uniqueNodes: uniqueIds.size,
      duplicates: nodeIds.filter((id, index) => nodeIds.indexOf(id) !== index),
    });
  }

  // 6. 엣지의 source/target 유효성 검증 (NEW!)
  const nodeIdSet = new Set(nodeIds);
  console.log('[validateBusinessRules] Validating edge references...');
  template.graph.edges.forEach((edge: any, index: number) => {
    if (!edge.source) {
      errors.push(`엣지 #${index}에 source가 없습니다`);
      console.error('[validateBusinessRules] Edge missing source:', { edge, index });
    } else if (!nodeIdSet.has(edge.source)) {
      errors.push(`엣지 ${edge.id || `#${index}`}의 source '${edge.source}'가 존재하지 않습니다`);
      console.error('[validateBusinessRules] Edge source not found:', {
        edgeId: edge.id || `#${index}`,
        source: edge.source,
        availableNodes: Array.from(nodeIdSet),
      });
    }
    if (!edge.target) {
      errors.push(`엣지 #${index}에 target이 없습니다`);
      console.error('[validateBusinessRules] Edge missing target:', { edge, index });
    } else if (!nodeIdSet.has(edge.target)) {
      errors.push(`엣지 ${edge.id || `#${index}`}의 target '${edge.target}'가 존재하지 않습니다`);
      console.error('[validateBusinessRules] Edge target not found:', {
        edgeId: edge.id || `#${index}`,
        target: edge.target,
        availableNodes: Array.from(nodeIdSet),
      });
    }
  });

  // 7. 노드 타입 호환성 (기존 로직 + imported-workflow 특별 처리)
  const unsupportedTypes = template.graph.nodes
    .map((node: any) => node.data?.type)
    .filter((type: string) => type && !SUPPORTED_NODE_TYPES.includes(type as any));

  if (unsupportedTypes.length > 0) {
    errors.push(
      `지원하지 않는 노드 타입: ${[...new Set(unsupportedTypes)].join(', ')}`
    );
    console.error('[validateBusinessRules] Unsupported node types:', {
      unsupportedTypes: [...new Set(unsupportedTypes)],
      supportedTypes: SUPPORTED_NODE_TYPES,
    });
  }

  // 8. imported-workflow 노드 거부 (중첩 방지) (NEW!)
  const hasImportedWorkflow = template.graph.nodes.some(
    (node: any) => node.data?.type === 'imported-workflow'
  );
  if (hasImportedWorkflow) {
    errors.push(
      '템플릿은 다른 템플릿(ImportedWorkflow)을 포함할 수 없습니다. ' +
      '중첩된 템플릿 구조는 지원하지 않습니다.'
    );
    console.error('[validateBusinessRules] Nested template detected:', {
      templateId: template.id,
      importedWorkflowNodes: template.graph.nodes
        .filter((node: any) => node.data?.type === 'imported-workflow')
        .map((node: any) => ({ id: node.id, templateId: (node.data as any)?.template_id })),
    });
  }

  // 9. 포트 스키마 확인
  // NOTE: input_schema와 output_schema는 배열이기만 하면 됨 (비어있을 수 있음)
  // 템플릿에 따라 외부 입력/출력이 없을 수 있음
  if (!template.input_schema || !Array.isArray(template.input_schema)) {
    errors.push('input_schema가 배열이어야 합니다.');
    console.error('[validateBusinessRules] Invalid input_schema:', {
      inputSchema: template.input_schema,
    });
  }

  if (!template.output_schema || !Array.isArray(template.output_schema)) {
    errors.push('output_schema가 배열이어야 합니다.');
    console.error('[validateBusinessRules] Invalid output_schema:', {
      outputSchema: template.output_schema,
    });
  }

  // 10. 메타데이터 검증
  if (template.metadata.node_count !== template.graph.nodes.length) {
    errors.push(
      `메타데이터의 node_count(${template.metadata.node_count})와 실제 노드 개수(${template.graph.nodes.length})가 일치하지 않습니다.`
    );
    console.error('[validateBusinessRules] Node count mismatch:', {
      metadataCount: template.metadata.node_count,
      actualCount: template.graph.nodes.length,
    });
  }

  if (template.metadata.edge_count !== template.graph.edges.length) {
    errors.push(
      `메타데이터의 edge_count(${template.metadata.edge_count})와 실제 엣지 개수(${template.graph.edges.length})가 일치하지 않습니다.`
    );
    console.error('[validateBusinessRules] Edge count mismatch:', {
      metadataCount: template.metadata.edge_count,
      actualCount: template.graph.edges.length,
    });
  }

  console.log('[validateBusinessRules] Validation completed:', {
    isValid: errors.length === 0,
    errorCount: errors.length,
    errors,
  });

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
