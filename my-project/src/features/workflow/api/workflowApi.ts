/**
 * Workflow API
 *
 * 워크플로우 관련 API 함수
 */

import { apiClient } from '@/shared/api/client';
import { API_ENDPOINTS } from '@/shared/constants/apiEndpoints';
import { transformToBackend } from '@/shared/utils/workflowTransform';
import type { Node, Edge } from '@/shared/types/workflow.types';
import type {
  NodeTypeResponse,
  NodeTypeSchema,
  ModelResponse,
  WorkflowValidationResponse,
} from '../types/api.types';

export const workflowApi = {
  /**
   * 노드 타입 목록 조회
   */
  getNodeTypes: async (): Promise<NodeTypeResponse[]> => {
    const { data } = await apiClient.get(API_ENDPOINTS.WORKFLOWS.NODE_TYPES);
    return data.node_types;
  },

  /**
   * 특정 노드 타입 스키마 조회
   */
  getNodeTypeSchema: async (type: string): Promise<NodeTypeSchema> => {
    const { data } = await apiClient.get(
      API_ENDPOINTS.WORKFLOWS.NODE_TYPE_DETAIL(type)
    );
    return data;
  },

  /**
   * LLM 모델 목록 조회
   */
  getModels: async (): Promise<ModelResponse[]> => {
    const { data } = await apiClient.get(API_ENDPOINTS.WORKFLOWS.MODELS);
    return data.models;
  },

  /**
   * 워크플로우 검증 (일반)
   */
  validate: async (
    nodes: Node[],
    edges: Edge[]
  ): Promise<WorkflowValidationResponse> => {
    const payload = transformToBackend(nodes, edges);
    const { data } = await apiClient.post(
      API_ENDPOINTS.WORKFLOWS.VALIDATE,
      payload
    );
    return data;
  },

  /**
   * 봇 워크플로우 저장
   */
  saveBotWorkflow: async (
    botId: string,
    nodes: Node[],
    edges: Edge[]
  ): Promise<void> => {
    const payload = transformToBackend(nodes, edges);
    await apiClient.put(API_ENDPOINTS.WORKFLOWS.BOT_WORKFLOW(botId), payload);
  },

  /**
   * 봇 워크플로우 검증 (저장 전)
   */
  validateBotWorkflow: async (
    botId: string,
    nodes: Node[],
    edges: Edge[]
  ): Promise<WorkflowValidationResponse> => {
    const payload = transformToBackend(nodes, edges);
    const { data } = await apiClient.post(
      API_ENDPOINTS.WORKFLOWS.BOT_WORKFLOW_VALIDATE(botId),
      payload
    );
    return data;
  },
};
