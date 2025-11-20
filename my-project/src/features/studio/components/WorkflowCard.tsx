import { Button } from '@/shared/components/button';
import { cn } from '@/shared/components/utils';
import { MoreVertical, History, Pencil, Trash2, Settings } from 'lucide-react';
import type { Workflow } from '@/shared/types/workflow';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/shared/components/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/alert-dialog';
import { useState } from 'react';

interface WorkflowCardProps {
  workflow: Workflow;
  onEdit: () => void;
  onDeploy: () => void;
  onPublish: () => void;
  onVersionHistory: () => void;
  onUpdate: () => void;
  onDelete: () => void;
  onNavigateDeployment?: () => void;
}

export function WorkflowCard({
  workflow,
  onEdit,
  onDeploy,
  onPublish,
  onVersionHistory,
  onUpdate,
  onDelete,
  onNavigateDeployment,
}: WorkflowCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest('button')) {
      onEdit();
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(false);
    onDelete();
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

  const formatVersionLabel = (version?: string) => {
    if (!version) return 'v0.0';
    return version.startsWith('v') ? version : `v${version}`;
  };

  return (
    <div
      className={cn(
        'relative bg-white rounded-studio overflow-hidden',
        'border border-studio-card-border',
        'hover:shadow-studio-card transition-all duration-200',
        'cursor-pointer group h-full flex flex-col'
      )}
      onClick={handleCardClick}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-studio-card-accent" />

      <div className="p-5 pt-4 flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-base text-studio-text-primary mb-2">
              {workflow.name}
            </h3>
            <div className="flex items-center gap-2">
              {getStatusBadge(workflow.status)}
              <span className="text-xs text-studio-text-secondary">
                {formatVersionLabel(workflow.latestVersion)}
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-studio-hover"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <MoreVertical className="h-4 w-4 text-studio-text-muted" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateDeployment?.();
                }}
                className="cursor-pointer"
              >
                <Settings className="h-4 w-4 mr-2" />
                배포 관리
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate();
                }}
                className="cursor-pointer"
              >
                <Pencil className="h-4 w-4 mr-2" />
                수정
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteDialog(true);
                }}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {workflow.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded-sharp text-xs font-medium bg-studio-tag-bg text-studio-tag-text"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between py-3 mb-4 border-t border-studio-divider">
          <div className="flex items-center gap-1 text-xs text-studio-text-secondary">
            <span>최신 배포 버전: {formatVersionLabel(workflow.latestVersion)}</span>
            <span className="text-studio-text-muted">·</span>
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

        <div className="flex gap-2 mt-auto">
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
            배포 옵션
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>워크플로우 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              "{workflow.name}" 워크플로우를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
