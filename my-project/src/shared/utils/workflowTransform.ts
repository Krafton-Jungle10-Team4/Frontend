/**
 * 워크플로우 데이터 변환 유틸리티
 * 프론트엔드 스키마 ↔ 백엔드 스키마 변환
 */

import type {
  Node,
  Edge,
  IfElseNodeType,
  QuestionClassifierNodeType,
  AssignerNodeType,
} from '@/shared/types/workflow.types';
import type { BackendWorkflow, BackendNode } from '@/shared/types/workflowTransform.types';
import { BlockEnum } from '@/shared/types/workflow.types';
import type {
  NodePortSchema,
  PortDefinition,
  NodeVariableMappings,
  VariableMapping,
} from '@/shared/types/workflow';
import { PortType } from '@/shared/types/workflow';
import * as assignerTransformers from '@/features/workflow/components/nodes/assigner/api/transformers';

/**
 * 프론트엔드 노드/엣지 → 백엔드 스키마 변환
 */
export const transformToBackend = (
  nodes: Node[],
  edges: Edge[]
): BackendWorkflow => {
  return {
    nodes: nodes.map((node) => ({
      id: node.id,
      type: node.data.type,
      position: node.position,
      data: {
        title: node.data.title,
        desc: node.data.desc || '',
        type: node.data.type,

        // LLM 노드 변환
        ...(node.data.type === BlockEnum.LLM && {
          provider:
            (node.data as any).provider ||
            extractProviderSlug((node.data as any).model) ||
            'openai',
          model:
            (node.data as any).model?.name ||
            (typeof (node.data as any).model === 'string'
              ? (node.data as any).model
              : 'gpt-4o-mini'),
          prompt_template: (node.data as any).prompt || '',
          temperature: (node.data as any).temperature || 0.7,
          max_tokens: (node.data as any).maxTokens || 500,
        }),

        // Knowledge Retrieval 노드 변환
        ...(node.data.type === BlockEnum.KnowledgeRetrieval && {
          dataset_id: (node.data as any).dataset || '',
          mode: normalizeRetrievalModeValue((node.data as any).retrievalMode),
          top_k: (node.data as any).topK || 5,
          document_ids: (node.data as any).documentIds || [],
        }),

        // MCP 노드 변환
        ...(node.data.type === BlockEnum.MCP && {
          provider_id: (node.data as any).provider_id || '',
          action: (node.data as any).action || '',
          parameters: (node.data as any).parameters || {},
        }),

        // If-Else 노드 변환
        ...(node.data.type === BlockEnum.IfElse && {
          cases: (node.data as IfElseNodeType).cases || [],
        }),

        // Question Classifier 노드 변환
        ...(node.data.type === BlockEnum.QuestionClassifier && {
          query_variable_selector:
            (node.data as QuestionClassifierNodeType).query_variable_selector || [],
          model: (node.data as QuestionClassifierNodeType).model || undefined,
          classes: (node.data as QuestionClassifierNodeType).classes || [],
          instruction: (node.data as QuestionClassifierNodeType).instruction || '',
          memory: (node.data as QuestionClassifierNodeType).memory,
          vision: (node.data as QuestionClassifierNodeType).vision,
        }),

        // Tavily Search 노드 변환
        ...(node.data.type === BlockEnum.TavilySearch && {
          search_depth: (node.data as any).search_depth || 'basic',
          topic: (node.data as any).topic || 'general',
          max_results: (node.data as any).max_results || 5,
          include_domains: (node.data as any).include_domains || [],
          exclude_domains: (node.data as any).exclude_domains || [],
          time_range: (node.data as any).time_range || null,
          start_date: (node.data as any).start_date || null,
          end_date: (node.data as any).end_date || null,
          include_answer: (node.data as any).include_answer || false,
          include_raw_content: (node.data as any).include_raw_content || false,
        }),

        // Assigner 노드 변환
        ...(node.data.type === BlockEnum.Assigner && {
          version: (node.data as AssignerNodeType).version || '2',
          operations: ((node.data as AssignerNodeType).operations || []).map(op => ({
            write_mode: op.write_mode,
            input_type: op.input_type,
            constant_value: op.constant_value,
          })),
        }),

        // Answer 노드 변환
        ...(node.data.type === BlockEnum.Answer && {
          template: (node.data as any).template || '',
          description: (node.data as any).description || '',
        }),
      },
      ports: serializePorts(node.data.ports),
      variable_mappings: serializeVariableMappings(
        node.data.variable_mappings as NodeVariableMappings | undefined
      ),
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type || 'custom',
      source_port: edge.sourceHandle ?? null,
      target_port: edge.targetHandle ?? null,
      data_type: inferEdgeDataType(nodes, edge) ?? null,
      data: {
        source_type: edge.data?.sourceType || '',
        target_type: edge.data?.targetType || '',
      },
    })),
  };
};

/**
 * 백엔드 스키마 → 프론트엔드 노드/엣지 변환
 */
export const transformFromBackend = (
  workflow: BackendWorkflow
): { nodes: Node[]; edges: Edge[] } => {
  return {
    nodes: workflow.nodes.map((node) => ({
      id: node.id,
      type: 'custom',
      position: node.position,
      data: {
        type: node.type as BlockEnum,
        title: node.data.title,
        desc: node.data.desc,
        ports: deserializePorts(node.ports),
        variable_mappings: deserializeVariableMappings(node.variable_mappings),

        // LLM 노드 변환
        ...(node.type === 'llm' && {
          provider:
            (node.data as any).provider ||
            extractProviderSlug(node.data.model || ''),
          model:
            typeof node.data.model === 'object' && node.data.model !== null
              ? {
                  provider:
                    (node.data as any).provider ||
                    (node.data.model as any).provider ||
                    extractProviderSlug(
                      (node.data.model as any).name || ''
                    ),
                  name:
                    (node.data.model as any).name ||
                    extractModelName(
                      (node.data.model as any).id ||
                        (node.data.model as any).name ||
                        ''
                    ),
                }
              : {
                  provider:
                    (node.data as any).provider ||
                    extractProviderSlug(node.data.model || ''),
                  name: extractModelName(node.data.model || 'gpt-4o-mini'),
                },
          prompt: node.data.prompt_template || '',
          temperature: node.data.temperature || 0.7,
          maxTokens: node.data.max_tokens || 500,
        }),

        // Knowledge Retrieval 노드 변환
        ...(node.type === 'knowledge-retrieval' && {
          dataset: node.data.dataset_id || '',
          retrievalMode: normalizeRetrievalModeValue(node.data.mode),
          topK: node.data.top_k || 5,
          documentIds: node.data.document_ids || [],
        }),

        // MCP 노드 변환
        ...(node.type === 'mcp' && {
          provider_id: node.data.provider_id || '',
          action: node.data.action || '',
          parameters: node.data.parameters || {},
        }),

        // If-Else 노드 변환
        ...(node.type === 'if-else' && {
          cases: (node.data as any).cases || [],
        }),

        // Question Classifier 노드 변환
        ...(node.type === 'question-classifier' && {
          query_variable_selector: node.data.query_variable_selector || [],
          model: node.data.model,
          classes: node.data.classes || [],
          instruction: node.data.instruction || '',
          memory: node.data.memory,
          vision: node.data.vision,
        }),

        // Tavily Search 노드 역변환
        ...(node.type === 'tavily-search' && {
          search_depth: node.data.search_depth || 'basic',
          topic: node.data.topic || 'general',
          max_results: node.data.max_results || 5,
          include_domains: node.data.include_domains || [],
          exclude_domains: node.data.exclude_domains || [],
          time_range: node.data.time_range || null,
          start_date: node.data.start_date || null,
          end_date: node.data.end_date || null,
          include_answer: node.data.include_answer || false,
          include_raw_content: node.data.include_raw_content || false,
        }),

        // Assigner 노드 역변환
        ...(node.type === 'assigner' && {
          version: node.data.version || '2',
          operations: (node.data.operations || []).map((op: any, index: number) => ({
            id: `op_${index}_${Date.now()}`,
            write_mode: op.write_mode,
            input_type: op.input_type,
            constant_value: op.constant_value,
            // target_variable와 source_variable는 엣지 연결로부터 복원됨
          })),
          ui_state: {
            expanded: true,
            selected_operation: undefined,
          },
        }),

        // Answer 노드 역변환
        ...(node.type === 'answer' && {
          template: node.data.template || '',
          description: node.data.description || '',
        }),
      },
    })),

    edges: workflow.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type || 'custom',
      sourceHandle: edge.source_port || undefined,
      targetHandle: edge.target_port || undefined,
      data: {
        sourceType: edge.data.source_type as BlockEnum,
        targetType: edge.data.target_type as BlockEnum,
      },
    })),
  };
};
 
const serializePorts = (ports?: NodePortSchema | null) => {
  if (!ports) return undefined;
  const mapPort = (port: PortDefinition) => ({
    name: port.name,
    type: port.type,
    required: port.required,
    default_value: port.default_value,
    description: port.description,
    display_name: port.display_name,
  });

  return {
    inputs: ports.inputs.map(mapPort),
    outputs: ports.outputs.map(mapPort),
  };
};

const deserializePorts = (
  ports?: BackendNode['ports']
): NodePortSchema | undefined => {
  if (!ports) return undefined;
  const mapPort = (port: BackendNode['ports']['inputs'][number]) => ({
    name: port.name,
    type: port.type as PortDefinition['type'],
    required: port.required,
    default_value: port.default_value,
    description: port.description ?? '',
    display_name: port.display_name ?? port.name,
  });

  return {
    inputs: (ports.inputs || []).map(mapPort),
    outputs: (ports.outputs || []).map(mapPort),
  };
};

const serializeVariableMappings = (
  mappings?: NodeVariableMappings
) => {
  if (!mappings) return undefined;

  return Object.entries(mappings).reduce<BackendNode['variable_mappings']>(
    (acc, [key, mapping]) => {
      if (!mapping) return acc;

      const source =
        typeof mapping === 'string'
          ? { variable: mapping, value_type: PortType.ANY }
          : mapping.source;

      if (!source || !source.variable) {
        return acc;
      }

      acc[key] = {
        target_port: mapping.target_port || key,
        source: {
          variable: source.variable,
          value_type: source.value_type,
        },
      };
      return acc;
    },
    {}
  );
};

const deserializeVariableMappings = (
  mappings?: BackendNode['variable_mappings']
): NodeVariableMappings | undefined => {
  if (!mappings) return undefined;

  return Object.entries(mappings).reduce<NodeVariableMappings>(
    (acc, [key, mapping]) => {
      if (!mapping) return acc;
      acc[key] = {
        target_port: mapping.target_port,
        source: {
          variable: mapping.source.variable,
          value_type: mapping.source.value_type as VariableMapping['source']['value_type'],
        },
      };
      return acc;
    },
    {}
  );
};

const extractSelectorFromMapping = (mapping: unknown): string | null => {
  if (!mapping) return null;
  if (typeof mapping === 'string') {
    return mapping;
  }
  if (typeof mapping === 'object') {
    const candidate = mapping as Record<string, any>;
    if (typeof candidate.variable === 'string') {
      return candidate.variable;
    }
    if (
      candidate.source &&
      typeof candidate.source === 'object' &&
      typeof candidate.source.variable === 'string'
    ) {
      return candidate.source.variable;
    }
  }
  return null;
};

const inferEdgeDataType = (nodes: Node[], edge: Edge): string | undefined => {
  const sourceNode = nodes.find((node) => node.id === edge.source);
  if (!sourceNode) {
    return undefined;
  }

  const sourceHandle = edge.sourceHandle;
  if (sourceHandle && sourceNode.data?.ports) {
    const port = sourceNode.data.ports.outputs.find(
      (output) => output.name === sourceHandle
    );
    if (port?.type) {
      return port.type;
    }
  }

  const targetNode = nodes.find((node) => node.id === edge.target);
  const mappings = (targetNode?.data?.variable_mappings ||
    {}) as NodeVariableMappings | undefined;
  if (!mappings || !sourceNode.data?.ports) {
    return undefined;
  }

  const outputs = sourceNode.data.ports.outputs || [];
  for (const mapping of Object.values(mappings)) {
    const selector = extractSelectorFromMapping(mapping);
    if (!selector) {
      continue;
    }

    if (
      selector.startsWith('env.') ||
      selector.startsWith('conv.') ||
      selector.startsWith('sys.')
    ) {
      continue;
    }

    const [nodeId, portName] = selector.split('.', 2);
    if (nodeId !== edge.source || !portName) {
      continue;
    }

    const matchedPort = outputs.find((output) => output.name === portName);
    if (matchedPort?.type) {
      return matchedPort.type;
    }
  }

  return undefined;
};

/**
 * 모델명에서 제공자 추출
 * "provider/model" 형식 지원 추가
 */
const extractProviderSlug = (model: unknown): string => {
  if (typeof model === 'object' && model !== null && 'provider' in model) {
    return String((model as { provider?: string }).provider || '').toLowerCase();
  }

  const normalized = typeof model === 'string' ? model : '';

  // "provider/model" 형식 파싱 (예: "anthropic/claude", "openai/gpt-4")
  if (normalized.includes('/')) {
    const [provider] = normalized.split('/');
    const providerLower = provider.toLowerCase();
    if (providerLower === 'openai') return 'openai';
    if (providerLower === 'anthropic') return 'anthropic';
    if (providerLower === 'google') return 'google';
  }

  // 기존 로직: 모델명으로 추론
  if (normalized.startsWith('gpt')) return 'openai';
  if (normalized.startsWith('claude')) return 'anthropic';
  if (normalized.includes('gemini')) return 'google';

  return 'openai';
};

/**
 * "provider/model" 형식에서 실제 모델명 추출
 */
const extractModelName = (model: unknown): string => {
  const normalized = typeof model === 'string' ? model : '';
  if (normalized.includes('/')) {
    const [, modelName] = normalized.split('/');
    return modelName || normalized;
  }
  return normalized || 'gpt-4o-mini';
};

/**
 * 문자열 첫 글자 대문자 변환
 */
function normalizeRetrievalModeValue(
  mode?: unknown
): 'semantic' | 'keyword' | 'hybrid' {
  if (typeof mode !== 'string') {
    return 'semantic';
  }
  const normalized = mode.toLowerCase();
  if (normalized.startsWith('keyword')) return 'keyword';
  if (normalized.startsWith('hybrid')) return 'hybrid';
  return 'semantic';
}
