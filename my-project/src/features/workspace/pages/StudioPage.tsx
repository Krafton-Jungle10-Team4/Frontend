import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchAndFilters } from '@/features/studio/components/SearchAndFilters';
import { WorkflowGrid } from '@/features/studio/components/WorkflowGrid';
import { useWorkflowStore } from '@/features/studio/stores/workflowStore';
import {
  selectFilteredAndSortedWorkflows,
  selectAvailableTags,
  selectWorkflowStats,
} from '@/features/studio/stores/selectors';
import { useBotCreateDialog } from '@/features/bot/hooks/useBotCreateDialog';
import { BotCreateDialog } from '@/features/bot/components/BotCreateDialog';
import { BotTagsDialog } from '@/features/bot/components/BotTagsDialog';
import { BotVersionSelectorDialog } from '@/features/studio/components/BotVersionSelectorDialog';
import { useUIStore } from '@/shared/stores/uiStore';
import { toast } from 'sonner';
import { botApi } from '@/features/bot/api/botApi';
import { workflowApi } from '@/features/workflow/api/workflowApi';
import { cn } from '@/shared/components/utils';

export function StudioPage() {
  const navigate = useNavigate();
  const workflows = useWorkflowStore((state) => state.workflows);
  const loading = useWorkflowStore((state) => state.loading);
  const error = useWorkflowStore((state) => state.error);
  const filters = useWorkflowStore((state) => state.filters);
  const sortBy = useWorkflowStore((state) => state.sortBy);
  const setFilters = useWorkflowStore((state) => state.setFilters);
  const setSortBy = useWorkflowStore((state) => state.setSortBy);
  const fetchWorkflows = useWorkflowStore((state) => state.fetchWorkflows);
  const updateWorkflow = useWorkflowStore((state) => state.updateWorkflow);
  const availableTags = useWorkflowStore((state) => state.availableTags);
  const stats = useWorkflowStore((state) => state.stats);
  const language = useUIStore((state) => state.language);
  const {
    isOpen: isCreateDialogOpen,
    isCreating: isCreatingBot,
    openDialog: openCreateDialog,
    closeDialog: closeCreateDialog,
    createBot,
  } = useBotCreateDialog();

  // 태그 편집 다이얼로그 상태
  const [isTagsDialogOpen, setIsTagsDialogOpen] = useState(false);
  const [editingWorkflowId, setEditingWorkflowId] = useState<string>('');
  const [editingWorkflowTags, setEditingWorkflowTags] = useState<string[]>([]);

  // 봇 버전 선택 다이얼로그 상태
  const [isVersionSelectorOpen, setIsVersionSelectorOpen] = useState(false);
  const [isCreatingFromTemplate, setIsCreatingFromTemplate] = useState(false);

  useEffect(() => {
    void fetchWorkflows();
  }, [fetchWorkflows]);

  const filteredWorkflows = useMemo(
    () => selectFilteredAndSortedWorkflows(workflows, filters, sortBy),
    [workflows, filters, sortBy]
  );

  const sidebarTags = useMemo(() => {
    if (availableTags.length > 0) {
      return availableTags;
    }
    return selectAvailableTags(workflows);
  }, [availableTags, workflows]);

  const workflowStats = useMemo(() => {
    const hasApiStats =
      stats.total !== 0 ||
      stats.running !== 0 ||
      stats.stopped !== 0 ||
      stats.error !== 0 ||
      stats.pending !== 0;
    return hasApiStats ? stats : selectWorkflowStats(workflows);
  }, [stats, workflows]);

  const handleTagToggle = (tag: string) => {
    const nextTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    setFilters({ tags: nextTags });
  };

  const handleCreateFromTemplate = () => {
    setIsVersionSelectorOpen(true);
  };

  const handleVersionSelect = async (botId: string, versionId: string, botName: string) => {
    setIsCreatingFromTemplate(true);
    try {
      const versionDetail = await workflowApi.getWorkflowVersionDetail(botId, versionId);

      // 1. 새 봇 생성 (빈 워크플로우로)
      const newBot = await botApi.create({
        name: `${botName} 복사본`,
        description: `${botName}을 기반으로 생성됨`,
        category: 'workflow',
        workflow: {
          nodes: [],
          edges: [],
        },
      });

      // 2. BotWorkflowVersion draft 생성 (템플릿 워크플로우 복사)
      if (versionDetail.graph) {
        await workflowApi.upsertDraftWorkflow(
          newBot.id,
          versionDetail.graph.nodes || [],
          versionDetail.graph.edges || [],
          {
            environment_variables: versionDetail.environment_variables || {},
            conversation_variables: versionDetail.conversation_variables || {},
          }
        );
      }

      toast.success('템플릿에서 새 서비스를 생성했습니다.');

      await fetchWorkflows();

      navigate(`/bot/${newBot.id}/workflow`, {
        state: { botName: `${botName} 복사본` }
      });
    } catch (error) {
      console.error('Failed to create bot from template:', error);
      toast.error('템플릿에서 서비스 생성에 실패했습니다.');
    } finally {
      setIsCreatingFromTemplate(false);
    }
  };

  const handleOpenWorkflow = (workflowId: string) => {
    navigate(`/bot/${workflowId}/workflow`);
  };

  const handleNavigateDeployment = (workflowId: string) => {
    navigate(`/workspace/deployment/${workflowId}`);
  };

  const handleEditTags = (workflowId: string, currentTags: string[]) => {
    setEditingWorkflowId(workflowId);
    setEditingWorkflowTags(currentTags);
    setIsTagsDialogOpen(true);
  };

  const handleSaveTags = async (workflowId: string, tags: string[]) => {
    try {
      await updateWorkflow(workflowId, { tags });
      toast.success('태그가 업데이트되었습니다.');
    } catch (error) {
      console.error('Failed to update tags:', error);
      toast.error('태그 업데이트에 실패했습니다.');
      throw error;
    }
  };

  const statCards = [
    {
      label: '전체 봇',
      value: workflowStats.total || filteredWorkflows.length,
      tone: 'from-[#3735c3] to-[#5f5bff]',
      hint: '등록된 봇 수',
    },
    {
      label: '배포 완료',
      value: workflowStats.deployed,
      tone: 'from-[#5f5bff] to-[#3735c3]',
      hint: '프로덕션 배포 상태',
    },
  ];

  return (
    <>
      <div className="relative min-h-[calc(100vh-56px)] bg-gradient-to-b from-white via-slate-50 to-indigo-50/35 text-slate-900">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(99,102,241,0.14),transparent_32%),radial-gradient(circle_at_82%_5%,rgba(14,165,233,0.12),transparent_30%),radial-gradient(circle_at_60%_70%,rgba(168,85,247,0.14),transparent_36%)]" />
        <main className="relative w-full flex-1 flex-col gap-5 px-4 md:px-8 py-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between px-2">
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-500">Studio</span>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold text-gray-900">Bot Studio</h1>
                <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 shadow-sm">
                  {filteredWorkflows.length} 템플릿
                </span>
              </div>
              <p className="text-sm text-slate-600">Landing 무드의 밝은 글래스 톤으로 템플릿 기반 봇을 관리하세요.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleCreateFromTemplate}
                className="h-10 px-4 rounded-lg border border-indigo-100 bg-white text-[#3735c3] font-semibold shadow-[0_8px_24px_rgba(55,53,195,0.08)] hover:border-[#3735c3] disabled:opacity-60"
                disabled={isCreatingFromTemplate}
              >
                템플릿에서 생성
              </button>
              <button
                onClick={openCreateDialog}
                className="h-10 px-4 rounded-lg bg-gradient-to-r from-[#3735c3] via-[#5f5bff] to-[#7ac8ff] text-white font-semibold shadow-[0_12px_34px_rgba(55,53,195,0.25)] hover:shadow-[0_14px_40px_rgba(55,53,195,0.32)]"
              >
                새 봇 생성
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/70 bg-white/85 p-4 md:p-5 shadow-[0_14px_40px_rgba(55,53,195,0.12)] backdrop-blur space-y-4">
            <div className="rounded-xl border border-white/70 bg-white/90 p-4 shadow-inner shadow-indigo-100/70">
              <SearchAndFilters
                searchValue={filters.search}
                onSearchChange={(value) => setFilters({ search: value })}
                tags={sidebarTags}
                selectedTags={filters.tags}
                onTagToggle={handleTagToggle}
                sortBy={sortBy}
                onSortChange={setSortBy}
                stats={workflowStats}
              />
            </div>

            <div className="rounded-xl border border-white/70 bg-white/90 p-3 shadow-inner shadow-indigo-100/70">
              {loading ? (
                <div className="flex h-64 items-center justify-center text-slate-600">로딩 중...</div>
              ) : error ? (
                <div className="flex h-64 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600">
                  <p className="text-sm">오류가 발생했습니다: {error.message}</p>
                </div>
              ) : (
                <WorkflowGrid
                  workflows={filteredWorkflows}
                  sortBy={sortBy}
                  onCreateBlank={openCreateDialog}
                  onCreateFromTemplate={handleCreateFromTemplate}
                  onOpenWorkflow={handleOpenWorkflow}
                  onNavigateDeployment={handleNavigateDeployment}
                  onEditTags={handleEditTags}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      <BotCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={closeCreateDialog}
        language={language}
        onSubmit={createBot}
        isCreating={isCreatingBot}
      />

      <BotTagsDialog
        open={isTagsDialogOpen}
        onOpenChange={setIsTagsDialogOpen}
        botId={editingWorkflowId}
        currentTags={editingWorkflowTags}
        onSave={handleSaveTags}
        language={language}
      />

      <BotVersionSelectorDialog
        open={isVersionSelectorOpen}
        onOpenChange={setIsVersionSelectorOpen}
        onSelect={handleVersionSelect}
      />
    </>
  );
}
