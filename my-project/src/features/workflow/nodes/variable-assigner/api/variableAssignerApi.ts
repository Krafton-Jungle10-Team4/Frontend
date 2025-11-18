import { apiClient } from '@/shared/api/client';
import { API_ENDPOINTS } from '@/shared/constants/apiEndpoints';
import type { VariableAssignerNodeData } from '../types';

/**
 * 워크플로우 Draft Payload 타입
 */
interface WorkflowDraftPayload {
  graph: unknown;
  environment_variables: Record<string, unknown>;
  conversation_variables: Record<string, unknown>;
}

/**
 * 기본 워크플로우 변수
 */
const DEFAULT_WORKFLOW_VARIABLES = {
  environment_variables: {},
  conversation_variables: {},
};

/**
 * Variable Assigner 노드 API 클라이언트
 */
export const variableAssignerApi = {
  /**
   * 노드 기본 설정 가져오기
   * @param botId - 봇 ID
   * @returns Variable Assigner 노드의 기본 설정
   */
  async getDefaultConfig(botId: string): Promise<VariableAssignerNodeData> {
    const response = await apiClient.get<VariableAssignerNodeData>(
      API_ENDPOINTS.WORKFLOWS.DEFAULT_NODE_CONFIG(botId, 'variable-assigner')
    );
    return response.data;
  },

  /**
   * 노드 포트 스키마 가져오기
   * @param nodeId - 노드 ID
   * @returns 노드의 입력/출력 포트 정의
   */
  async getNodePorts(nodeId: string) {
    const response = await apiClient.get(
      API_ENDPOINTS.WORKFLOWS.NODE_PORTS(nodeId)
    );
    return response.data;
  },

  /**
   * 워크플로우 Draft 업데이트
   * Variable Assigner 노드가 포함된 전체 워크플로우 그래프를 저장
   * @param botId - 봇 ID
   * @param graph - 워크플로우 그래프 데이터
   * @param variables - 워크플로우 변수 (environment_variables, conversation_variables)
   * @returns 업데이트된 Draft 버전 정보
   */
  async updateDraft(
    botId: string,
    graph: any,
    variables: Partial<Omit<WorkflowDraftPayload, 'graph'>> = {}
  ) {
    const payload: WorkflowDraftPayload = {
      graph,
      environment_variables:
        variables.environment_variables ??
        DEFAULT_WORKFLOW_VARIABLES.environment_variables,
      conversation_variables:
        variables.conversation_variables ??
        DEFAULT_WORKFLOW_VARIABLES.conversation_variables,
    };

    const response = await apiClient.post(
      API_ENDPOINTS.WORKFLOWS.BOT_WORKFLOW_VERSION_DRAFT(botId),
      payload
    );
    return response.data;
  },
};
