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
  const deploymentLabel =
    workflow.deploymentState === 'deployed'
      ? '배포됨'
      : workflow.deploymentState === 'deploying'
        ? '배포 중'
        : '초안';
  const lastUpdatedLabel = workflow.updatedAt
    ? new Date(workflow.updatedAt).toLocaleDateString('ko-KR')
    : '—';

  return (
    <div
      className={cn(
        'relative bg-white/80 rounded-2xl overflow-hidden backdrop-blur-md',
        'shadow-[0_15px_50px_rgba(55,53,195,0.08)] hover:shadow-[0_20px_60px_rgba(55,53,195,0.18)] hover:-translate-y-2 transition-all duration-300',
        'cursor-pointer group h-[190px] flex flex-col border border-white/70',
        isDeployed ? 'border-[#3735c3]/50' : 'border-studio-card-border/50'
      )}
      onClick={handleCardClick}
    >
      <div
        className={cn(
          'h-1.5 flex-shrink-0',
          !isDeployed && 'bg-gray-200'
        )}
        style={isDeployed ? {
          backgroundImage: 'linear-gradient(90deg, #3735c3, #5f5bff, #7ac8ff)',
        } : undefined}
      />

      <div className="px-5 py-4 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 flex items-center gap-2">
            {/* 버전 정보 (클릭 가능) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onVersionHistory();
              }}
              className={cn(
                "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold transition-colors flex-shrink-0 border",
                isDeployed
                  ? "text-[#3735c3] bg-indigo-50 border-indigo-100 hover:border-[#3735c3]"
                  : "text-gray-700 bg-white/70 border-gray-200 hover:border-[#3735c3]/40"
              )}
            >
              {formatVersionLabel(workflow.latestVersion)}
            </button>

            <h3 className="font-bold text-lg text-studio-text-primary text-gray-800">
              {workflow.name}
            </h3>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1 -mr-1 transition-opacity rounded hover:bg-studio-hover"
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

        <div className="flex items-center gap-2 mb-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm',
              isDeployed
                ? 'bg-[#3735c3]/10 text-[#3735c3]'
                : workflow.deploymentState === 'deploying'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-gray-100 text-gray-700'
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {deploymentLabel}
          </span>
          <span className="text-[12px] text-gray-500">최근 업데이트 {lastUpdatedLabel}</span>
        </div>

        {/* 서비스 설명 */}
        {workflow.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {workflow.description}
          </p>
        )}

        {/* 태그 영역 (하단) */}
        {onEditTags && (
          <div className="flex flex-wrap gap-2 mt-auto">
            {workflow.tags && workflow.tags.length > 0 ? (
              workflow.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-[11px] px-2 py-0.5 h-5 cursor-pointer rounded-full border border-indigo-100 bg-indigo-50/70 text-indigo-700 hover:border-[#3735c3]"
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
