import { useEffect, useMemo } from 'react';
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
import { useUIStore } from '@/shared/stores/uiStore';

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
    navigate('/workspace/library');
  };

  const handleOpenWorkflow = (workflowId: string) => {
    navigate(`/bot/${workflowId}/workflow`);
  };

  const handleNavigateDeployment = (workflowId: string) => {
    navigate(`/workspace/deployment/${workflowId}`);
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
          <div className="px-6 py-4 bg-gray-100">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-studio-text-primary">전체 워크플로우</h1>
              <SortDropdown value={sortBy} onChange={setSortBy} />
            </div>
          </div>

          <div className="p-6 bg-gray-100">
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
    </>
  );
}
