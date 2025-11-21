import { cn } from '@/shared/components/utils';
import { MoreVertical, Pencil, Trash2, Plus, Tag as TagIcon, Rocket, Store } from 'lucide-react';
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
        'relative bg-white rounded-lg overflow-hidden',
        'shadow-md hover:shadow-studio-card hover:scale-[1.02] transition-all duration-200',
        'cursor-pointer group h-[160px] flex flex-col',
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

      <div className="px-5 py-3 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-1">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-studio-text-primary text-gray-800">
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
                서비스 수정
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateDeployment?.();
                }}
                className="cursor-pointer"
              >
                <Rocket className="h-4 w-4 mr-2" />
                배포 관리
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onPublish();
                }}
                className="cursor-pointer"
              >
                <Store className="h-4 w-4 mr-2" />
                마켓플레이스에 게시
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
                서비스 삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 버전 정보 (클릭 가능) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onVersionHistory();
          }}
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mb-1.5 transition-colors w-fit",
            isDeployed
              ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
              : "text-gray-600 bg-gray-100 hover:bg-gray-200"
          )}
        >
          {formatVersionLabel(workflow.latestVersion)}
        </button>

        {/* 서비스 설명 */}
        {workflow.description && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-2">
            {workflow.description}
          </p>
        )}

        {/* 태그 영역 (하단) */}
        {onEditTags && (
          <div className="flex flex-wrap gap-1 mt-auto">
            {workflow.tags && workflow.tags.length > 0 ? (
              workflow.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 h-4 cursor-pointer rounded text-gray-600 hover:bg-gray-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditTags(workflow.id, workflow.tags || []);
                  }}
                >
                  <TagIcon className="h-2.5 w-2.5 mr-0.5" />
                  {tag}
                </Badge>
              ))
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditTags(workflow.id, []);
                }}
                className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] text-gray-500 border border-dashed border-gray-300 rounded hover:border-gray-400 hover:text-gray-600 transition-colors"
              >
                <Plus className="h-2.5 w-2.5" />
                태그 추가
              </button>
            )}
          </div>
        )}
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
