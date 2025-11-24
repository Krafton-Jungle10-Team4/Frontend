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
      hint: '운영 중인 서비스 수',
    },
    {
      label: '실행 중',
      value: workflowStats.running,
      tone: 'from-[#7ac8ff] to-[#5f5bff]',
      hint: '현재 활성 상태',
    },
    {
      label: '배포됨',
      value: workflowStats.deployed,
      tone: 'from-[#5f5bff] to-[#3735c3]',
      hint: '프로덕션 배포 완료',
    },
    {
      label: '모니터링',
      value: workflowStats.error + workflowStats.pending,
      tone: 'from-[#f97316] to-[#facc15]',
      hint: '점검이 필요한 항목',
    },
  ];

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-56px)]">
        {/* 메인 콘텐츠 */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 via-white to-indigo-50/40">
          <div className="mx-auto max-w-7xl px-6 pt-10 pb-12 space-y-8">
            <div className="rounded-3xl border border-white/70 bg-white/80 backdrop-blur-xl shadow-[0_18px_60px_rgba(55,53,195,0.12)] px-6 py-6 lg:px-8 lg:py-7 space-y-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3735c3]">Bot Studio</p>
                  <h1 className="text-3xl font-bold text-gray-900 leading-tight">Bot Studio</h1>
                  <p className="text-gray-600 mt-2">워크스페이스를 가볍게 운영할 수 있는 봇 대시보드입니다.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleCreateFromTemplate}
                    className="h-11 px-4 rounded-xl border border-indigo-100 bg-white/70 text-[#3735c3] font-semibold shadow-[0_10px_30px_rgba(55,53,195,0.08)] hover:border-[#3735c3] hover:bg-[#3735c3]/10 transition-all backdrop-blur disabled:opacity-60"
                    disabled={isCreatingFromTemplate}
                  >
                    템플릿에서 생성
                  </button>
                  <button
                    onClick={openCreateDialog}
                    className="h-11 px-5 rounded-xl bg-gradient-to-r from-[#3735c3] via-[#5f5bff] to-[#7ac8ff] text-white font-semibold shadow-[0_15px_40px_rgba(55,53,195,0.35)] hover:shadow-[0_18px_50px_rgba(55,53,195,0.45)] transition-transform hover:-translate-y-0.5"
                  >
                    새 봇 생성
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {statCards.map((card) => (
                  <div
                    key={card.label}
                    className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur-md p-4 shadow-[0_12px_40px_rgba(55,53,195,0.08)]"
                  >
                    <div className="text-xs font-semibold text-gray-600 mb-1">{card.label}</div>
                    <div className="flex items-end justify-between">
                      <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                      <div className={cn(
                        'px-2 py-1 rounded-lg text-[11px] font-semibold text-white shadow-sm bg-gradient-to-r',
                        card.tone
                      )}>
                        {card.hint}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/70 bg-white/80 backdrop-blur-xl shadow-[0_18px_60px_rgba(55,53,195,0.1)] px-6 py-6 lg:px-8 lg:py-7 space-y-6">
              {/* 상단 검색/필터 영역 */}
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

              {/* 워크플로우 그리드 */}
              {loading ? (
                <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-indigo-100 bg-indigo-50/40 text-[#3735c3]">
                  <p className="text-sm font-medium">로딩 중...</p>
                </div>
              ) : error ? (
                <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-red-200 bg-red-50 text-red-600">
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
