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
import { toast } from 'sonner';
import type { Workflow } from '@/shared/types/workflow';
import { usePublishActions } from '@/features/workflow/hooks/usePublishActions';
import { useDeploymentStore } from '@/features/deployment/stores/deploymentStore';

interface StudioDeploymentOptionsDialogProps {
  open: boolean;
  workflow?: Workflow;
  onOpenChange: (open: boolean) => void;
}

export function StudioDeploymentOptionsDialog({
  open,
  workflow,
  onOpenChange,
}: StudioDeploymentOptionsDialogProps) {
  const botId = workflow?.id ?? '';
  const { runApp, embedWebsite, openMarketplace, apiReference, ensureDeployment } =
    usePublishActions(botId);
  const fetchDeployment = useDeploymentStore((state) => state.fetchDeployment);

  const [isProcessing, setIsProcessing] = useState(false);

  const guardWorkflow = () => {
    if (!workflow) {
      toast.error('선택된 워크플로우가 없습니다.');
      return false;
    }
    return true;
  };

  const ensureAndFetch = async () => {
    if (!guardWorkflow()) return false;
    setIsProcessing(true);
    try {
      const widgetKey = await ensureDeployment();
      if (!widgetKey) {
        return false;
      }
      await fetchDeployment(botId);
      return true;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRunApp = async () => {
    if (!guardWorkflow()) return;
    setIsProcessing(true);
    try {
      await runApp();
      onOpenChange(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEmbedWebsite = async () => {
    const ready = await ensureAndFetch();
    if (ready) {
      embedWebsite();
      onOpenChange(false);
    }
  };

  const handleApiReference = async () => {
    const ready = await ensureAndFetch();
    if (ready) {
      apiReference();
      onOpenChange(false);
    }
  };

  const handleOpenMarketplace = async () => {
    const ready = await ensureAndFetch();
    if (ready) {
      openMarketplace();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>배포 방식 선택</DialogTitle>
          {workflow ? (
            <DialogDescription>
              {workflow.name} {workflow.latestVersion}을(를) 어떻게 배포하시겠습니까?
            </DialogDescription>
          ) : (
            <DialogDescription>배포할 워크플로우를 선택해주세요.</DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-3 py-4">
          <Button
            variant="outline"
            className="w-full justify-start h-auto py-4"
            onClick={handleRunApp}
            disabled={isProcessing || !workflow}
          >
            {isProcessing ? (
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
            disabled={isProcessing || !workflow}
          >
            {isProcessing ? (
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
            disabled={isProcessing || !workflow}
          >
            {isProcessing ? (
              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
            ) : (
              <Compass className="mr-3 h-5 w-5" />
            )}
            <div className="flex flex-col items-start">
              <span className="font-medium">Marketplace에서 열기</span>
              <span className="text-xs text-muted-foreground">
                마켓플레이스 탐색 탭으로 이동
              </span>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-auto py-4"
            onClick={handleApiReference}
            disabled={isProcessing || !workflow}
          >
            {isProcessing ? (
              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
            ) : (
              <FileCode className="mr-3 h-5 w-5" />
            )}
            <div className="flex flex-col items-start">
              <span className="font-medium">API 참조 접근</span>
              <span className="text-xs text-muted-foreground">
                REST API로 에이전트 호출 방법 확인
              </span>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
