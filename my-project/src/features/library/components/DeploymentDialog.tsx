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
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { apiClient } from '@/shared/api/client';
import { toast } from 'sonner';

interface DeploymentDialogProps {
  open: boolean;
  onClose: () => void;
  versionId: string;
  agentName: string;
}

interface Deployment {
  id: string;
  workflow_version_id: string;
  is_active: boolean;
  deployed_at: string;
  bot_id: string;
  bot_name?: string;
}

export function DeploymentDialog({ open, onClose, versionId, agentName }: DeploymentDialogProps) {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (open && versionId) {
      fetchDeployments();
    }
  }, [open, versionId]);

  const fetchDeployments = async () => {
    setIsFetching(true);
    try {
      const { data } = await apiClient.get(`/library/agents/${versionId}/deployments`);
      setDeployments(data || []);
    } catch (error: any) {
      console.error('Failed to fetch deployments:', error);
      if (error.response?.status !== 404) {
        toast.error('배포 목록을 불러올 수 없습니다.');
      }
      setDeployments([]);
    } finally {
      setIsFetching(false);
    }
  };

  const handleDeploy = async () => {
    setIsLoading(true);
    try {
      await apiClient.post(`/library/agents/${versionId}/deploy`);
      toast.success('에이전트가 성공적으로 배포되었습니다.');
      await fetchDeployments();
    } catch (error: any) {
      console.error('Failed to deploy:', error);
      toast.error(error.response?.data?.detail || '배포에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivate = async (deploymentId: string) => {
    try {
      await apiClient.delete(`/deployments/${deploymentId}`);
      toast.success('배포가 비활성화되었습니다.');
      await fetchDeployments();
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
          {isFetching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">배포 정보 로딩 중...</span>
            </div>
          ) : (
            <>
              {/* Current Deployments */}
              {deployments.length > 0 ? (
                <div>
                  <h3 className="font-semibold mb-3">현재 배포 목록</h3>
                  <div className="space-y-2">
                    {deployments.map((deployment) => (
                      <div
                        key={deployment.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {deployment.is_active ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="font-medium">
                              {deployment.bot_name || deployment.bot_id}
                            </span>
                            <Badge variant={deployment.is_active ? 'default' : 'secondary'}>
                              {deployment.is_active ? '활성' : '비활성'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            배포일: {formatDate(deployment.deployed_at)}
                          </p>
                        </div>
                        {deployment.is_active && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeactivate(deployment.id)}
                          >
                            비활성화
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
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
                  <li>이 에이전트 버전을 새로운 봇에 배포할 수 있습니다.</li>
                  <li>배포하면 해당 봇의 기존 활성 배포가 비활성화됩니다.</li>
                  <li>배포된 버전은 챗봇 API에서 실행됩니다.</li>
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
