import { useCallback, useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@shared/components/dialog';
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
import { VersionSelector } from '../components/VersionSelector.tsx';

export function DeploymentPage() {
  const { botId } = useParams<{ botId: string }>();
  const location = useLocation();
  const deployment = useDeploymentStore(selectDeployment);
  const isLoading = useDeploymentStore(selectIsLoading);
  const error = useDeploymentStore(selectError);
  const fetchDeployment = useDeploymentStore((state) => state.fetchDeployment);
  const reset = useDeploymentStore((state) => state.reset);
  const openEmbedDialog = useDeploymentStore((state) => state.openEmbedDialog);
  const openApiDialog = useDeploymentStore((state) => state.openApiDialog);

  const [showDeploymentModal, setShowDeploymentModal] = useState(false);

  // 워크플로우에서 선택된 버전 ID 가져오기
  const selectedVersionIdFromState = (location.state as { selectedVersionId?: string })?.selectedVersionId;

  useEffect(() => {
    console.log('[DeploymentPage] Received selectedVersionId from navigation:', selectedVersionIdFromState);
    console.log('[DeploymentPage] Full location.state:', location.state);
  }, [selectedVersionIdFromState, location.state]);

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
      <div className="mx-auto max-w-[60%] p-8">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <p className="text-lg font-semibold text-destructive mb-2">오류 발생</p>
          <p className="text-sm text-muted-foreground">배포 정보를 불러오지 못했습니다: {error}</p>
        </div>
      </div>
    );
  }

  if (!deployment) {
    return (
      <div className="mx-auto max-w-[60%] p-8 space-y-6">
        {/* 헤더 */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">배포 관리</h1>
          <p className="text-muted-foreground">
            게시된 워크플로우 버전을 선택하여 배포할 수 있습니다.
          </p>
        </div>

        {/* 배포 안내 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900 mb-2">
            📝 배포 프로세스:
          </p>
          <ol className="list-decimal list-inside space-y-1.5 text-sm text-blue-800">
            <li>워크플로우 빌더에서 워크플로우 작성 및 저장</li>
            <li>우측 상단 "라이브러리에 게시" 버튼 클릭하여 버전 생성</li>
            <li>아래에서 게시된 버전 중 하나를 선택하여 배포</li>
            <li>배포 후 Widget 임베드, Slack 연동, API 활용 가능</li>
          </ol>
        </div>

        {/* 버전 선택 및 배포 */}
        <div className="rounded-lg border p-6 bg-white">
          <VersionSelector
            botId={botId!}
            preSelectedVersionId={selectedVersionIdFromState}
            onDeploySuccess={() => {
              fetchDeployment(botId!);
            }}
          />
        </div>

        {/* 워크플로우 이동 버튼 */}
        <div className="flex justify-center">
          <Button
            onClick={() => window.location.href = `/workspace/bot/${botId}/workflow`}
            variant="outline"
            className="rounded-none"
          >
            워크플로우 빌더로 이동
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-[60%] p-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">배포 관리</h1>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={deployment.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' : ''}
            >
              {DEPLOYMENT_STATUS_LABELS[deployment.status]}
            </Badge>
          </div>
        </div>

      {/* 탭 추가 */}
      <Tabs defaultValue="version" className="w-full">
        <TabsList className="rounded-none bg-transparent gap-2 h-auto p-0 border-0">
          <TabsTrigger
            value="version"
            className="rounded-none data-[state=active]:bg-gradient-to-r data-[state=active]:from-black data-[state=active]:to-[#3735c3] data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-black border-0"
            style={{
              backgroundImage: undefined
            }}
          >
            배포 버전
          </TabsTrigger>
          <TabsTrigger
            value="api"
            className="rounded-none data-[state=active]:bg-gradient-to-r data-[state=active]:from-black data-[state=active]:to-[#3735c3] data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-black border-0"
          >
            API 정보
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="rounded-none data-[state=active]:bg-gradient-to-r data-[state=active]:from-black data-[state=active]:to-[#3735c3] data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-black border-0"
          >
            SLACK 연동
          </TabsTrigger>
          <TabsTrigger
            value="deployment"
            className="rounded-none data-[state=active]:bg-gradient-to-r data-[state=active]:from-black data-[state=active]:to-[#3735c3] data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-black border-0"
            onClick={(e) => {
              e.preventDefault();
              setShowDeploymentModal(true);
            }}
          >
            배포 방식
          </TabsTrigger>
        </TabsList>

        <TabsContent value="version">
          <section className="rounded-lg border p-6 space-y-3 bg-white">
            <VersionSelector
              botId={botId!}
              currentVersionId={deployment.workflow_version_id}
              preSelectedVersionId={selectedVersionIdFromState}
              widgetKey={deployment.widget_key}
              allowedDomains={deployment.allowed_domains}
              botName={deployment.bot_name}
              onDeploySuccess={() => {
                fetchDeployment(botId!);
              }}
            />
          </section>
        </TabsContent>

        <TabsContent value="api">
          <APIDeploymentPanel botId={deployment.bot_id} />
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationsPanel botId={deployment.bot_id} />
        </TabsContent>
      </Tabs>

      {/* 배포 방식 모달 */}
      <Dialog open={showDeploymentModal} onOpenChange={setShowDeploymentModal}>
        <DialogContent className="max-w-[500px] rounded-none">
          <DialogHeader>
            <DialogTitle className="text-xl">배포 방식 선택</DialogTitle>
            <DialogDescription className="text-sm">
              봇을 배포할 방식을 선택하세요
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 py-2">
            {canRunApp ? (
              <Button
                variant="outline"
                onClick={() => {
                  handleRunApp();
                  setShowDeploymentModal(false);
                }}
                className="group rounded-none h-auto py-4 flex flex-col items-center gap-2 border-2 transition-all hover:border-transparent hover:scale-[1.03]"
                style={{
                  backgroundImage: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundImage = 'linear-gradient(90deg, #000000, #3735c3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundImage = 'none';
                }}
              >
                <span className="text-base font-semibold group-hover:text-white transition-colors">앱 실행</span>
                <span className="text-xs text-muted-foreground group-hover:text-white transition-colors">별도 창에서 앱을 실행합니다</span>
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex w-full">
                    <Button
                      variant="outline"
                      disabled
                      className="w-full rounded-none h-auto py-4 flex flex-col items-center gap-2 border-2 opacity-70"
                    >
                      <span className="text-base font-semibold">앱 실행</span>
                      <span className="text-xs text-muted-foreground">별도 창에서 앱을 실행합니다</span>
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>{runAppDisabledReason}</TooltipContent>
              </Tooltip>
            )}
            <Button
              variant="outline"
              onClick={() => {
                openEmbedDialog();
                setShowDeploymentModal(false);
              }}
              className="group rounded-none h-auto py-4 flex flex-col items-center gap-2 border-2 transition-all hover:border-transparent hover:scale-[1.03]"
              style={{
                backgroundImage: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundImage = 'linear-gradient(90deg, #000000, #3735c3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundImage = 'none';
              }}
            >
              <span className="text-base font-semibold group-hover:text-white transition-colors">사이트에 삽입</span>
              <span className="text-xs text-muted-foreground group-hover:text-white transition-colors">웹사이트에 임베드할 코드를 생성합니다</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                openApiDialog();
                setShowDeploymentModal(false);
              }}
              className="group rounded-none h-auto py-4 flex flex-col items-center gap-2 border-2 transition-all hover:border-transparent hover:scale-[1.03]"
              style={{
                backgroundImage: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundImage = 'linear-gradient(90deg, #000000, #3735c3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundImage = 'none';
              }}
            >
              <span className="text-base font-semibold group-hover:text-white transition-colors">API 참조</span>
              <span className="text-xs text-muted-foreground group-hover:text-white transition-colors">API 엔드포인트 정보를 확인합니다</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <EmbedWebsiteDialog />
      <ApiReferenceDialog />
      </div>
    </div>
  );
}
