import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/dialog';
import { Button } from '@/shared/components/button';
import { Badge } from '@/shared/components/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/select';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { apiClient } from '@/shared/api/client';
import { toast } from 'sonner';
import { useBotStore } from '@/features/bot/stores/botStore';

interface DeploymentDialogProps {
  open: boolean;
  onClose: () => void;
  versionId: string;
  agentName: string;
  botId?: string;
}

interface Deployment {
  deployment_id: string;
  workflow_version_id?: string;
  status: string;
  created_at: string;
  bot_id: string;
}

export function DeploymentDialog({ open, onClose, versionId, agentName, botId }: DeploymentDialogProps) {
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedBotId, setSelectedBotId] = useState<string>(botId || '');
  const { bots, fetchBots } = useBotStore();

  useEffect(() => {
    if (open) {
      fetchBots();
    }
  }, [open, fetchBots]);

  useEffect(() => {
    if (open && versionId && selectedBotId) {
      fetchDeployment();
    }
  }, [open, versionId, selectedBotId]);

  const fetchDeployment = async () => {
    setIsFetching(true);
    try {
      const { data } = await apiClient.get(`/bots/${selectedBotId}/deployment`);
      setDeployment(data || null);
    } catch (error: any) {
      console.error('Failed to fetch deployment:', error);
      setDeployment(null);
    } finally {
      setIsFetching(false);
    }
  };

  const handleDeploy = async () => {
    if (!selectedBotId) {
      toast.error('배포할 서비스를 선택하세요.');
      return;
    }
    setIsLoading(true);
    try {
      await apiClient.post(`/bots/${selectedBotId}/deploy`, {
        status: 'published',
        workflow_version_id: versionId,
        widget_config: {},
      });
      toast.success('서비스가 성공적으로 배포되었습니다.');
      await fetchDeployment();
    } catch (error: any) {
      console.error('Failed to deploy:', error);
      toast.error(error.response?.data?.detail || '배포에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      if (!selectedBotId) {
        toast.error('서비스를 선택하세요.');
        return;
      }
      await apiClient.delete(`/bots/${selectedBotId}/deployment`);
      toast.success('배포가 비활성화되었습니다.');
      await fetchDeployment();
    } catch (error: any) {
      console.error('Failed to deactivate deployment:', error);
      toast.error(error.response?.data?.detail || '배포 비활성화에 실패했습니다.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>배포 관리</DialogTitle>
          <DialogDescription>
            {agentName} 버전의 배포 상태를 관리합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Bot Selector */}
          <div className="space-y-2">
            <p className="text-sm font-medium">배포할 서비스 선택</p>
            <Select
              value={selectedBotId}
              onValueChange={(value) => setSelectedBotId(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="서비스를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {bots.map((bot) => (
                  <SelectItem key={bot.bot_id} value={bot.bot_id}>
                    {bot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isFetching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">배포 정보 로딩 중...</span>
            </div>
          ) : (
            <>
              {/* Current Deployment */}
              {deployment ? (
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {deployment.status === 'published' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="font-medium">
                        {deployment.bot_id}
                      </span>
                      <Badge variant={deployment.status === 'published' ? 'default' : 'secondary'}>
                        {deployment.status === 'published' ? '활성' : deployment.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      생성일: {formatDate(deployment.created_at)}
                    </p>
                  </div>
                  {deployment.status === 'published' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeactivate}
                    >
                      비활성화
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  현재 활성화된 배포가 없습니다.
                </div>
              )}

              {/* Info */}
            <div className="bg-muted p-3 rounded-lg text-sm">
              <p className="font-medium mb-1">배포 안내</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>이 서비스 버전을 원하는 서비스에 배포할 수 있습니다.</li>
                <li>배포하면 해당 서비스의 기존 활성 배포가 비활성화됩니다.</li>
                <li>배포된 버전은 서비스 API에서 실행됩니다.</li>
              </ul>
            </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            닫기
          </Button>
          <Button onClick={handleDeploy} disabled={isLoading || isFetching}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            새 배포 생성
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
