/**
 * Computed Selectors
 * Phase 4: 데이터 모델 및 상태 관리 재설계
 */

import { Workflow, WorkflowFilters, SortOption } from '@shared/types/workflow';

/**
 * 필터가 적용된 워크플로우 목록을 반환하는 셀렉터
 * @param workflows 전체 워크플로우 목록
 * @param filters 필터 조건
 * @returns 필터링된 워크플로우 목록
 */
export const selectFilteredWorkflows = (
  workflows: Workflow[],
  filters: WorkflowFilters
): Workflow[] => {
  return workflows.filter((workflow) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        workflow.name.toLowerCase().includes(searchLower) ||
        workflow.description?.toLowerCase().includes(searchLower) ||
        workflow.tags.some((tag) => tag.toLowerCase().includes(searchLower));

      if (!matchesSearch) return false;
    }

    // Tag filter
    if (filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some((tag) =>
        workflow.tags.includes(tag)
      );
      if (!hasMatchingTag) return false;
    }

    // Status filter
    if (filters.status !== 'all') {
      if (workflow.status !== filters.status) return false;
    }

    return true;
  });
};

/**
 * 정렬된 워크플로우 목록을 반환하는 셀렉터
 * @param filteredWorkflows 필터링된 워크플로우 목록
 * @param sortBy 정렬 옵션
 * @returns 정렬된 워크플로우 목록
 */
export const selectSortedWorkflows = (
  filteredWorkflows: Workflow[],
  sortBy: SortOption
): Workflow[] => {
  const sorted = [...filteredWorkflows];

  switch (sortBy) {
    case 'recent':
      return sorted.sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
      );
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'status':
      return sorted.sort((a, b) => a.status.localeCompare(b.status));
    default:
      return sorted;
  }
};

/**
 * 필터링 및 정렬이 모두 적용된 워크플로우 목록을 반환하는 복합 셀렉터
 * @param workflows 전체 워크플로우 목록
 * @param filters 필터 조건
 * @param sortBy 정렬 옵션
 * @returns 필터링 및 정렬된 워크플로우 목록
 */
export const selectFilteredAndSortedWorkflows = (
  workflows: Workflow[],
  filters: WorkflowFilters,
  sortBy: SortOption
): Workflow[] => {
  const filtered = selectFilteredWorkflows(workflows, filters);
  return selectSortedWorkflows(filtered, sortBy);
};

/**
 * 워크플로우 통계를 계산하는 셀렉터
 * @param workflows 워크플로우 목록
 * @returns 통계 객체
 */
export const selectWorkflowStats = (workflows: Workflow[]) => {
  return {
    total: workflows.length,
    running: workflows.filter((w) => w.status === 'running').length,
    stopped: workflows.filter((w) => w.status === 'stopped').length,
    error: workflows.filter((w) => w.status === 'error').length,
    pending: workflows.filter((w) => w.status === 'pending').length,
  };
};

/**
 * 사용 가능한 모든 태그 목록을 반환하는 셀렉터
 * @param workflows 워크플로우 목록
 * @returns 중복 제거된 태그 목록
 */
export const selectAvailableTags = (workflows: Workflow[]): string[] => {
  const allTags = workflows.flatMap((w) => w.tags);
  return Array.from(new Set(allTags)).sort();
};

/**
 * 특정 ID의 워크플로우를 찾는 셀렉터
 * @param workflows 워크플로우 목록
 * @param id 워크플로우 ID
 * @returns 워크플로우 또는 undefined
 */
export const selectWorkflowById = (
  workflows: Workflow[],
  id: string
): Workflow | undefined => {
  return workflows.find((w) => w.id === id);
};

/**
 * 배포된 워크플로우 목록을 반환하는 셀렉터
 * @param workflows 워크플로우 목록
 * @returns 배포된 워크플로우 목록
 */
export const selectDeployedWorkflows = (workflows: Workflow[]): Workflow[] => {
  return workflows.filter((w) => w.deploymentState === 'published');
};

/**
 * 마켓플레이스에 게시된 워크플로우 목록을 반환하는 셀렉터
 * @param workflows 워크플로우 목록
 * @returns 게시된 워크플로우 목록
 */
export const selectPublishedWorkflows = (workflows: Workflow[]): Workflow[] => {
  return workflows.filter((w) => w.marketplaceState === 'published');
};
