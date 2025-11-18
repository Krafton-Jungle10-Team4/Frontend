import { create } from 'zustand';

interface WorkspaceState {
  // 현재 활성 탭
  activeTab: 'explore' | 'studio' | 'knowledge' | 'library';

  // 필터 상태
  exploreFilters: {
    category: string;
    searchQuery: string;
  };

  studioFilters: {
    type: string; // 모두, 워크플로우, 챗봇 등
    tags: string[];
    searchQuery: string;
  };

  knowledgeFilters: {
    tags: string[];
    searchQuery: string;
  };

  // 액션
  setActiveTab: (tab: WorkspaceState['activeTab']) => void;
  setExploreFilters: (
    filters: Partial<WorkspaceState['exploreFilters']>
  ) => void;
  setStudioFilters: (
    filters: Partial<WorkspaceState['studioFilters']>
  ) => void;
  setKnowledgeFilters: (
    filters: Partial<WorkspaceState['knowledgeFilters']>
  ) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeTab: 'studio',

  exploreFilters: {
    category: 'all',
    searchQuery: '',
  },

  studioFilters: {
    type: 'all',
    tags: [],
    searchQuery: '',
  },

  knowledgeFilters: {
    tags: [],
    searchQuery: '',
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  setExploreFilters: (filters) =>
    set((state) => ({
      exploreFilters: { ...state.exploreFilters, ...filters },
    })),

  setStudioFilters: (filters) =>
    set((state) => ({
      studioFilters: { ...state.studioFilters, ...filters },
    })),

  setKnowledgeFilters: (filters) =>
    set((state) => ({
      knowledgeFilters: { ...state.knowledgeFilters, ...filters },
    })),
}));
