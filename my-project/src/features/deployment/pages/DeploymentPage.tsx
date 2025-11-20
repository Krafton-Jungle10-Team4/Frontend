import { useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@shared/components/button';
import { Badge } from '@shared/components/badge';
import { Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@shared/components/tooltip';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shared/components/tabs';
import {
  useDeploymentStore,
  selectDeployment,
  selectIsLoading,
  selectError,
} from '../stores/deploymentStore.ts';
import { EmbedWebsiteDialog } from '../components/EmbedWebsiteDialog.tsx';
import { ApiReferenceDialog } from '../components/ApiReferenceDialog.tsx';
import { APIDeploymentPanel } from '../components/APIDeploymentPanel.tsx';
import { IntegrationsPanel } from '@/features/integrations';
import { DEPLOYMENT_STATUS_LABELS } from '../types/deployment.ts';

export function DeploymentPage() {
  const { botId } = useParams<{ botId: string }>();
  const deployment = useDeploymentStore(selectDeployment);
  const isLoading = useDeploymentStore(selectIsLoading);
  const error = useDeploymentStore(selectError);
  const fetchDeployment = useDeploymentStore((state) => state.fetchDeployment);
  const reset = useDeploymentStore((state) => state.reset);
  const openEmbedDialog = useDeploymentStore((state) => state.openEmbedDialog);
  const openApiDialog = useDeploymentStore((state) => state.openApiDialog);

  useEffect(() => {
    if (botId) {
      fetchDeployment(botId);
    }
    return () => reset();
  }, [botId, fetchDeployment, reset]);

  const canRunApp =
    deployment?.status === 'published' && Boolean(deployment?.widget_key);

  const handleRunApp = useCallback(() => {
    if (!canRunApp || !deployment?.widget_key) return;
    const appUrl = `${window.location.origin}/app/${deployment.widget_key}`;
    window.open(appUrl, '_blank', 'noopener');
  }, [canRunApp, deployment]);

  const runAppDisabledReason = !deployment?.widget_key
    ? 'Widget Key가 없어서 앱을 실행할 수 없습니다.'
    : '게시 상태일 때만 앱을 실행할 수 있습니다.';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">배포 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <p className="text-lg font-semibold text-destructive mb-2">오류 발생</p>
          <p className="text-sm text-muted-foreground">배포 정보를 불러오지 못했습니다: {error}</p>
        </div>
      </div>
    );
  }

  if (!deployment) {
    return (
      <div className="container mx-auto p-8">
        <div className="rounded-lg border p-6 bg-muted/30 space-y-4">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">아직 배포가 없습니다.</p>
            <p className="text-sm text-muted-foreground mb-4">
              Slack 연동을 하려면 먼저 워크플로우를 게시해야 합니다.
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">
              📝 다음 단계를 따라주세요:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-sm text-blue-800">
              <li>워크플로우 빌더로 돌아가기</li>
              <li>워크플로우 작성 및 저장</li>
              <li>우측 상단 "라이브러리에 게시" 버튼 클릭</li>
              <li>게시 완료 후 이 페이지에서 Slack 연동</li>
            </ol>
          </div>
          
          <div className="flex justify-center">
            <Button
              onClick={() => window.location.href = `/workspace/bot/${botId}/workflow`}
              variant="default"
            >
              워크플로우로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="container mx-auto p-8 space-y-8">
        <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-sm text-muted-foreground mb-1">봇 ID {deployment.bot_id}</p>
          <h1 className="text-3xl font-bold">배포 관리</h1>
          <div className="flex items-center gap-3 mt-3">
            <Badge variant="outline">
              {DEPLOYMENT_STATUS_LABELS[deployment.status]}
            </Badge>
            {deployment.version && (
              <span className="text-sm text-muted-foreground">v{deployment.version}</span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {canRunApp ? (
            <Button onClick={handleRunApp}>앱 실행</Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <Button
                    onClick={handleRunApp}
                    disabled
                    className="pointer-events-none opacity-70"
                  >
                    앱 실행
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>{runAppDisabledReason}</TooltipContent>
            </Tooltip>
          )}
          <Button variant="outline" onClick={openEmbedDialog}>
            사이트에 삽입
          </Button>
          <Button variant="outline" onClick={openApiDialog}>
            API 참조
          </Button>
        </div>
      </div>

      {/* 탭 추가 */}
      <Tabs defaultValue="widget" className="w-full">
        <TabsList>
          <TabsTrigger value="widget">Widget</TabsTrigger>
          <TabsTrigger value="app">앱 실행</TabsTrigger>
          <TabsTrigger value="api">API 배포</TabsTrigger>
          <TabsTrigger value="integrations">연동</TabsTrigger>
        </TabsList>

        <TabsContent value="widget">
          <section className="rounded-lg border p-6 space-y-3">
            <h2 className="text-xl font-semibold">배포 정보</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Widget Key</dt>
                <dd className="font-mono">{deployment.widget_key}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">허용 도메인</dt>
                <dd>
                  {deployment.allowed_domains?.length
                    ? deployment.allowed_domains.join(', ')
                    : '모든 도메인 허용'}
                </dd>
              </div>
            </dl>
          </section>
        </TabsContent>

        <TabsContent value="app">
          <section className="rounded-lg border p-6 space-y-3">
            <h2 className="text-xl font-semibold">앱 실행 정보</h2>
            <p className="text-muted-foreground">
              앱 실행 기능은 위젯 배포 후 사용할 수 있습니다.
            </p>
          </section>
        </TabsContent>

        <TabsContent value="api">
          <APIDeploymentPanel botId={deployment.bot_id} />
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationsPanel botId={deployment.bot_id} />
        </TabsContent>
      </Tabs>

        <EmbedWebsiteDialog />
        <ApiReferenceDialog />
      </div>
    </div>
  );
}
