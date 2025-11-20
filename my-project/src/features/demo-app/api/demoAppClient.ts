import axios, { AxiosInstance } from 'axios';
import { WorkflowRequest, WorkflowResponse } from '../types';

/**
 * Demo App API 클라이언트
 * 외부 API 엔드포인트 호출용
 */
export class DemoAppClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: apiUrl,
      timeout: 60000, // 60초
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 요청 인터셉터: API Key 자동 추가
    this.client.interceptors.request.use((config) => {
      config.headers['X-API-Key'] = this.apiKey;
      return config;
    });
  }

  /**
   * 워크플로우 실행
   */
  async executeWorkflow(
    request: WorkflowRequest
  ): Promise<WorkflowResponse> {
    try {
      const response = await this.client.post<WorkflowResponse>(
        '/workflows/run',
        request
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          error.response.data?.detail?.message ||
            error.response.data?.message ||
            'API request failed'
        );
      }
      throw error;
    }
  }

  /**
   * Alias로 워크플로우 실행
   */
  async executeWorkflowByAlias(
    alias: string,
    inputs: Record<string, any>,
    responseMode: 'blocking' | 'streaming' = 'blocking'
  ): Promise<WorkflowResponse> {
    try {
      const response = await this.client.post<WorkflowResponse>(
        `/workflows/run/${alias}`,
        {
          inputs,
          response_mode: responseMode,
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          error.response.data?.detail?.message || 'API request failed'
        );
      }
      throw error;
    }
  }

  /**
   * 실행 상태 조회
   */
  async getRunStatus(runId: string): Promise<WorkflowResponse> {
    const response = await this.client.get<WorkflowResponse>(
      `/workflows/runs/${runId}`
    );
    return response.data;
  }

  /**
   * 실행 중지
   */
  async stopRun(runId: string): Promise<void> {
    await this.client.post(`/workflows/runs/${runId}/stop`);
  }
}

export const createDemoAppClient = (apiUrl: string, apiKey: string) => {
  return new DemoAppClient(apiUrl, apiKey);
};

