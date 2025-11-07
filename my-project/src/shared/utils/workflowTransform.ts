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
          model: (node.data as any).model?.name || 'gpt-4',
          prompt_template: (node.data as any).prompt || '',
          temperature: (node.data as any).temperature || 0.7,
          max_tokens: (node.data as any).maxTokens || 500,
        }),

        // Knowledge Retrieval 노드 변환
        ...(node.data.type === BlockEnum.KnowledgeRetrieval && {
          dataset_id: (node.data as any).dataset || '',
          mode: ((node.data as any).retrievalMode?.toLowerCase() || 'semantic') as any,
          top_k: (node.data as any).topK || 5,
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
          model: {
            provider: extractProvider(node.data.model || ''),
            name: node.data.model || 'gpt-4',
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
 */
const extractProvider = (model: string): string => {
  if (model.startsWith('gpt')) return 'OpenAI';
  if (model.startsWith('claude')) return 'Anthropic';
  return 'Unknown';
};

/**
 * 문자열 첫 글자 대문자 변환
 */
const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
