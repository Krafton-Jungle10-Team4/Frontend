import { create } from 'zustand';

interface WorkspaceState {
  // 현재 활성 탭
  activeTab: 'marketplace' | 'studio' | 'knowledge' | 'library';

  // 필터 상태
  marketplaceFilters: {
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
  setMarketplaceFilters: (
    filters: Partial<WorkspaceState['marketplaceFilters']>
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

  marketplaceFilters: {
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

  setMarketplaceFilters: (filters) =>
    set((state) => ({
      marketplaceFilters: { ...state.marketplaceFilters, ...filters },
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
