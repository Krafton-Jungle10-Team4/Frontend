import { memo, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/sheet';
import { Button } from '@/shared/components/button';
import { Skeleton } from '@/shared/components/skeleton';
import { workflowApi } from '../../../api/workflowApi';
import type {
  WorkflowRunDetail,
  WorkflowLogFilters,
} from '../../../types/log.types';
import { Loader2 } from 'lucide-react';

interface WorkflowLogDetailPanelProps {
  botId?: string | null;
  runId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: WorkflowLogFilters;
  isRealtime?: boolean;
}

export const WorkflowLogDetailPanel = memo<WorkflowLogDetailPanelProps>(
  ({ botId, runId, open, onOpenChange, filters, isRealtime = false }) => {
    const [runDetail, setRunDetail] = useState<WorkflowRunDetail | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      if (!open || !runId || !botId) {
        setRunDetail(null);
        return;
      }

      const fetchRunDetail = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const detail = await workflowApi.getWorkflowRun(botId, runId);
          setRunDetail(detail);
        } catch (err) {
          console.error('Failed to load workflow run detail:', err);
          setError('실행 상세 정보를 불러오는 중 문제가 발생했습니다.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchRunDetail();

      // 실시간 모드일 경우 주기적으로 새로고침
      if (isRealtime) {
        const intervalId = setInterval(() => {
          fetchRunDetail();
        }, 15000);

        return () => clearInterval(intervalId);
      }
    }, [open, runId, botId, isRealtime]);

    if (!open) {
      return null;
    }

    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>실행 상세 정보</SheetTitle>
            <SheetDescription>
              워크플로우 실행의 입력, 출력, 노드 실행 정보를 확인할 수 있습니다.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {isLoading && !runDetail ? (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : error ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : runDetail ? (
              <>
                {/* Run Summary */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">실행 요약</h3>
                  <div className="rounded-lg border p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">상태:</span>
                      <span className="text-sm font-medium">{runDetail.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">시작 시간:</span>
                      <span className="text-sm font-medium">
                        {new Date(runDetail.started_at).toLocaleString('ko-KR')}
                      </span>
                    </div>
                    {runDetail.finished_at && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">종료 시간:</span>
                        <span className="text-sm font-medium">
                          {new Date(runDetail.finished_at).toLocaleString('ko-KR')}
                        </span>
                      </div>
                    )}
                    {runDetail.total_tokens && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">총 토큰:</span>
                        <span className="text-sm font-medium">
                          {runDetail.total_tokens.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Inputs */}
                {runDetail.inputs && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">입력</h3>
                    <div className="rounded-lg border p-4">
                      <pre className="text-sm overflow-x-auto">
                        {JSON.stringify(runDetail.inputs, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Outputs */}
                {runDetail.outputs && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">출력</h3>
                    <div className="rounded-lg border p-4">
                      <pre className="text-sm overflow-x-auto">
                        {JSON.stringify(runDetail.outputs, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {runDetail.error_message && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-red-600">에러 메시지</h3>
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                      <p className="text-sm text-red-700">{runDetail.error_message}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                실행 정보가 없습니다.
              </div>
            )}

            {isRealtime && isLoading && runDetail && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                업데이트 중...
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    );
  }
);

WorkflowLogDetailPanel.displayName = 'WorkflowLogDetailPanel';

