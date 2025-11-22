import { memo, useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Loader2, Clock, ChevronDown, Cpu } from 'lucide-react';
import { Card } from '@/shared/components/card';
import { Badge } from '@/shared/components/badge';
import { Skeleton } from '@/shared/components/skeleton';
import { workflowApi } from '../../api/workflowApi';
import type { WorkflowRunSummary, WorkflowRunDetail, NodeExecution } from '../../../types/log.types';
const formatDateTime = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

interface WorkflowLogRowProps {
  run: WorkflowRunSummary;
  isActive?: boolean;
  onSelect: (run: WorkflowRunSummary) => void;
  botId?: string | null;
}

const getStatusIcon = (status: WorkflowRunSummary['status']) => {
  switch (status) {
    case 'succeeded':
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-600" />;
    case 'running':
      return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
    default:
      return <Clock className="h-4 w-4 text-gray-400" />;
  }
};

const getStatusLabel = (status: WorkflowRunSummary['status']) => {
  switch (status) {
    case 'succeeded':
      return '성공';
    case 'failed':
      return '실패';
    case 'running':
      return '실행 중';
    default:
      return '알 수 없음';
  }
};

const formatElapsedTime = (milliseconds?: number | null) => {
  if (!milliseconds) return '-';
  const seconds = milliseconds / 1000;
  if (seconds < 1) return `${milliseconds.toFixed(0)}ms`;
  if (seconds < 60) return `${seconds.toFixed(2)}초`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}분 ${remainingSeconds.toFixed(0)}초`;
};

export const WorkflowLogRow = memo<WorkflowLogRowProps>(
  ({ run, isActive = false, onSelect, botId }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [runDetail, setRunDetail] = useState<WorkflowRunDetail | null>(null);
    const [nodeExecutions, setNodeExecutions] = useState<NodeExecution[]>([]);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);

    const handleClick = () => {
      setIsExpanded(!isExpanded);
      onSelect(run);
    };

    useEffect(() => {
      if (isExpanded && !runDetail && botId) {
        setIsLoadingDetail(true);
        Promise.all([
          workflowApi.getWorkflowRun(botId, run.id),
          workflowApi.getWorkflowRunNodes(botId, run.id)
        ])
          .then(([detail, nodes]) => {
            setRunDetail(detail);
            setNodeExecutions(nodes);
          })
          .catch(err => {
            console.error('Failed to load workflow run detail:', err);
          })
          .finally(() => {
            setIsLoadingDetail(false);
          });
      }
    }, [isExpanded, runDetail, botId, run.id]);

    return (
      <Card
        className={`rounded-lg transition-all hover:scale-[1.005] hover:shadow-md ${
          isActive ? 'ring-1 ring-blue-500 bg-primary/5' : ''
        }`}
      >
        <div
          className="p-4 space-y-3 cursor-pointer"
          onClick={handleClick}
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(run.status)}
              <Badge
                variant={
                  run.status === 'succeeded'
                    ? 'default'
                    : run.status === 'failed'
                    ? 'destructive'
                    : 'secondary'
                }
              >
                {getStatusLabel(run.status)}
              </Badge>
              {run.workflow_version_name && (
                <span className="text-xs text-muted-foreground">
                  {run.workflow_version_name}
                </span>
              )}
            </div>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform ${
                isExpanded ? '' : '-rotate-90'
              }`}
            />
          </div>

          {/* Timestamps */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatDateTime(new Date(run.started_at))}</span>
            </div>
            {run.finished_at && (
              <div className="flex items-center gap-1">
                <span>종료:</span>
                <span>{formatDateTime(new Date(run.finished_at))}</span>
              </div>
            )}
            {run.elapsed_time !== null && run.elapsed_time !== undefined && (
              <div className="flex items-center gap-1">
                <span>소요 시간:</span>
                <span className="font-medium">{formatElapsedTime(run.elapsed_time)}</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs">
            {run.total_cost !== null && run.total_cost !== undefined && (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">비용:</span>
                <span className="font-medium text-green-600">${run.total_cost.toFixed(6)}</span>
              </div>
            )}
            {run.total_tokens !== null && run.total_tokens !== undefined && (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">토큰:</span>
                <span className="font-medium">{run.total_tokens.toLocaleString()}</span>
              </div>
            )}
            {run.total_steps !== null && run.total_steps !== undefined && (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">단계:</span>
                <span className="font-medium">{run.total_steps}</span>
              </div>
            )}
          </div>

          {/* Previews */}
          {(run.input_preview || run.output_preview) && (
            <div className="space-y-2 pt-2 border-t">
              {run.input_preview && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">입력:</span>
                  <p className="text-xs mt-1 text-foreground line-clamp-2">
                    {run.input_preview}
                  </p>
                </div>
              )}
              {run.output_preview && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">출력:</span>
                  <p className="text-xs mt-1 text-foreground line-clamp-2">
                    {run.output_preview}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {run.error_message && (
            <div className="pt-2 border-t">
              <span className="text-xs font-medium text-red-600">에러:</span>
              <p className="text-xs mt-1 text-red-600 line-clamp-2">{run.error_message}</p>
            </div>
          )}
        </div>

        {/* Expanded Detail Section */}
        {isExpanded && (
          <div className="border-t bg-gray-50 p-4 space-y-4">
            {isLoadingDetail ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : runDetail ? (
              <>
                {/* Run Summary */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">실행 요약</h4>
                  <div className="rounded-lg border bg-white p-3 space-y-2 transition-all hover:scale-[1.005]">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">상태:</span>
                      <span className="font-medium">
                        {runDetail.status === 'succeeded' ? '성공' :
                         runDetail.status === 'failed' ? '실패' :
                         runDetail.status === 'running' ? '실행 중' : runDetail.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">시작 시간:</span>
                      <span className="font-medium">
                        {new Date(runDetail.started_at).toLocaleString('ko-KR')}
                      </span>
                    </div>
                    {runDetail.finished_at && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">종료 시간:</span>
                        <span className="font-medium">
                          {new Date(runDetail.finished_at).toLocaleString('ko-KR')}
                        </span>
                      </div>
                    )}
                    {runDetail.elapsed_time !== null && runDetail.elapsed_time !== undefined && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          소요 시간:
                        </span>
                        <span className="font-medium">
                          {formatElapsedTime(runDetail.elapsed_time)}
                        </span>
                      </div>
                    )}
                    {runDetail.total_cost !== null && runDetail.total_cost !== undefined && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">총 비용:</span>
                        <span className="font-medium text-green-600">${runDetail.total_cost.toFixed(6)}</span>
                      </div>
                    )}
                    {runDetail.total_tokens !== null && runDetail.total_tokens !== undefined && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">총 토큰 사용량:</span>
                        <span className="font-medium">{runDetail.total_tokens.toLocaleString()} 토큰</span>
                      </div>
                    )}
                    {runDetail.total_steps !== null && runDetail.total_steps !== undefined && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">실행 단계:</span>
                        <span className="font-medium">{runDetail.total_steps}개</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* LLM Node Details */}
                {nodeExecutions.filter(ne => 
                  (ne.node_type?.toLowerCase() === 'llm' || ne.node_type === 'LLMNodeV2') && 
                  ne.cost !== null && ne.cost !== undefined
                ).length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      LLM 노드별 사용량
                    </h4>
                    <div className="space-y-2">
                      {nodeExecutions
                        .filter(ne => 
                          (ne.node_type?.toLowerCase() === 'llm' || ne.node_type === 'LLMNodeV2') && 
                          ne.cost !== null && ne.cost !== undefined
                        )
                        .map((ne, index) => (
                          <div key={ne.id} className="rounded-lg border bg-white p-3 space-y-2 transition-all hover:scale-[1.005]">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-medium text-foreground">
                                {ne.node_id || `LLM 노드 #${index + 1}`}
                              </span>
                              {ne.model && (
                                <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                                  {ne.model}
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">토큰:</span>
                                <span className="font-medium">{ne.tokens_used?.toLocaleString() || 0}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">비용:</span>
                                <span className="font-medium text-green-600">${ne.cost.toFixed(6)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Inputs */}
                {runDetail.inputs && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">입력 (Input)</h4>
                    <div className="rounded-lg border bg-white p-3 transition-all hover:scale-[1.005]">
                      <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-words font-mono max-h-64 overflow-y-auto">
                        {JSON.stringify(runDetail.inputs, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Outputs */}
                {runDetail.outputs && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">출력 (Output)</h4>
                    <div className="rounded-lg border bg-white p-3 transition-all hover:scale-[1.005]">
                      <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-words font-mono max-h-64 overflow-y-auto">
                        {JSON.stringify(runDetail.outputs, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {runDetail.error_message && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-red-600">에러 메시지</h4>
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 transition-all hover:scale-[1.005]">
                      <p className="text-xs text-red-700">{runDetail.error_message}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-sm text-muted-foreground py-4">
                상세 정보를 불러올 수 없습니다.
              </div>
            )}
          </div>
        )}
      </Card>
    );
  }
);

WorkflowLogRow.displayName = 'WorkflowLogRow';

