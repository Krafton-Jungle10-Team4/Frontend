import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@shared/components/button';
import { Loader2, X } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@shared/components/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@shared/components/dialog';
import {
  useDeploymentStore,
  selectDeployment,
  selectIsLoading,
  selectError,
  selectWidgetConfig,
} from '../stores/deploymentStore.ts';
import { EmbedWebsiteDialog } from './EmbedWebsiteDialog.tsx';
import { ApiReferenceDialog } from './ApiReferenceDialog.tsx';
import { WorkflowApiReferenceDialog } from './WorkflowApiReferenceDialog.tsx';
import { VersionSelector } from './VersionSelector.tsx';
import { useApiKeyStore } from '../stores/apiKeyStore.ts';
import { botApi } from '@/features/bot/api/botApi';
import { workflowApi } from '@/features/workflow/api/workflowApi';
import { deploymentApi } from '../api/deploymentApi';
import { toast } from 'sonner';

interface DeploymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  botId: string;
}

export function DeploymentModal({ open, onOpenChange, botId }: DeploymentModalProps) {
  const location = useLocation();
  const deployment = useDeploymentStore(selectDeployment);
  const isLoading = useDeploymentStore(selectIsLoading);
  const error = useDeploymentStore(selectError);
  const widgetConfig = useDeploymentStore(selectWidgetConfig);
  const fetchDeployment = useDeploymentStore((state) => state.fetchDeployment);
  const reset = useDeploymentStore((state) => state.reset);
  const openEmbedDialog = useDeploymentStore((state) => state.openEmbedDialog);

  const { apiKeys, fetchApiKeys } = useApiKeyStore();
  const [botName, setBotName] = useState<string>('Agent');
  const [showWorkflowApiDialog, setShowWorkflowApiDialog] = useState(false);
  const [lastCreatedApiKey, setLastCreatedApiKey] = useState<string | null>(null);
  const [isAutoDeploying, setIsAutoDeploying] = useState(false);

  const selectedVersionIdFromState = (location.state as { selectedVersionId?: string })?.selectedVersionId;

  useEffect(() => {
    if (open && botId) {
      fetchDeployment(botId);
      fetchApiKeys(botId);

      botApi.getById(botId).then((bot) => {
        setBotName(bot.name);
      }).catch((error) => {
        console.error('Failed to fetch bot info:', error);
      });
    }
    return () => {
      if (!open) {
        reset();
      }
    };
  }, [botId, fetchDeployment, fetchApiKeys, reset, open]);

  useEffect(() => {
    const autoDeployLatestVersion = async () => {
      if (!open || !botId || deployment || isLoading || isAutoDeploying) {
        return;
      }

      try {
        setIsAutoDeploying(true);

        const publishedVersions = await workflowApi.listWorkflowVersions(botId, {
          status: 'published',
        });

        if (publishedVersions.length === 0) {
          toast.error('게시된 버전이 없습니다', {
            id: `no-published-version-${botId}`,
            description: '워크플로우 빌더에서 "버전 커밋" 버튼을 클릭하여 버전을 생성하세요.',
          });
          return;
        }

        const latestVersion = publishedVersions[0];

        await deploymentApi.createOrUpdate(botId, {
          workflow_version_id: latestVersion.id,
          status: 'published',
          widget_config: widgetConfig,
        });

        toast.success('최신 버전으로 자동 배포되었습니다', {
          id: `auto-deployment-success-${botId}`,
          description: `버전 ${latestVersion.version}이(가) 배포되었습니다.`,
        });

        await fetchDeployment(botId);
      } catch (error: any) {
        console.error('Auto deployment error:', error);
        toast.error('자동 배포 실패', {
          id: `auto-deployment-error-${botId}`,
          description: error.response?.data?.message || '배포 중 오류가 발생했습니다.',
        });
      } finally {
        setIsAutoDeploying(false);
      }
    };

    autoDeployLatestVersion();
  }, [open, botId, deployment, isLoading, widgetConfig, fetchDeployment, isAutoDeploying]);

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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[90vw] sm:max-w-5xl md:max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">배포 관리</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-1">
            {isLoading || isAutoDeploying ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {isAutoDeploying ? '최신 버전으로 배포 중...' : '배포 정보를 불러오는 중...'}
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
                <p className="text-lg font-semibold text-destructive mb-2">오류 발생</p>
                <p className="text-sm text-muted-foreground">배포 정보를 불러오지 못했습니다: {error}</p>
              </div>
            ) : (
              <div className="space-y-6 pb-6">
                <div className="flex flex-row gap-6 items-start">
                  <section className="rounded-lg border p-6 space-y-3 bg-white flex-1 min-w-0">
                    <VersionSelector
                      botId={botId}
                      currentVersionId={deploymentInfo.currentVersionId}
                      preSelectedVersionId={selectedVersionIdFromState}
                      widgetKey={deploymentInfo.widgetKey}
                      allowedDomains={deploymentInfo.allowedDomains}
                      botName={deploymentInfo.botName}
                      onDeploySuccess={() => {
                        fetchDeployment(botId);
                      }}
                    />
                  </section>

                  <section className="rounded-lg border p-6 space-y-4 bg-white flex-1 min-w-0">
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
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <EmbedWebsiteDialog />
      <ApiReferenceDialog />
      <WorkflowApiReferenceDialog
        open={showWorkflowApiDialog}
        onClose={() => setShowWorkflowApiDialog(false)}
        botId={botId}
        apiKeys={apiKeys}
        plaintextApiKey={lastCreatedApiKey}
      />
    </>
  );
}
