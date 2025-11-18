import { memo } from 'react';
import { CheckCircle2, XCircle, Loader2, Clock, ChevronRight } from 'lucide-react';
import { Card } from '@/shared/components/card';
import { Badge } from '@/shared/components/badge';
import type { WorkflowRunSummary } from '../../../types/log.types';
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

const formatElapsedTime = (seconds?: number | null) => {
  if (!seconds) return '-';
  if (seconds < 60) return `${seconds.toFixed(1)}초`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}분 ${remainingSeconds.toFixed(0)}초`;
};

export const WorkflowLogRow = memo<WorkflowLogRowProps>(
  ({ run, isActive = false, onSelect }) => {
    const handleClick = () => {
      onSelect(run);
    };

    return (
      <Card
        className={`cursor-pointer transition-all hover:shadow-md ${
          isActive ? 'ring-2 ring-primary bg-primary/5' : ''
        }`}
        onClick={handleClick}
      >
        <div className="p-4 space-y-3">
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
            <ChevronRight
              className={`h-4 w-4 text-muted-foreground transition-transform ${
                isActive ? 'rotate-90' : ''
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
      </Card>
    );
  }
);

WorkflowLogRow.displayName = 'WorkflowLogRow';

