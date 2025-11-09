/**
 * usePublishActions Hook
 * 게시하기 관련 모든 액션 로직을 제공하는 훅
 */

import { useCallback } from 'react';
import { toast } from 'sonner';
import { useDeploymentStore } from '@/features/deployment/stores/deploymentStore';
import { useWorkflowStore } from '../stores/workflowStore';

export function usePublishActions(botId: string) {
  const {
    deployment,
    openEmbedDialog,
    openApiDialog,
    updateStatus,
    createOrUpdateDeployment,
    widgetConfig,
  } = useDeploymentStore();

  const { saveWorkflow } = useWorkflowStore();

  /**
   * 업데이트 게시
   * - 워크플로우 저장
   * - 배포가 없으면 자동 생성, 있으면 상태만 변경
   */
  const publishUpdate = useCallback(async () => {
    try {
      // 1. 워크플로우 저장
      await saveWorkflow(botId);

      // 2. Deployment 존재 여부 확인 (현재 봇의 deployment인지 확인)
      const currentDeployment = useDeploymentStore.getState().deployment;
      const isCurrentBotDeployment = currentDeployment?.bot_id === botId;

      if (!currentDeployment || !isCurrentBotDeployment) {
        // Deployment가 없거나 다른 봇의 것이면 기본 설정으로 생성
        await createOrUpdateDeployment(botId, {
          status: 'published',
          allowed_domains: [],
          widget_config: widgetConfig,
        });
        toast.success('배포가 생성되었습니다');
      } else {
        // Deployment가 있으면 상태만 업데이트
        await updateStatus(botId, 'published');
        toast.success('배포가 업데이트되었습니다');
      }
    } catch (error: any) {
      console.error('Failed to publish update:', error);

      // 404 에러 처리 - 배포가 없으면 자동으로 생성 시도
      if (error.response?.status === 404) {
        try {
          await createOrUpdateDeployment(botId, {
            status: 'published',
            allowed_domains: [],
            widget_config: widgetConfig,
          });
          toast.success('배포가 생성되었습니다');
        } catch (retryError) {
          toast.error('배포 생성에 실패했습니다');
        }
      } else {
        toast.error('배포 업데이트에 실패했습니다');
      }
    }
  }, [botId, saveWorkflow, updateStatus, createOrUpdateDeployment, widgetConfig]);

  /**
   * 앱 실행
   * 향후 구현: 백엔드에서 미리보기 URL 제공 시 새 탭에서 열기
   */
  const runApp = useCallback(() => {
    toast.info('앱 실행 기능은 준비 중입니다');
  }, []);

  /**
   * 사이트에 삽입
   * EmbedWebsiteDialog 모달 열기
   */
  const embedWebsite = useCallback(() => {
    openEmbedDialog();
  }, [openEmbedDialog]);

  /**
   * Explore에서 열기
   * 향후 구현: Explore 페이지로 이동
   */
  const openExplore = useCallback(() => {
    toast.info('Explore 기능은 준비 중입니다');
  }, []);

  /**
   * API 참조 접근
   * ApiReferenceDialog 모달 열기
   */
  const apiReference = useCallback(() => {
    openApiDialog();
  }, [openApiDialog]);

  return {
    publishUpdate,
    runApp,
    embedWebsite,
    openExplore,
    apiReference,
  };
}
