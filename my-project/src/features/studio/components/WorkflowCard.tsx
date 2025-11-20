import { Button } from '@/shared/components/button';
import { cn } from '@/shared/components/utils';
import { MoreVertical, History } from 'lucide-react';
import type { Workflow } from '@/shared/types/workflow';

interface WorkflowCardProps {
  workflow: Workflow;
  onEdit: () => void;
  onDeploy: () => void;
  onPublish: () => void;
  onVersionHistory: () => void;
  onMenuAction: (action: string) => void;
}

export function WorkflowCard({
  workflow,
  onEdit,
  onDeploy,
  onPublish,
  onVersionHistory,
  onMenuAction,
}: WorkflowCardProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest('button')) {
      onEdit();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            실행 중
          </span>
        );
      case 'stopped':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
            중지됨
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
            대기 중
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
            오류
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'relative bg-white rounded-studio overflow-hidden',
        'border border-gray-200',
        'hover:shadow-studio-card transition-all duration-200',
        'cursor-pointer group'
      )}
      onClick={handleCardClick}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-studio-card-accent" />

      <div className="p-5 pt-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-base text-gray-900 mb-2">
              {workflow.name}
            </h3>
            <div className="flex items-center gap-2">
              {getStatusBadge(workflow.status)}
              <span className="text-xs text-gray-500">
                v{workflow.latestVersion}
              </span>
            </div>
          </div>

          <button
            className="p-1 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              onMenuAction('more');
            }}
          >
            <MoreVertical className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {workflow.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded-sharp text-xs font-medium bg-gray-100 text-gray-700"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between py-3 mb-4 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <span>최신 배포 버전: v{workflow.latestVersion}</span>
            <span className="text-gray-400">·</span>
            <span>이전 버전 {workflow.previousVersionCount}개</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onVersionHistory();
            }}
            className="flex items-center gap-1 text-xs text-studio-primary hover:text-studio-primary-hover transition-colors"
          >
            <History className="h-3 w-3" />
            <span>버전 히스토리</span>
          </button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="studio-dark"
            size="sm"
            rounded="sharp"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onDeploy();
            }}
            className="flex-1"
          >
            배포 관리
          </Button>

          <Button
            variant="studio-outline"
            size="sm"
            rounded="sharp"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onPublish();
            }}
            className="flex-1"
          >
            마켓플레이스에 게시
          </Button>
        </div>
      </div>
    </div>
  );
}
