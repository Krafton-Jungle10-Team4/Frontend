import { cn } from '@/shared/components/utils';
import { MoreVertical, Pencil, Trash2, Plus, Tag as TagIcon, Rocket, Store, GitCommit } from 'lucide-react';
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
import { getCategoryIcon, getCategoryPreset } from '@/features/bot/constants/categoryPresets';

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

const withAlpha = (hex: string, alpha: number) => {
  const normalized = Math.round(Math.min(Math.max(alpha, 0), 1) * 255)
    .toString(16)
    .padStart(2, '0');
  const cleaned = hex.replace('#', '');
  return `#${cleaned}${normalized}`;
};

const formatVersionLabel = (version?: string) => {
  if (!version) return 'v0.0';
  return version.startsWith('v') ? version : `v${version}`;
};

const formatRelativeTime = (date?: Date) => {
  if (!date) return '정보 없음';
  const diffSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  const days = Math.floor(diffSeconds / 86400);
  const hours = Math.floor((diffSeconds % 86400) / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);

  if (days > 0) return `${days}일 전`;
  if (hours > 0) return `${hours}시간 전`;
  if (minutes > 0) return `${minutes}분 전`;
  return '방금 전';
};

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
  const primaryTag = workflow.tags?.[0];
  const categoryPreset = getCategoryPreset(primaryTag);
  const categoryLabel = categoryPreset.label || '기타';
  const CategoryIcon = getCategoryIcon(primaryTag);
  const secondaryTags = workflow.tags?.slice(1) ?? [];
  const cardAccent = `radial-gradient(circle at 20% 18%, ${withAlpha(categoryPreset.primary, 0.14)}, transparent 36%), radial-gradient(circle at 88% 10%, ${withAlpha(categoryPreset.secondary, 0.12)}, transparent 40%)`;

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
  const deploymentLabel =
    workflow.deploymentState === 'deployed'
      ? '배포됨'
      : workflow.deploymentState === 'deploying'
        ? '배포 중'
        : '초안';
  const versionCommitLabel = formatRelativeTime(workflow.updatedAt);

  const deploymentStyles =
    workflow.deploymentState === 'deployed'
      ? {
          bg: withAlpha(categoryPreset.primary, 0.12),
          text: categoryPreset.primary,
        }
      : workflow.deploymentState === 'deploying'
        ? {
            bg: '#fff7ed',
            text: '#f97316',
          }
        : workflow.deploymentState === 'error'
          ? {
              bg: '#fef2f2',
              text: '#ef4444',
            }
          : {
              bg: '#f8fafc',
              text: '#334155',
            };

  return (
    <div
      className={cn(
        'relative bg-white/80 rounded-2xl overflow-hidden backdrop-blur-md',
        'shadow-[0_15px_50px_rgba(55,53,195,0.08)] hover:shadow-[0_22px_64px_rgba(55,53,195,0.18)] hover:-translate-y-2 transition-all duration-300',
        'cursor-pointer group flex flex-col border border-white/70'
      )}
      onClick={handleCardClick}
    >
      <div
        className="absolute inset-0 opacity-90"
        style={{ backgroundImage: cardAccent }}
        aria-hidden
      />

      <div className="relative flex flex-col h-full">
        <div className="flex flex-col gap-4 px-5 pt-5 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-1 items-start gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm ring-1 ring-white/70"
                style={{
                  background: `linear-gradient(135deg, ${categoryPreset.primary}, ${categoryPreset.secondary})`,
                }}
              >
                <CategoryIcon className="h-6 w-6 text-white drop-shadow-sm" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900">
                    {workflow.name}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onVersionHistory();
                    }}
                    className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-gray-700 shadow-sm transition-colors hover:border-[#3735c3]/40"
                  >
                    {formatVersionLabel(workflow.latestVersion)}
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm"
                    style={{
                      backgroundColor: withAlpha(categoryPreset.primary, 0.12),
                      color: categoryPreset.primary,
                    }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {categoryLabel}
                  </span>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm"
                    style={{
                      backgroundColor: deploymentStyles.bg,
                      color: deploymentStyles.text,
                    }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {deploymentLabel}
                  </span>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-2 transition rounded-full hover:bg-white/70 hover:shadow"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <MoreVertical className="h-4 w-4 text-studio-text-muted" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
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

          {workflow.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {workflow.description}
            </p>
          )}

          {onEditTags && (
            <div className="flex flex-wrap gap-2">
              {workflow.tags && workflow.tags.length > 0 ? (
                <>
                  <Badge
                    key={`${workflow.id}-primary-tag`}
                    variant="secondary"
                    className="text-[11px] px-2 py-0.5 h-6 cursor-pointer rounded-full border border-transparent bg-white/80 text-gray-700 shadow-sm hover:border-[#3735c3]/50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditTags(workflow.id, workflow.tags || []);
                    }}
                  >
                    <TagIcon className="h-3 w-3 mr-1 text-gray-500" />
                    {primaryTag || '기타'}
                  </Badge>
                  {secondaryTags.map((tag) => (
                    <Badge
                      key={`${workflow.id}-${tag}`}
                      variant="secondary"
                      className="text-[11px] px-2 py-0.5 h-6 cursor-pointer rounded-full border border-indigo-100 bg-indigo-50/70 text-indigo-700 hover:border-[#3735c3]"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTags(workflow.id, workflow.tags || []);
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </>
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

        <div className="mt-auto flex items-center justify-between border-t border-white/70 bg-slate-50/80 px-5 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-full"
              style={{
                backgroundColor: withAlpha(categoryPreset.muted, 0.6),
              }}
            >
              <GitCommit className="h-4 w-4 text-gray-600" />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-semibold text-gray-700">버전 커밋</span>
              <span className="text-[11px] text-gray-500">
                {formatVersionLabel(workflow.latestVersion)} · {versionCommitLabel}
              </span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="inline-flex items-center gap-2 rounded-full border border-transparent bg-black px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,0,0,0.26)] transition hover:bg-[#111111]"
          >
            사용하기
          </button>
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
