import { useCallback, useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@shared/components/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@shared/components/tooltip';
import {
  useDeploymentStore,
  selectDeployment,
  selectIsLoading,
  selectError,
} from '../stores/deploymentStore.ts';
import { EmbedWebsiteDialog } from '../components/EmbedWebsiteDialog.tsx';
import { ApiReferenceDialog } from '../components/ApiReferenceDialog.tsx';
import { WorkflowApiReferenceDialog } from '../components/WorkflowApiReferenceDialog.tsx';
import { VersionSelector } from '../components/VersionSelector.tsx';
import { useApiKeyStore } from '../stores/apiKeyStore.ts';
import { botApi } from '@/features/bot/api/botApi';

type TabType = 'deployment';

export function DeploymentPage() {
  const { botId } = useParams<{ botId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const deployment = useDeploymentStore(selectDeployment);
  const isLoading = useDeploymentStore(selectIsLoading);
  const error = useDeploymentStore(selectError);
  const fetchDeployment = useDeploymentStore((state) => state.fetchDeployment);
  const reset = useDeploymentStore((state) => state.reset);
  const openEmbedDialog = useDeploymentStore((state) => state.openEmbedDialog);
  const openApiDialog = useDeploymentStore((state) => state.openApiDialog);

  const { apiKeys, fetchApiKeys } = useApiKeyStore();
  const [botName, setBotName] = useState<string>('Agent');
  const [showWorkflowApiDialog, setShowWorkflowApiDialog] = useState(false);
  const [lastCreatedApiKey, setLastCreatedApiKey] = useState<string | null>(null);

  // 워크플로우에서 선택된 버전 ID 가져오기
  const selectedVersionIdFromState = (location.state as { selectedVersionId?: string })?.selectedVersionId;

  useEffect(() => {
    console.log('[DeploymentPage] Received selectedVersionId from navigation:', selectedVersionIdFromState);
    console.log('[DeploymentPage] Full location.state:', location.state);
  }, [selectedVersionIdFromState, location.state]);

  useEffect(() => {
    if (botId) {
      fetchDeployment(botId);
      fetchApiKeys(botId);

      // 봇 정보 가져오기
      botApi.getById(botId).then((bot) => {
        setBotName(bot.name);
      }).catch((error) => {
        console.error('Failed to fetch bot info:', error);
      });
    }
    return () => reset();
  }, [botId, fetchDeployment, fetchApiKeys, reset]);

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

  // 배포 정보 (배포가 없으면 undefined)
  const deploymentInfo = deployment ? {
    currentVersionId: deployment.workflow_version_id,
    widgetKey: deployment.widget_key,
    allowedDomains: deployment.allowed_domains,
    botName: deployment.bot_name,
  } : {
    currentVersionId: undefined,
    widgetKey: undefined,
    allowedDomains: undefined,
    botName: botName,
  };

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


  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-[90%] p-8 space-y-6">
        {/* 뒤로가기 버튼 */}
        <div className="flex items-center">
          <button
            onClick={() => navigate('/workspace/studio')}
            className="flex items-center gap-2 text-sm text-gray-600 transition-all duration-200 hover:scale-105 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded"
          >
            <ArrowLeft className="w-4 h-4" />
            스튜디오로 돌아가기
          </button>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold">배포 관리</h1>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* 좌측 컬럼 - 배포할 버전 선택 */}
          <section className="rounded-lg border p-6 space-y-3 bg-white transition-all duration-200">
            <VersionSelector
              botId={botId!}
              currentVersionId={deploymentInfo.currentVersionId}
              preSelectedVersionId={selectedVersionIdFromState}
              widgetKey={deploymentInfo.widgetKey}
              allowedDomains={deploymentInfo.allowedDomains}
              botName={deploymentInfo.botName}
              onDeploySuccess={() => {
                fetchDeployment(botId!);
              }}
            />
          </section>

          {/* 우측 컬럼 - 배포 방식 */}
          <section className="rounded-lg border p-6 space-y-4 bg-white transition-all duration-200">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">배포 방식</h2>
              <p className="text-sm text-muted-foreground">
                서비스를 배포할 방식을 선택하세요
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {canRunApp ? (
                <Button
                  variant="outline"
                  onClick={handleRunApp}
                  className="group rounded-lg h-auto py-4 flex flex-col items-center gap-2 border-2 border-gray-300 hover:border-[#2563eb] transition-all hover:scale-[1.03]"
                  style={{
                    backgroundImage: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundImage = 'linear-gradient(90deg, #2563eb, #2563eb)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundImage = 'none';
                  }}
                >
                  <span className="text-base font-semibold text-gray-700 group-hover:text-white transition-colors">앱 실행</span>
                  <span className="text-xs text-muted-foreground group-hover:text-white transition-colors">별도 창에서 앱을 실행합니다</span>
                </Button>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex w-full">
                      <Button
                        variant="outline"
                        disabled
                        className="w-full rounded-lg h-auto py-4 flex flex-col items-center gap-2 border-2 opacity-70"
                      >
                        <span className="text-base font-semibold">앱 실행</span>
                        <span className="text-xs text-muted-foreground">별도 창에서 앱을 실행합니다</span>
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{runAppDisabledReason}</TooltipContent>
                </Tooltip>
              )}
              {deployment ? (
                <Button
                  variant="outline"
                  onClick={openEmbedDialog}
                  className="group rounded-lg h-auto py-4 flex flex-col items-center gap-2 border-2 border-gray-300 hover:border-[#2563eb] transition-all hover:scale-[1.03]"
                  style={{
                    backgroundImage: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundImage = 'linear-gradient(90deg, #2563eb, #2563eb)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundImage = 'none';
                  }}
                >
                  <span className="text-base font-semibold text-gray-700 group-hover:text-white transition-colors">사이트에 삽입</span>
                  <span className="text-xs text-muted-foreground group-hover:text-white transition-colors">웹사이트에 임베드할 코드를 생성합니다</span>
                </Button>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex w-full">
                      <Button
                        variant="outline"
                        disabled
                        className="w-full rounded-lg h-auto py-4 flex flex-col items-center gap-2 border-2 opacity-70"
                      >
                        <span className="text-base font-semibold">사이트에 삽입</span>
                        <span className="text-xs text-muted-foreground">웹사이트에 임베드할 코드를 생성합니다</span>
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>배포 후 사용 가능합니다</TooltipContent>
                </Tooltip>
              )}
              {deployment ? (
                <Button
                  variant="outline"
                  onClick={() => setShowWorkflowApiDialog(true)}
                  className="group rounded-lg h-auto py-4 flex flex-col items-center gap-2 border-2 border-gray-300 hover:border-[#2563eb] transition-all hover:scale-[1.03]"
                  style={{
                    backgroundImage: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundImage = 'linear-gradient(90deg, #2563eb, #2563eb)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundImage = 'none';
                  }}
                >
                  <span className="text-base font-semibold text-gray-700 group-hover:text-white transition-colors">API 참조</span>
                  <span className="text-xs text-muted-foreground group-hover:text-white transition-colors">API 엔드포인트 정보를 확인합니다</span>
                </Button>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex w-full">
                      <Button
                        variant="outline"
                        disabled
                        className="w-full rounded-lg h-auto py-4 flex flex-col items-center gap-2 border-2 opacity-70"
                      >
                        <span className="text-base font-semibold">API 참조</span>
                        <span className="text-xs text-muted-foreground">API 엔드포인트 정보를 확인합니다</span>
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>배포 후 사용 가능합니다</TooltipContent>
                </Tooltip>
              )}
            </div>
          </section>
        </div>


        <EmbedWebsiteDialog />
        <ApiReferenceDialog />
        <WorkflowApiReferenceDialog
          open={showWorkflowApiDialog}
          onClose={() => setShowWorkflowApiDialog(false)}
          botId={botId!}
          apiKeys={apiKeys}
          plaintextApiKey={lastCreatedApiKey}
        />
      </div>
    </div>
  );
}
