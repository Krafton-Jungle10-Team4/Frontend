/**
 * 워크플로우 데이터 변환 유틸리티
 * 프론트엔드 스키마 ↔ 백엔드 스키마 변환
 */

import type { Node, Edge } from '@/shared/types/workflow.types';
import type { BackendWorkflow } from '@/shared/types/workflowTransform.types';
import { BlockEnum } from '@/shared/types/workflow.types';

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
          mode: ((node.data as any).retrievalMode?.toLowerCase() || 'semantic') as any,
          top_k: (node.data as any).topK || 5,
          document_ids: (node.data as any).documentIds || [],
        }),

        // MCP 노드 변환
        ...(node.data.type === BlockEnum.MCP && {
          provider_id: (node.data as any).provider_id || '',
          action: (node.data as any).action || '',
          parameters: (node.data as any).parameters || {},
        }),
      },
    })),

    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type || 'custom',
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
          retrievalMode: capitalize(node.data.mode || 'semantic'),
          topK: node.data.top_k || 5,
          documentIds: node.data.document_ids || [],
        }),

        // MCP 노드 변환
        ...(node.type === 'mcp' && {
          provider_id: node.data.provider_id || '',
          action: node.data.action || '',
          parameters: node.data.parameters || {},
        }),
      },
    })),

    edges: workflow.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type || 'custom',
      data: {
        sourceType: edge.data.source_type as BlockEnum,
        targetType: edge.data.target_type as BlockEnum,
      },
    })),
  };
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
const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
