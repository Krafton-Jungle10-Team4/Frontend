/**
 * VersionHistoryModal Component
 * 배포 버전 히스토리 표시 모달
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@shared/components/dialog';
import { Button } from '@shared/components/button';
import { Badge } from '@shared/components/badge';
import { Loader2, Calendar } from 'lucide-react';
import { workflowApi } from '@/features/workflow/api/workflowApi';
import type { WorkflowVersionSummary } from '@/features/workflow/types/api.types';
import { toast } from 'sonner';

interface VersionHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  botId: string;
  currentVersionId?: string;
  botName?: string;
}

export function VersionHistoryModal({
  open,
  onOpenChange,
  botId,
  currentVersionId,
  botName = 'Agent',
}: VersionHistoryModalProps) {
  const navigate = useNavigate();
  const [versions, setVersions] = useState<WorkflowVersionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchVersions = useCallback(async () => {
    try {
      setIsLoading(true);
      const publishedVersions = await workflowApi.listWorkflowVersions(botId, {
        status: 'published',
      });
      setVersions(publishedVersions);
    } catch (error) {
      console.error('Failed to fetch version history:', error);
      toast.error('버전 히스토리 조회 실패');
    } finally {
      setIsLoading(false);
    }
  }, [botId]);

  useEffect(() => {
    if (open && botId) {
      fetchVersions();
    }
  }, [open, botId, fetchVersions]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\. /g, '.').replace(/\.$/, '');
  };

  const handleOpenVersion = (versionId: string) => {
    navigate(`/bot/${botId}/workflow?versionId=${versionId}`);
    onOpenChange(false);
  };

  const currentVersion = versions.find((v) => v.id === currentVersionId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-none max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {botName} - 버전 히스토리
          </DialogTitle>
          <DialogDescription>
            이 에이전트의 버전별 기록을 확인합니다.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              버전 히스토리를 불러오는 중...
            </span>
          </div>
        ) : versions.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              발행된 워크플로우 버전이 없습니다.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {currentVersion && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">현재 기본 버전:</span>
                  <Badge className="bg-black text-white px-3 py-1 font-semibold">
                    {currentVersion.version}
                  </Badge>
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    운영 중
                  </Badge>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {versions.map((version) => {
                const isCurrentVersion = version.id === currentVersionId;

                return (
                  <div
                    key={version.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Badge
                        className={`px-3 py-1 font-semibold text-base ${
                          isCurrentVersion
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {version.version}
                      </Badge>

                      <Badge
                        variant="outline"
                        className={
                          isCurrentVersion
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'text-gray-500'
                        }
                      >
                        {isCurrentVersion ? '운영 중' : '비활성'}
                      </Badge>

                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(version.published_at || version.created_at)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-none border-blue-500 text-blue-600 hover:bg-blue-50"
                        onClick={() => handleOpenVersion(version.id)}
                      >
                        이 버전 열기
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
