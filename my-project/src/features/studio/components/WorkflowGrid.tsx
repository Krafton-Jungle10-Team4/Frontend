import { formatDistanceToNowStrict } from 'date-fns';
import { cn } from '@/shared/components/utils';
import { Tag } from '@/shared/components/tag';

export type StudioWorkflowStatus = 'running' | 'stopped' | 'draft' | 'pending';

export interface StudioWorkflowCard {
  id: string;
  name: string;
  description?: string;
  tags: string[];
  status: StudioWorkflowStatus;
  latestVersion?: string;
  updatedAt: string | Date;
  marketplaceState?: string;
  deploymentState?: string;
}

interface WorkflowGridProps {
  workflows: StudioWorkflowCard[];
  onWorkflowClick?: (id: string) => void;
}

const statusClasses: Record<StudioWorkflowStatus, string> = {
  running: 'text-studio-status-running bg-studio-status-running/10',
  stopped: 'text-studio-status-stopped bg-studio-status-stopped/10',
  draft: 'text-studio-status-stopped bg-studio-status-stopped/10',
  pending: 'text-amber-600 bg-amber-100',
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
        const formattedUpdatedAt = formatDistanceToNowStrict(new Date(workflow.updatedAt), {
          addSuffix: true,
        });

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
              <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', statusClasses[workflow.status])}>
                {workflow.status === 'running'
                  ? '실행 중'
                  : workflow.status === 'pending'
                  ? '대기'
                  : workflow.status === 'draft'
                  ? '초안'
                  : '중지됨'}
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
                <p className="text-sm font-semibold text-foreground">{workflow.latestVersion ?? 'v1.0'}</p>
              </div>
              <div>
                <p className="text-xs text-studio-tag-text">배포 상태</p>
                <p className="text-sm font-semibold text-foreground">
                  {workflow.deploymentState ? workflow.deploymentState : '미배포'}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
