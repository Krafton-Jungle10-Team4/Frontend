import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/dialog';
import { Button } from '@/shared/components/button';
import { Play, Code, Compass, FileCode, Loader2 } from 'lucide-react';
import { usePublishActions } from '@/features/workflow/hooks/usePublishActions';
import { deploymentApi } from '@/features/deployment/api/deploymentApi';
import { toast } from 'sonner';
import type { LibraryAgentVersion } from '@/features/workflow/types/workflow.types';

interface DeploymentOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: LibraryAgentVersion;
}

export function DeploymentOptionsDialog({
  open,
  onOpenChange,
  agent,
}: DeploymentOptionsDialogProps) {
  const { runApp, embedWebsite, openMarketplace, apiReference } = usePublishActions(agent.bot_id);
  const [isDeploying, setIsDeploying] = useState(false);

  /**
   * 배포 수행 (widget_key 생성)
   */
  const ensureDeployment = async () => {
    try {
      setIsDeploying(true);

      // 기본 Widget 설정으로 배포
      const defaultWidgetConfig = {
        theme: 'light' as const,
        position: 'bottom-right' as const,
        auto_open: false,
        primary_color: '#0066FF',
      };

      await deploymentApi.createOrUpdate(agent.bot_id, {
        workflow_version_id: agent.id, // agent.id = version_id
        status: 'published',
        widget_config: defaultWidgetConfig,
      });

      return true;
    } catch (error) {
      console.error('Deployment error:', error);
      toast.error('배포 실패', {
        description: '배포 중 오류가 발생했습니다.',
      });
      return false;
    } finally {
      setIsDeploying(false);
    }
  };

  const handleRunApp = async () => {
    const deployed = await ensureDeployment();
    if (deployed) {
      runApp();
      onOpenChange(false);
    }
  };

  const handleEmbedWebsite = async () => {
    const deployed = await ensureDeployment();
    if (deployed) {
      embedWebsite();
      onOpenChange(false);
    }
  };

  const handleOpenMarketplace = async () => {
    const deployed = await ensureDeployment();
    if (deployed) {
      openMarketplace();
      onOpenChange(false);
    }
  };

  const handleApiReference = async () => {
    const deployed = await ensureDeployment();
    if (deployed) {
      apiReference();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>배포 방식 선택</DialogTitle>
          <DialogDescription>
            {agent.library_name} {agent.version}을(를) 어떻게 배포하시겠습니까?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <Button
            variant="outline"
            className="w-full justify-start h-auto py-4"
            onClick={handleRunApp}
            disabled={isDeploying}
          >
            {isDeploying ? (
              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
            ) : (
              <Play className="mr-3 h-5 w-5" />
            )}
            <div className="flex flex-col items-start">
              <span className="font-medium">앱 실행</span>
              <span className="text-xs text-muted-foreground">
                독립 실행형 챗봇 페이지를 새 탭에서 열기
              </span>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-auto py-4"
            onClick={handleEmbedWebsite}
            disabled={isDeploying}
          >
            {isDeploying ? (
              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
            ) : (
              <Code className="mr-3 h-5 w-5" />
            )}
            <div className="flex flex-col items-start">
              <span className="font-medium">사이트에 삽입</span>
              <span className="text-xs text-muted-foreground">
                웹사이트에 임베드할 수 있는 위젯 코드 생성
              </span>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-auto py-4"
            onClick={handleOpenMarketplace}
            disabled={isDeploying}
          >
            {isDeploying ? (
              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
            ) : (
              <Compass className="mr-3 h-5 w-5" />
            )}
            <div className="flex flex-col items-start">
              <span className="font-medium">Marketplace에서 열기</span>
              <span className="text-xs text-muted-foreground">
                Marketplace 페이지에서 에이전트 탐색 (준비 중)
              </span>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-auto py-4"
            onClick={handleApiReference}
            disabled={isDeploying}
          >
            {isDeploying ? (
              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
            ) : (
              <FileCode className="mr-3 h-5 w-5" />
            )}
            <div className="flex flex-col items-start">
              <span className="font-medium">API 참조 접근</span>
              <span className="text-xs text-muted-foreground">
                REST API로 에이전트에 접근하는 방법 확인
              </span>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
