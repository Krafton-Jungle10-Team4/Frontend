import { create } from 'zustand';
import { toast } from 'sonner';
import type {
  LibraryAgentVersion,
  LibraryAgentDetail,
  LibraryFilterParams,
  LibraryAgentsResponse,
} from '@/features/workflow/types/workflow.types';
import {
  getLibraryAgents,
  getLibraryAgentDetail,
  importLibraryAgent,
} from '../api/libraryApi';

interface LibraryState {
  // State
  agents: LibraryAgentVersion[];
  selectedAgent: LibraryAgentDetail | null;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  filters: LibraryFilterParams;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAgents: (filters?: LibraryFilterParams) => Promise<void>;
  fetchAgentDetail: (versionId: string) => Promise<void>;
  importAgent: (versionId: string, targetBotId: string) => Promise<boolean>;
  setFilters: (filters: Partial<LibraryFilterParams>) => void;
  resetFilters: () => void;
  clearError: () => void;
}

const defaultFilters: LibraryFilterParams = {
  page: 1,
  page_size: 20,
};

export const useLibraryStore = create<LibraryState>((set, get) => ({
  // Initial State
  agents: [],
  selectedAgent: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 20,
  totalPages: 0,
  filters: defaultFilters,
  isLoading: false,
  error: null,

  // Fetch agents with filters
  fetchAgents: async (filters?: LibraryFilterParams) => {
    set({ isLoading: true, error: null });

    try {
      const currentFilters = { ...get().filters, ...filters };
      const response: LibraryAgentsResponse = await getLibraryAgents(currentFilters);

      set({
        agents: response.agents,
        totalCount: response.total,
        currentPage: response.page,
        pageSize: response.page_size,
        totalPages: response.total_pages,
        filters: currentFilters,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('Failed to fetch library agents:', error);
      set({
        error: error.response?.data?.detail || '라이브러리 에이전트 조회 실패',
        isLoading: false,
      });
      toast.error('라이브러리 에이전트를 불러올 수 없습니다.');
    }
  },

  // Fetch agent detail
  fetchAgentDetail: async (versionId: string) => {
    set({ isLoading: true, error: null });

    try {
      const agent = await getLibraryAgentDetail(versionId);
      set({ selectedAgent: agent, isLoading: false });
    } catch (error: any) {
      console.error('Failed to fetch agent detail:', error);
      set({
        error: error.response?.data?.detail || '에이전트 상세 조회 실패',
        isLoading: false,
      });
      toast.error('에이전트 상세 정보를 불러올 수 없습니다.');
    }
  },

  // Import agent to bot
  importAgent: async (sourceVersionId: string, targetBotId: string): Promise<boolean> => {
    set({ isLoading: true, error: null });

    try {
      await importLibraryAgent(targetBotId, sourceVersionId);
      set({ isLoading: false });
      toast.success('에이전트를 성공적으로 가져왔습니다.');
      return true;
    } catch (error: any) {
      console.error('Failed to import agent:', error);
      set({
        error: error.response?.data?.detail || '에이전트 가져오기 실패',
        isLoading: false,
      });
      toast.error('에이전트를 가져올 수 없습니다.');
      return false;
    }
  },

  // Set filters
  setFilters: (newFilters: Partial<LibraryFilterParams>) => {
    const currentFilters = get().filters;
    set({ filters: { ...currentFilters, ...newFilters } });
  },

  // Reset filters
  resetFilters: () => {
    set({ filters: defaultFilters });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
