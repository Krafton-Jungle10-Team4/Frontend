import { formatDistanceToNowStrict, isValid } from 'date-fns';
import { cn } from '@/shared/components/utils';
import { Tag } from '@/shared/components/tag';
import type {
  Workflow,
  WorkflowStatus,
  DeploymentState,
} from '@/shared/types/workflow';

interface WorkflowGridProps {
  workflows: Workflow[];
  onWorkflowClick?: (id: string) => void;
}

const statusClasses: Record<WorkflowStatus, string> = {
  running: 'text-studio-status-running bg-studio-status-running/10',
  stopped: 'text-studio-status-stopped bg-studio-status-stopped/10',
  error: 'text-red-600 bg-red-100',
  pending: 'text-amber-600 bg-amber-100',
};

const statusLabel: Record<WorkflowStatus, string> = {
  running: '실행 중',
  stopped: '중지됨',
  error: '오류',
  pending: '대기',
};

const deploymentLabels: Record<DeploymentState, string> = {
  deployed: '배포 완료',
  deploying: '배포 중',
  error: '배포 오류',
  stopped: '미배포',
};

export function WorkflowGrid({ workflows, onWorkflowClick }: WorkflowGridProps) {
  if (workflows.length === 0) {
    return (
      <div className="flex h-72 flex-col items-center justify-center rounded-studio border border-dashed border-studio-card-border bg-studio-card-bg text-center">
        <p className="text-lg font-semibold text-foreground">표시할 워크플로우가 없습니다.</p>
        <p className="mt-2 text-sm text-muted-foreground">필터를 조정하거나 새로운 워크플로우를 생성해보세요.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {workflows.map((workflow) => {
        const updatedAtDate = workflow.updatedAt instanceof Date
          ? workflow.updatedAt
          : new Date(workflow.updatedAt ?? Date.now());
        const safeDate = isValid(updatedAtDate) ? updatedAtDate : new Date();
        const formattedUpdatedAt = formatDistanceToNowStrict(safeDate, {
          addSuffix: true,
        });
        const workflowStatus = workflow.status ?? 'stopped';
        const deploymentState = workflow.deploymentState ?? 'stopped';

        return (
          <div
            key={workflow.id}
            role="button"
            tabIndex={0}
            onClick={() => onWorkflowClick?.(workflow.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onWorkflowClick?.(workflow.id);
              }
            }}
            className="group flex h-full cursor-pointer flex-col gap-4 rounded-studio border border-studio-card-border bg-studio-card-bg p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-studio-card focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-primary"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-studio-tag-text">최근 업데이트</p>
                <p className="text-sm font-semibold text-foreground">{formattedUpdatedAt}</p>
              </div>
              <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', statusClasses[workflowStatus])}>
                {statusLabel[workflowStatus]}
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">{workflow.name}</h3>
              {workflow.description && <p className="text-sm text-muted-foreground line-clamp-2">{workflow.description}</p>}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {workflow.tags.slice(0, 3).map((tag) => (
                <Tag key={`${workflow.id}-${tag}`} label={tag} />
              ))}
              {workflow.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">+{workflow.tags.length - 3}</span>
              )}
            </div>

            <div className="mt-auto grid grid-cols-2 gap-3 rounded-studio bg-studio-tag-bg/40 p-3">
              <div>
                <p className="text-xs text-studio-tag-text">최근 버전</p>
                <p className="text-sm font-semibold text-foreground">{workflow.latestVersion || 'v1.0'}</p>
              </div>
              <div>
                <p className="text-xs text-studio-tag-text">배포 상태</p>
                <p className="text-sm font-semibold text-foreground">{deploymentLabels[deploymentState]}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
