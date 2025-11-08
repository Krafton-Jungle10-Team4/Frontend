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
    openEmbedDialog,
    openApiDialog,
    updateStatus,
  } = useDeploymentStore();

  const { saveWorkflow } = useWorkflowStore();

  /**
   * 업데이트 게시
   * - 워크플로우 저장
   * - 배포 상태를 'published'로 변경
   *
   * Note: updateStatus 내부에서 fetchDeployment를 호출하므로
   * 여기서 별도로 fetchDeployment를 호출하지 않음 (중복 요청 방지)
   */
  const publishUpdate = useCallback(async () => {
    try {
      // 1. 워크플로우 저장
      await saveWorkflow(botId);

      // 2. 배포 상태를 'published'로 변경 (내부에서 fetchDeployment 자동 호출)
      await updateStatus(botId, 'published');

      toast.success('배포가 업데이트되었습니다');
    } catch (error) {
      console.error('Failed to publish update:', error);
      toast.error('배포 업데이트에 실패했습니다');
    }
  }, [botId, saveWorkflow, updateStatus]);

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
