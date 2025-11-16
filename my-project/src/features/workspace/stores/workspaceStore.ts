/**
 * Workspace Store
 * 워크스페이스 탭 상태 및 필터 관리
 */

import { create } from 'zustand';

export type WorkspaceTab = 'explore' | 'studio' | 'knowledge' | 'tools';

interface ExploreFilters {
  category: string;
  searchQuery: string;
}

interface StudioFilters {
  type: string; // 모두, 워크플로우, 챗봇 등
  tags: string[];
  searchQuery: string;
  onlyMine: boolean;
}

interface KnowledgeFilters {
  tags: string[];
  searchQuery: string;
}

interface WorkspaceState {
  // 현재 활성 탭
  activeTab: WorkspaceTab;

  // 필터 상태
  exploreFilters: ExploreFilters;
  studioFilters: StudioFilters;
  knowledgeFilters: KnowledgeFilters;

  // 액션
  setActiveTab: (tab: WorkspaceTab) => void;
  setExploreFilters: (filters: Partial<ExploreFilters>) => void;
  setStudioFilters: (filters: Partial<StudioFilters>) => void;
  setKnowledgeFilters: (filters: Partial<KnowledgeFilters>) => void;
  resetFilters: () => void;
}

const initialExploreFilters: ExploreFilters = {
  category: 'all',
  searchQuery: '',
};

const initialStudioFilters: StudioFilters = {
  type: 'all',
  tags: [],
  searchQuery: '',
  onlyMine: true,
};

const initialKnowledgeFilters: KnowledgeFilters = {
  tags: [],
  searchQuery: '',
};

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  // 초기 상태
  activeTab: 'studio',
  exploreFilters: initialExploreFilters,
  studioFilters: initialStudioFilters,
  knowledgeFilters: initialKnowledgeFilters,

  // 액션
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

  resetFilters: () =>
    set({
      exploreFilters: initialExploreFilters,
      studioFilters: initialStudioFilters,
      knowledgeFilters: initialKnowledgeFilters,
    }),
}));
