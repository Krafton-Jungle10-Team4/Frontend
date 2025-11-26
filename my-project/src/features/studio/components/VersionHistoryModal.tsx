/**
 * VersionHistoryModal
 * Phase 6: 기능 통합 및 연동 - 버전 히스토리 모달
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/shared/components/dialog';
import { Button } from '@/shared/components/button';
import { Badge } from '@/shared/components/badge';
import type { WorkflowVersion } from '@/shared/types/workflow';
import { workflowApi } from '../api/workflowApi';
import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface VersionHistoryModalProps {
  open: boolean;
  workflowId?: string;
  onClose: () => void;
}

export function VersionHistoryModal({
  open,
  workflowId,
  onClose
}: VersionHistoryModalProps) {
  const [versions, setVersions] = useState<WorkflowVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (open && workflowId) {
      fetchVersions();
    }
  }, [open, workflowId]);

  const fetchVersions = async () => {
    if (!workflowId) return;

    setLoading(true);
    try {
      const response = await workflowApi.getVersionHistory(workflowId);
      const formatted = response.data.map((version) => ({
        ...version,
        createdAt: new Date(version.createdAt),
      }));
      setVersions(formatted);
    } catch (error) {
      console.error('Failed to fetch version history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenVersion = (version: WorkflowVersion) => {
    if (!workflowId) return;
    navigate(`/bot/${workflowId}/workflow`, {
      state: { versionId: version.id },
    });
    onClose();
  };

  const handleSetupABTest = () => {
    if (!workflowId) return;
    navigate(`/bot/${workflowId}/workflow`, {
      state: { openABTestSetup: true },
    });
    onClose();
  };

  const formatDate = (date: Date | string): string => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>버전 히스토리</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-studio-primary" />
          </div>
        ) : (
          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            {versions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                버전 히스토리가 없습니다
              </p>
            ) : (
              <>
                <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                  {versions.map((version) => (
                  <div
                    key={version.id}
                    className="border border-gray-200 rounded-sharp p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            v{version.version}
                          </span>
                          {version.isABTest && (
                            <Badge variant="warning">
                              A/B 테스트 ({version.trafficPercentage}%)
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {version.description || '설명 없음'}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{formatDate(version.createdAt)}</span>
                          <span>{version.createdBy}</span>
                        </div>
                      </div>

                      {version.performance && (
                        <div className="text-right space-y-1">
                          <div className="text-sm">
                            <span className="text-gray-600">평균 응답: </span>
                            <span className="font-medium">
                              {version.performance.avgResponseTime}ms
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">예상 비용: </span>
                            <span className="font-medium">
                              ${version.performance.estimatedCost.toFixed(4)}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">성공률: </span>
                            <span className={cn(
                              "font-medium",
                              version.performance.successRate >= 0.95
                                ? "text-green-600"
                                : version.performance.successRate >= 0.8
                                ? "text-yellow-600"
                                : "text-red-600"
                            )}>
                              {(version.performance.successRate * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenVersion(version)}
                      >
                        이 버전 열기
                      </Button>
                    </div>
                  </div>
                ))}
                </div>

                <Button
                  variant="default"
                  onClick={handleSetupABTest}
                  className="w-full flex-shrink-0"
                >
                  A/B 테스트 설정
                </Button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
