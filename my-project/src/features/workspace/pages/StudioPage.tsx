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

  useEffect(() => {
    void fetchWorkflows();
  }, [fetchWorkflows]);

  const filteredAndSortedWorkflows = useMemo(
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

  const handleWorkflowClick = (workflowId: string) => {
    navigate(`/bot/${workflowId}/workflow`);
  };

  return (
    <div className="flex h-[calc(100vh-72px)]">
      <FilterSidebar
        tags={sidebarTags}
        selectedTags={filters.tags}
        onTagToggle={handleTagToggle}
        searchValue={filters.search}
        onSearchChange={(value) => setFilters({ search: value })}
        workflowStats={workflowStats}
      />

      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="bg-studio-card-bg border-b border-studio-card-border px-6 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-studio-tag-text">전체 워크플로우</p>
              <h1 className="text-2xl font-bold text-foreground">워크플로우 대시보드</h1>
            </div>
            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-sm text-muted-foreground">로딩 중...</p>
            </div>
          ) : error ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-sm text-destructive">오류가 발생했습니다: {error.message}</p>
            </div>
          ) : (
            <WorkflowGrid
              workflows={filteredAndSortedWorkflows}
              onWorkflowClick={handleWorkflowClick}
            />
          )}
        </div>
      </main>
    </div>
  );
}
