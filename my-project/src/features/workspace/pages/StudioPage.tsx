import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilterSidebar } from '@/features/studio/components/FilterSidebar';
import { WorkflowGrid } from '@/features/studio/components/WorkflowGrid';
import { SortDropdown } from '@/features/studio/components/SortDropdown';
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

      const newBot = await botApi.create({
        name: `${botName} 복사본`,
        description: `${botName}의 워크플로우를 기반으로 생성됨`,
        category: 'workflow',
        workflow: {
          nodes: [],
          edges: [],
        },
      });

      if (versionDetail.graph) {
        await botApi.update(newBot.id, {
          workflow: {
            nodes: versionDetail.graph.nodes || [],
            edges: versionDetail.graph.edges || [],
          },
        });
      }

      toast.success('템플릿에서 새 봇을 생성했습니다.');

      await fetchWorkflows();

      navigate(`/bot/${newBot.id}/workflow`);
    } catch (error) {
      console.error('Failed to create bot from template:', error);
      toast.error('템플릿에서 봇 생성에 실패했습니다.');
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

  return (
    <>
      <div className="flex h-[calc(100vh-72px)]">
        <FilterSidebar
          tags={sidebarTags}
          selectedTags={filters.tags}
          onTagToggle={handleTagToggle}
          searchValue={filters.search}
          onSearchChange={(value) => setFilters({ search: value })}
          workflowStats={workflowStats}
        />

        <main className="flex-1 overflow-y-auto bg-gray-100">
          <div className="px-6 pt-4 pb-6 bg-gray-100">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-studio-text-primary">전체 에이전트</h1>
              <SortDropdown value={sortBy} onChange={setSortBy} />
            </div>
          </div>

          <div className="px-6 bg-gray-100">
            <div className="border-t border-gray-300" />
          </div>

          <div className="px-6 pt-8 pb-6 bg-gray-100">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <p className="text-sm text-studio-text-secondary">로딩 중...</p>
              </div>
            ) : error ? (
              <div className="flex h-64 items-center justify-center">
                <p className="text-sm text-destructive">오류가 발생했습니다: {error.message}</p>
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
