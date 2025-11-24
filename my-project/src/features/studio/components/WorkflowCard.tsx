import { cn } from '@/shared/components/utils';
import { MoreVertical, Pencil, Trash2, Plus, Rocket, Store, RocketIcon } from 'lucide-react';
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
import { getWorkflowIcon, getWorkflowIconBackground, getWorkflowIconColor } from '@/features/studio/constants/tagIcons';

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

function formatRelativeTime(date: Date | string | undefined | null): string {
  if (!date) return '-';

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return '-';

  const now = new Date();
  const diffMs = now.getTime() - parsedDate.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return '방금 전';
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;

  return parsedDate.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  });
}

const formatVersionLabel = (version?: string) => {
  if (!version) return 'v0.0';
  return version.startsWith('v') ? version : `v${version}`;
};

const getCreatedTimestamp = (workflow: Workflow) =>
  (workflow as any).createdAt ||
  (workflow as any).created_at ||
  (workflow as any).updated_at ||
  workflow.updatedAt;

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

  // keep unused handler prop for future actions
  void onDeploy;

  const handleCardClick = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest('button')) {
      onEdit();
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(false);
    onDelete();
  };

  const isDeployed = workflow.deploymentState === 'deployed';
  const isMarketplacePublished = workflow.marketplaceState === 'published';
  const createdTime = getCreatedTimestamp(workflow);

  return (
    <div
      className={cn(
        'group relative bg-white rounded-lg border border-gray-200 p-4',
        'shadow-sm transition-all duration-200 cursor-pointer',
        'hover:shadow-md hover:-translate-y-1'
      )}
      onClick={handleCardClick}
    >

      <div className="flex justify-between items-start mb-2 gap-2">
        <div className="flex items-start gap-3 min-w-0">
          {(() => {
            const IconComponent = getWorkflowIcon(workflow.tags);
            return (
              <div
                className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border"
                style={{
                  background: getWorkflowIconBackground(workflow.tags),
                  borderColor: getWorkflowIconColor(workflow.tags) + '30'
                }}
              >
                <IconComponent
                  className="w-6 h-6"
                  style={{ color: getWorkflowIconColor(workflow.tags) }}
                />
              </div>
            );
          })()}
          <div className="min-w-0 flex-1">
            <h3
              className={cn(
                'text-sm font-bold leading-tight transition-colors line-clamp-1',
                isDeployed
                  ? 'text-gray-900 group-hover:text-gray-700'
                  : 'text-gray-700'
              )}
            >
              {workflow.name}
            </h3>
            <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
              <span>{formatRelativeTime(createdTime)}</span>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors -mr-1 -mt-1 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <MoreVertical className="h-4 w-4" />
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

      <p className="text-xs text-gray-500 line-clamp-2 mb-3 min-h-[32px]">
        {workflow.description || '설명이 없습니다.'}
      </p>

      <div className="flex justify-end items-center mb-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onVersionHistory();
          }}
          className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors text-gray-600 bg-gray-50 hover:bg-gray-100"
        >
          {formatVersionLabel(workflow.latestVersion)}
        </button>
      </div>

      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isMarketplacePublished && (
            <div className="inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-700 shadow-sm">
              <Store className="h-3.5 w-3.5 text-indigo-600" />
            </div>
          )}
          {isDeployed ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <RocketIcon className="h-3 w-3 text-emerald-600" />
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-100">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
              <RocketIcon className="h-3 w-3 text-gray-400" />
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {onEditTags && workflow.tags && workflow.tags.length > 0 ? (
            <>
              {workflow.tags.slice(0, 2).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0.5 rounded cursor-pointer hover:brightness-95"
                  style={{
                    background: getWorkflowIconBackground([tag]),
                    color: getWorkflowIconColor([tag]),
                    borderColor: getWorkflowIconColor([tag]) + '33',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditTags(workflow.id, workflow.tags || []);
                  }}
                >
                  {tag}
                </Badge>
              ))}
              {workflow.tags.length > 2 && (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{
                    background: getWorkflowIconBackground(workflow.tags),
                    color: getWorkflowIconColor(workflow.tags),
                    borderColor: getWorkflowIconColor(workflow.tags) + '33',
                  }}
                >
                  +{workflow.tags.length - 2}
                </Badge>
              )}
            </>
          ) : onEditTags ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditTags(workflow.id, []);
              }}
              className="flex items-center space-x-1 text-[10px] font-medium text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Plus className="h-3 w-3" />
              <span>태그 추가</span>
            </button>
          ) : null}
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
