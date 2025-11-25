/**
 * Deployment Store
 * 배포 관리 관련 상태 관리
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { deploymentApi } from '../api/deploymentApi.ts';
import type {
  Deployment,
  DeploymentCreateRequest,
  DeploymentStatus,
  WidgetConfig,
} from '../types/deployment.ts';

interface DeploymentStore {
  // State - 배포 정보
  deployment: Deployment | null;
  isLoading: boolean;
  error: string | null;

  // State - 다이얼로그
  isEmbedDialogOpen: boolean;
  isApiDialogOpen: boolean;

  // State - 로컬 편집용 위젯 설정
  widgetConfig: WidgetConfig;

  // Actions - 배포 CRUD
  fetchDeployment: (botId: string) => Promise<void>;
  createOrUpdateDeployment: (
    botId: string,
    data: DeploymentCreateRequest
  ) => Promise<void>;
  updateStatus: (
    botId: string,
    status: DeploymentStatus,
    reason?: string
  ) => Promise<void>;
  deleteDeployment: (botId: string) => Promise<void>;

  // Actions - 위젯 설정
  updateWidgetConfig: (config: Partial<WidgetConfig>) => void;
  resetWidgetConfig: () => void;

  // Actions - 다이얼로그 제어
  openEmbedDialog: () => void;
  closeEmbedDialog: () => void;
  openApiDialog: () => void;
  closeApiDialog: () => void;

  // Actions - 에러 관리
  resetError: () => void;

  // Actions - 초기화
  reset: () => void;
}

const initialWidgetConfig: WidgetConfig = {
  theme: 'light',
  position: 'bottom-right',
  auto_open: false,
  auto_open_delay: 5000,
  welcome_message: '무엇이든 편하게 물어보세요😊',
  placeholder_text: '예: 이번 주말 데이트 룩 추천해줘, 30대 휴가를 함께해줘',
  primary_color: '#FF8B7B',
  bot_name: 'AI쇼핑 어시스턴트',
  avatar_url: null,
  show_typing_indicator: true,
  enable_file_upload: false,
  max_file_size_mb: 10,
  allowed_file_types: ['pdf', 'jpg', 'png', 'doc', 'docx'],
  enable_feedback: true,
  enable_sound: true,
  save_conversation: true,
  conversation_storage: 'localStorage',
  custom_css: '',
  custom_js: '',
};

export const useDeploymentStore = create<DeploymentStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      deployment: null,
      isLoading: false,
      error: null,
      isEmbedDialogOpen: false,
      isApiDialogOpen: false,
      widgetConfig: initialWidgetConfig,

      // 배포 조회
      fetchDeployment: async (botId: string) => {
        set({ isLoading: true, error: null });
        try {
          const deployment = await deploymentApi.get(botId);
          set({
            deployment,
            isLoading: false,
            // 배포가 있으면 위젯 설정을 로컬 편집용 상태로 복사
            widgetConfig: deployment?.widget_config || initialWidgetConfig,
          });
        } catch (error: any) {
          // 404 에러 또는 "Deployment not found" 메시지는 배포가 없는 정상 상태로 처리
          const isDeploymentNotFound =
            error.response?.status === 404 ||
            error.message?.includes('Deployment not found') ||
            error.message?.includes('not found');

          if (isDeploymentNotFound) {
            set({
              deployment: null,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              error: error.message || '배포 조회에 실패했습니다',
              isLoading: false,
            });
          }
        }
      },

      // 배포 생성 또는 업데이트
      createOrUpdateDeployment: async (
        botId: string,
        data: DeploymentCreateRequest
      ) => {
        set({ isLoading: true, error: null });
        try {
          const deployment = await deploymentApi.createOrUpdate(botId, data);
          set({
            deployment,
            isLoading: false,
            widgetConfig: deployment.widget_config,
          });
        } catch (error: any) {
          set({
            error: error.message || '배포 생성/업데이트에 실패했습니다',
            isLoading: false,
          });
          throw error;
        }
      },

      // 배포 상태 변경
      updateStatus: async (
        botId: string,
        status: DeploymentStatus,
        reason?: string
      ) => {
        set({ isLoading: true, error: null });
        try {
          await deploymentApi.updateStatus(botId, { status, reason });

          // 상태 변경 후 배포 정보 다시 조회
          await get().fetchDeployment(botId);
        } catch (error: any) {
          set({
            error: error.message || '배포 상태 변경에 실패했습니다',
            isLoading: false,
          });
          throw error;
        }
      },

      // 배포 삭제
      deleteDeployment: async (botId: string) => {
        set({ isLoading: true, error: null });
        try {
          await deploymentApi.delete(botId);
          set({
            deployment: null,
            isLoading: false,
            widgetConfig: initialWidgetConfig,
          });
        } catch (error: any) {
          set({
            error: error.message || '배포 삭제에 실패했습니다',
            isLoading: false,
          });
          throw error;
        }
      },

      // 로컬 위젯 설정 업데이트 (아직 서버 전송 안 함)
      updateWidgetConfig: (config: Partial<WidgetConfig>) =>
        set((state) => ({
          widgetConfig: { ...state.widgetConfig, ...config },
        })),

      // 위젯 설정 초기화
      resetWidgetConfig: () =>
        set({
          widgetConfig: get().deployment?.widget_config || initialWidgetConfig,
        }),

      // 웹사이트 임베드 다이얼로그 열기
      openEmbedDialog: () => set({ isEmbedDialogOpen: true }),

      // 웹사이트 임베드 다이얼로그 닫기
      closeEmbedDialog: () => set({ isEmbedDialogOpen: false }),

      // API 참조 다이얼로그 열기
      openApiDialog: () => set({ isApiDialogOpen: true }),

      // API 참조 다이얼로그 닫기
      closeApiDialog: () => set({ isApiDialogOpen: false }),

      // 에러 초기화
      resetError: () => set({ error: null }),

      // 전체 상태 초기화
      reset: () =>
        set({
          deployment: null,
          isLoading: false,
          error: null,
          isEmbedDialogOpen: false,
          isApiDialogOpen: false,
          widgetConfig: initialWidgetConfig,
        }),
    }),
    {
      name: 'DeploymentStore',
    }
  )
);

// Selectors
export const selectDeployment = (state: DeploymentStore) => state.deployment;
export const selectIsLoading = (state: DeploymentStore) => state.isLoading;
export const selectError = (state: DeploymentStore) => state.error;
export const selectIsEmbedDialogOpen = (state: DeploymentStore) =>
  state.isEmbedDialogOpen;
export const selectIsApiDialogOpen = (state: DeploymentStore) =>
  state.isApiDialogOpen;
export const selectWidgetConfig = (state: DeploymentStore) =>
  state.widgetConfig;
export const selectEmbedScript = (state: DeploymentStore) =>
  state.deployment?.embed_script || null;
export const selectWidgetKey = (state: DeploymentStore) =>
  state.deployment?.widget_key || null;
export const selectDeploymentStatus = (state: DeploymentStore) =>
  state.deployment?.status || null;
