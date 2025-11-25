/**
 * usePublishActions Hook
 * 게시하기 관련 모든 액션 로직을 제공하는 훅
 */

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useDeploymentStore } from '@/features/deployment/stores/deploymentStore';
import { useWorkflowStore } from '../stores/workflowStore';
import { botApi } from '@/features/bot/api/botApi';
import { workflowApi } from '../api/workflowApi';
import { deploymentApi } from '@/features/deployment/api/deploymentApi';
import type { LibraryMetadata } from '../types/workflow.types';

export function usePublishActions(botId: string) {
  const {
    deployment,
    openEmbedDialog,
    openApiDialog,
    updateStatus,
    createOrUpdateDeployment,
    widgetConfig,
    fetchDeployment,
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
        throw new Error('발행할 Draft가 없습니다');
      }

      toast.success('게시 성공', {
        description: `${publishedVersion.version} 버전이 라이브러리에 게시되었습니다.`,
      });

      // 3. 발행된 버전 ID 저장 및 배포 확인 모달 오픈
      setPublishedVersionId(publishedVersion.id);
      setIsDeployDialogOpen(true);

    } catch (error: any) {
      console.error('Publish error:', error);
      toast.error('게시 실패', {
        description: error.message || '게시 중 오류가 발생했습니다.',
      });
      throw error;
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
   * 배포 확인 및 생성
   * widget_key가 없으면 자동으로 배포 생성
   */
  const ensureDeployment = useCallback(async (): Promise<string | null> => {
    try {
      // 이미 widget_key가 있으면 바로 반환
      if (deployment?.bot_id === botId && deployment?.widget_key) {
        return deployment.widget_key;
      }

      // 배포 정보 새로 조회
      await fetchDeployment(botId);

      // 조회 후에도 widget_key가 없으면 배포 생성
      const refreshedDeployment = useDeploymentStore.getState().deployment;
      if (refreshedDeployment?.bot_id === botId && refreshedDeployment?.widget_key) {
        return refreshedDeployment.widget_key;
      }

      // 발행된 버전 조회
      const versions = await workflowApi.listWorkflowVersions(botId, { status: 'published' });
      const publishedVersion = versions[0];

      if (!publishedVersion) {
        toast.error('발행된 버전이 없습니다', {
          description: '먼저 워크플로우를 게시해주세요.',
        });
        return null;
      }

      // 기본 Widget 설정으로 배포 생성
      const defaultWidgetConfig = {
        theme: 'light' as const,
        position: 'bottom-right' as const,
        auto_open: false,
        primary_color: '#0066FF',
      };

      toast.info('배포 중...', {
        description: 'Widget Key를 생성하고 있습니다.',
      });

      const newDeployment = await deploymentApi.createOrUpdate(botId, {
        workflow_version_id: publishedVersion.id,
        status: 'published',
        widget_config: defaultWidgetConfig,
      });

      // 배포 정보 다시 로드
      await fetchDeployment(botId);

      toast.success('배포 완료', {
        description: 'Widget Key가 생성되었습니다.',
      });

      return newDeployment.widget_key;
    } catch (error) {
      console.error('Deployment error:', error);
      toast.error('배포 실패', {
        description: '배포 중 오류가 발생했습니다.',
      });
      return null;
    }
  }, [botId, deployment, fetchDeployment]);

  /**
   * 앱 실행
   * 독립 실행형 챗봇 페이지를 새 탭에서 열기
   */
  const runApp = useCallback(async () => {
    try {
      // widget_key 확인 및 배포 생성
      const widgetKey = await ensureDeployment();

      if (!widgetKey) {
        return; // 배포 실패 시 종료
      }

      // Workflow V2 모드 활성화
      await botApi.enableWorkflowV2(botId);

      // Widget Key로 앱 URL 생성
      const appUrl = `${window.location.origin}/app/${widgetKey}`;
      window.open(appUrl, '_blank', 'noopener');
    } catch (error) {
      console.error('Failed to run app:', error);
      toast.error('앱 실행 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  }, [botId, ensureDeployment]);

  /**
   * 사이트에 삽입
   * EmbedWebsiteDialog 모달 열기
   */
  const embedWebsite = useCallback(() => {
    openEmbedDialog();
  }, [openEmbedDialog]);

  /**
   * Marketplace에서 열기
   * 향후 구현: Marketplace 페이지로 이동
   */
  const openMarketplace = useCallback(() => {
    toast.info('Marketplace 기능은 준비 중입니다');
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
    openMarketplace,
    apiReference,
    canRunApp,
    ensureDeployment,
    // 배포 확인 모달 상태
    isDeployDialogOpen,
    setIsDeployDialogOpen,
    publishedVersionId,
  };
}
