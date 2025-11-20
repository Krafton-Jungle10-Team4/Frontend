import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ApiConfig,
  WorkflowRequest,
  WorkflowResponse,
  ExecutionRecord,
} from '../types';
import { createDemoAppClient } from '../api/demoAppClient';

interface DemoAppStore {
  // 상태
  apiConfig: ApiConfig;
  currentRequest: WorkflowRequest;
  currentResponse: WorkflowResponse | null;
  executionHistory: ExecutionRecord[];
  isExecuting: boolean;
  error: string | null;

  // Actions
  setApiConfig: (config: ApiConfig) => void;
  setCurrentRequest: (request: WorkflowRequest) => void;
  executeWorkflow: () => Promise<void>;
  clearResponse: () => void;
  clearHistory: () => void;
  loadHistoryItem: (recordId: string) => void;
}

const DEFAULT_API_CONFIG: ApiConfig = {
  apiUrl: 'http://localhost:8000/api/v1/public',
  apiKey: '',
  botId: '',
};

const DEFAULT_REQUEST: WorkflowRequest = {
  inputs: {
    user_query: '',
  },
  response_mode: 'blocking',
};

export const useDemoAppStore = create<DemoAppStore>()(
  persist(
    (set, get) => ({
      // 초기 상태
      apiConfig: DEFAULT_API_CONFIG,
      currentRequest: DEFAULT_REQUEST,
      currentResponse: null,
      executionHistory: [],
      isExecuting: false,
      error: null,

      // API 설정 업데이트
      setApiConfig: (config) => set({ apiConfig: config }),

      // 현재 요청 업데이트
      setCurrentRequest: (request) => set({ currentRequest: request }),

      // 워크플로우 실행
      executeWorkflow: async () => {
        const { apiConfig, currentRequest } = get();

        if (!apiConfig.apiKey) {
          set({ error: 'API Key가 필요합니다.' });
          return;
        }

        set({ isExecuting: true, error: null });

        const startTime = Date.now();
        const recordId = `exec_${Date.now()}`;

        try {
          // API 클라이언트 생성
          const client = createDemoAppClient(
            apiConfig.apiUrl,
            apiConfig.apiKey
          );

          // 워크플로우 실행
          const response = await client.executeWorkflow(currentRequest);

          const duration = Date.now() - startTime;

          // 실행 기록 저장
          const record: ExecutionRecord = {
            id: recordId,
            timestamp: new Date().toISOString(),
            request: currentRequest,
            response,
            status: 'success',
            duration,
          };

          set((state) => ({
            currentResponse: response,
            executionHistory: [record, ...state.executionHistory].slice(0, 50), // 최대 50개
            isExecuting: false,
          }));
        } catch (error: any) {
          const duration = Date.now() - startTime;

          const record: ExecutionRecord = {
            id: recordId,
            timestamp: new Date().toISOString(),
            request: currentRequest,
            response: null,
            status: 'error',
            error: error.message,
            duration,
          };

          set((state) => ({
            error: error.message,
            executionHistory: [record, ...state.executionHistory].slice(0, 50),
            isExecuting: false,
          }));
        }
      },

      // 응답 초기화
      clearResponse: () => set({ currentResponse: null, error: null }),

      // 히스토리 초기화
      clearHistory: () => set({ executionHistory: [] }),

      // 히스토리 항목 불러오기
      loadHistoryItem: (recordId) => {
        const { executionHistory } = get();
        const record = executionHistory.find((r) => r.id === recordId);

        if (record) {
          set({
            currentRequest: record.request,
            currentResponse: record.response,
          });
        }
      },
    }),
    {
      name: 'demo-app-storage',
      partialize: (state) => ({
        apiConfig: state.apiConfig,
        executionHistory: state.executionHistory,
      }),
    }
  )
);

