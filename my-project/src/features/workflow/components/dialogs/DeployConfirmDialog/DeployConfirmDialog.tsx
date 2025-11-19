/**
 * DeployConfirmDialog - 워크플로우 발행 후 배포 확인 다이얼로그
 */
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/dialog';
import { Button } from '@/shared/components/button';
import { toast } from 'sonner';
import { deploymentApi } from '@/features/deployment/api/deploymentApi';

interface DeployConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  botId: string;
  versionId: string;
  onDeploySuccess?: () => void;
}

export function DeployConfirmDialog({
  open,
  onOpenChange,
  botId,
  versionId,
  onDeploySuccess,
}: DeployConfirmDialogProps) {
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = async () => {
    try {
      setIsDeploying(true);

      // 기본 Widget 설정
      const defaultWidgetConfig = {
        theme: 'light' as const,
        position: 'bottom-right' as const,
        auto_open: false,
        primary_color: '#0066FF',
      };

      await deploymentApi.createOrUpdate(botId, {
        workflow_version_id: versionId,
        status: 'published',
        widget_config: defaultWidgetConfig,
      });

      toast.success('배포 성공', {
        description: '워크플로우가 성공적으로 배포되었습니다.',
      });

      onDeploySuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Deployment error:', error);
      toast.error('배포 실패', {
        description: '배포 중 오류가 발생했습니다.',
      });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>워크플로우 배포</DialogTitle>
          <DialogDescription>
            이 버전을 바로 배포하시겠습니까?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            발행된 워크플로우를 배포하면 Widget Key가 발급되어
            웹사이트에 임베드할 수 있습니다.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeploying}
          >
            나중에
          </Button>
          <Button
            onClick={handleDeploy}
            disabled={isDeploying}
          >
            {isDeploying ? '배포 중...' : '배포하기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
