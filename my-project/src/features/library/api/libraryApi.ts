import { apiClient } from '@/shared/api/client';
import type {
  LibraryAgentsResponse,
  LibraryAgentDetail,
  LibraryFilterParams,
  WorkflowVersion,
} from '@/features/workflow/types/workflow.types';

/**
 * 라이브러리 에이전트 목록 조회
 */
export const getLibraryAgents = async (
  filters: LibraryFilterParams
): Promise<LibraryAgentsResponse> => {
  const params = new URLSearchParams();

  if (filters.category) params.append('category', filters.category);
  if (filters.visibility) params.append('visibility', filters.visibility);
  if (filters.search) params.append('search', filters.search);
  if (filters.tags) {
    filters.tags.forEach(tag => params.append('tags', tag));
  }
  params.append('page', String(filters.page || 1));
  params.append('page_size', String(filters.page_size || 20));

  const { data } = await apiClient.get(`/api/v1/library/agents?${params.toString()}`);
  return data;
};

/**
 * 라이브러리 에이전트 상세 조회
 */
export const getLibraryAgentDetail = async (
  versionId: string  // UUID 문자열
): Promise<LibraryAgentDetail> => {
  const { data } = await apiClient.get(`/api/v1/library/agents/${versionId}`);
  return data;
};

/**
 * 라이브러리 에이전트 가져오기
 */
export const importLibraryAgent = async (
  targetBotId: string,
  sourceVersionId: string  // UUID 문자열
): Promise<WorkflowVersion> => {
  const { data } = await apiClient.post(`/api/v1/bots/${targetBotId}/import`, {
    source_version_id: sourceVersionId
  });
  return data;
};
