/**
 * UI Store
 * UI 상태 관리 (sidebar, search, viewMode, language)
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Language, ViewMode } from '@/shared/types';

interface UIStore {
  // State
  isSidebarOpen: boolean;
  searchQuery: string;
  viewMode: ViewMode;
  language: Language;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setLanguage: (lang: Language) => void;
  clearSearch: () => void;
}

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        isSidebarOpen: true,
        searchQuery: '',
        viewMode: 'grid',
        language: 'en',

        // Toggle sidebar
        toggleSidebar: () =>
          set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

        // Set sidebar open state
        setSidebarOpen: (open: boolean) => set({ isSidebarOpen: open }),

        // Set search query
        setSearchQuery: (query: string) => set({ searchQuery: query }),

        // Set view mode
        setViewMode: (mode: ViewMode) => set({ viewMode: mode }),

        // Set language
        setLanguage: (lang: Language) => set({ language: lang }),

        // Clear search
        clearSearch: () => set({ searchQuery: '' }),
      }),
      {
        name: 'ui-storage',
        partialize: (state) => ({
          viewMode: state.viewMode,
          language: state.language,
          isSidebarOpen: state.isSidebarOpen,
        }),
      }
    ),
    {
      name: 'UIStore',
    }
  )
);

// Selectors
export const selectIsSidebarOpen = (state: UIStore) => state.isSidebarOpen;
export const selectSearchQuery = (state: UIStore) => state.searchQuery;
export const selectViewMode = (state: UIStore) => state.viewMode;
export const selectLanguage = (state: UIStore) => state.language;
