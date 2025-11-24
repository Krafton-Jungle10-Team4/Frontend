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
      <div className="relative min-h-[calc(100vh-56px)] bg-[#f7f8fa] text-slate-900">
        <main className="relative w-full flex-1 flex-col gap-6 px-5 md:px-8 lg:px-10 py-8">
          <div className="relative w-full px-5 py-6">
            <div className="relative grid gap-6 items-start lg:items-start lg:grid-cols-[1.4fr_1fr]">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-gray-900 tracking-tight">STUDIO</span>
                  <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 shadow-sm">
                    {filteredWorkflows.length} 템플릿
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  템플릿 기반 서비스를 한곳에서 모아 관리하고 배포하세요.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {['생성', '관리', '배포'].map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-semibold text-gray-800 shadow-sm"
                    >
                      <span className="h-2 w-2 rounded-full bg-orange-500" />
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3 self-start w-full">
                <div className="grid grid-cols-2 gap-3">
                  {statCards.map((card, index) => {
                    const isPrimaryCard = index === 0;
                    return (
                    <div
                      key={card.label}
                      className={cn(
                        'relative overflow-hidden rounded-2xl border border-white/70 p-2.5',
                        'shadow-[0_8px_20px_rgba(55,53,195,0.12)] min-h-[96px] flex flex-col justify-between',
                        isPrimaryCard ? 'bg-white' : 'bg-white/80'
                      )}
                    >
                      <div className="relative space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-500">
                          {card.label}
                        </p>
                        <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                        <p className="text-xs text-slate-500">{card.hint}</p>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="relative w-full space-y-4">
            <div className="relative px-1 md:px-2 lg:px-3 py-3 md:py-4">
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
