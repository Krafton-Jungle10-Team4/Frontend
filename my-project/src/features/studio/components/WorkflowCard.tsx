import { Button } from '@/shared/components/button';
import { cn } from '@/shared/components/utils';
import { MoreVertical, History, Pencil, Trash2, Plus, Tag as TagIcon } from 'lucide-react';
import type { Workflow } from '@/shared/types/workflow';
import { Badge } from '@/shared/components/badge';
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
  onEditTags?: (workflowId: string, currentTags: string[]) => void;
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
  onEditTags,
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

  const formatVersionLabel = (version?: string) => {
    if (!version) return 'v0.0';
    return version.startsWith('v') ? version : `v${version}`;
  };

  const isDeployed = workflow.deploymentState === 'deployed';

  return (
    <div
      className={cn(
        'relative bg-white rounded-studio overflow-hidden',
        'shadow-md hover:shadow-studio-card hover:scale-[1.02] transition-all duration-200',
        'cursor-pointer group h-full flex flex-col',
        isDeployed ? '' : 'border-t-4 border-t-gray-300 border border-studio-card-border'
      )}
      onClick={handleCardClick}
    >
      <div
        className={cn(
          'h-1 flex-shrink-0',
          !isDeployed && 'bg-gray-300'
        )}
        style={isDeployed ? {
          backgroundImage: 'linear-gradient(90deg, #000000, #3735c3)',
        } : undefined}
      />

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-studio-text-primary">
              {workflow.name}
            </h3>
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

        {onEditTags && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {workflow.tags && workflow.tags.length > 0 ? (
              workflow.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs cursor-pointer hover:bg-gray-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditTags(workflow.id, workflow.tags || []);
                  }}
                >
                  <TagIcon className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditTags(workflow.id, []);
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 border border-dashed border-gray-300 rounded hover:border-gray-400 hover:text-gray-600 transition-colors"
              >
                <Plus className="h-3 w-3" />
                태그 추가
              </button>
            )}
          </div>
        )}

        <div className="flex items-center justify-end py-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium text-black bg-white border border-gray-300">
              {formatVersionLabel(workflow.latestVersion)}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onVersionHistory();
              }}
              className="relative overflow-hidden flex items-center gap-1 text-xs px-2 py-1 rounded group/history transition-all hover:scale-105 duration-200"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-black to-blue-600 translate-x-[-100%] group-hover/history:translate-x-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 flex items-center gap-1 text-studio-primary group-hover/history:text-white transition-colors duration-300">
                <History className="h-3 w-3" />
                <span>버전 히스토리</span>
              </span>
            </button>
          </div>
        </div>

        <div className="flex gap-2 mt-auto">
          {isDeployed ? (
            <Button
              variant="studio-dark"
              size="sm"
              rounded="sharp"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onNavigateDeployment?.();
              }}
              className="flex-1 hover:opacity-90 hover:scale-105 transition-all duration-200"
              style={{
                backgroundImage: 'linear-gradient(90deg, #000000, #3735c3)',
              }}
            >
              배포 관리
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              rounded="sharp"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onNavigateDeployment?.();
              }}
              className="flex-1 bg-gray-100 text-gray-500 border-gray-300 hover:bg-gray-200 hover:text-gray-700 hover:scale-105 transition-all duration-200"
            >
              미배포
            </Button>
          )}

          <Button
            variant="studio-outline"
            size="sm"
            rounded="sharp"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onPublish();
            }}
            className="flex-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 hover:scale-105 transition-all duration-200"
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
