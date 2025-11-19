/**
 * usePublishActions Hook
 * 게시하기 관련 모든 액션 로직을 제공하는 훅
 */

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useDeploymentStore } from '@/features/deployment/stores/deploymentStore';
import { useWorkflowStore } from '../stores/workflowStore';
import { botApi } from '@/features/bot/api/botApi';
import type { LibraryMetadata } from '../types/workflow.types';

export function usePublishActions(botId: string) {
  const {
    deployment,
    openEmbedDialog,
    openApiDialog,
    updateStatus,
    createOrUpdateDeployment,
    widgetConfig,
  } = useDeploymentStore();

  const { saveWorkflow, publishWorkflow } = useWorkflowStore();

  // 배포 확인 모달 상태
  const [isDeployDialogOpen, setIsDeployDialogOpen] = useState(false);
  const [publishedVersionId, setPublishedVersionId] = useState<string | null>(null);

  /**
   * 업데이트 게시
   * - 워크플로우 저장 및 발행
   * - 배포 확인 모달 표시
   */
  const publishUpdate = useCallback(async (libraryMetadata: LibraryMetadata) => {
    try {
      // 1. 워크플로우 저장
      await saveWorkflow(botId);

      // 2. 워크플로우 발행 (라이브러리 메타데이터 필수)
      const publishedVersion = await publishWorkflow(botId, libraryMetadata);

      if (!publishedVersion) {
        toast.error('발행할 Draft가 없습니다');
        return;
      }

      toast.success('발행 성공', {
        description: `${publishedVersion.version} 버전이 라이브러리에 발행되었습니다.`,
      });

      // 3. 발행된 버전 ID 저장 및 배포 확인 모달 오픈
      setPublishedVersionId(publishedVersion.id);
      setIsDeployDialogOpen(true);

    } catch (error: any) {
      console.error('Publish error:', error);
      toast.error('발행 실패', {
        description: error.message || '발행 중 오류가 발생했습니다.',
      });
    }
  }, [botId, saveWorkflow, publishWorkflow]);

  /**
   * 앱 실행 가능 여부 판단
   */
  const canRunApp =
    deployment?.bot_id === botId &&
    deployment?.status === 'published' &&
    Boolean(deployment?.widget_key);

  /**
   * 앱 실행
   * 독립 실행형 챗봇 페이지를 새 탭에서 열기
   */
  const runApp = useCallback(async () => {
    if (!canRunApp || !deployment?.widget_key) {
      toast.error('앱을 실행하려면 봇을 게시하고 Widget Key를 발급받아야 합니다.');
      return;
    }

    try {
      await botApi.enableWorkflowV2(botId);
    } catch (error) {
      console.error('Failed to enable workflow V2 mode:', error);
      toast.error('워크플로우 V2 모드를 활성화하지 못했습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    const appUrl = `${window.location.origin}/app/${deployment.widget_key}`;
    window.open(appUrl, '_blank', 'noopener');
  }, [botId, canRunApp, deployment]);

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
    canRunApp,
    // 배포 확인 모달 상태
    isDeployDialogOpen,
    setIsDeployDialogOpen,
    publishedVersionId,
  };
}
