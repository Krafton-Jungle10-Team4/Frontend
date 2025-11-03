/**
 * Bot Store
 * Bot 관련 상태 관리
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Bot, AsyncState } from '@/types';

interface BotStore extends AsyncState<Bot[]> {
  // State
  bots: Bot[];
  selectedBotId: string | null;

  // Actions
  addBot: (bot: Bot) => void;
  updateBot: (id: string, updates: Partial<Bot>) => void;
  deleteBot: (id: string) => void;
  setBots: (bots: Bot[]) => void;
  selectBot: (id: string | null) => void;
  getBotById: (id: string) => Bot | undefined;
  clearBots: () => void;

  // Internal
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
}

export const useBotStore = create<BotStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        data: null,
        bots: [],
        selectedBotId: null,
        loading: false,
        error: null,

        // Add bot
        addBot: (bot: Bot) =>
          set((state) => ({
            bots: [bot, ...state.bots],
            data: [bot, ...state.bots],
          })),

        // Update bot
        updateBot: (id: string, updates: Partial<Bot>) =>
          set((state) => ({
            bots: state.bots.map((bot) =>
              bot.id === id ? { ...bot, ...updates } : bot
            ),
          })),

        // Delete bot
        deleteBot: (id: string) =>
          set((state) => ({
            bots: state.bots.filter((bot) => bot.id !== id),
            selectedBotId: state.selectedBotId === id ? null : state.selectedBotId,
          })),

        // Set bots
        setBots: (bots: Bot[]) =>
          set({ bots, data: bots }),

        // Select bot
        selectBot: (id: string | null) =>
          set({ selectedBotId: id }),

        // Get bot by ID
        getBotById: (id: string) =>
          get().bots.find((bot) => bot.id === id),

        // Clear all bots
        clearBots: () =>
          set({
            bots: [],
            selectedBotId: null,
            data: null,
            error: null,
          }),

        // Internal setters
        setLoading: (loading: boolean) => set({ loading }),
        setError: (error: Error | null) => set({ error }),
      }),
      {
        name: 'bot-storage',
        partialize: (state) => ({
          bots: state.bots,
        }),
      }
    ),
    {
      name: 'BotStore',
    }
  )
);

// Selectors
export const selectBots = (state: BotStore) => state.bots;
export const selectSelectedBotId = (state: BotStore) => state.selectedBotId;
export const selectSelectedBot = (state: BotStore) =>
  state.selectedBotId ? state.bots.find((b) => b.id === state.selectedBotId) : null;
export const selectBotsCount = (state: BotStore) => state.bots.length;
export const selectActiveBots = (state: BotStore) =>
  state.bots.filter((b) => b.status === 'active');
export const selectIsLoading = (state: BotStore) => state.loading;
export const selectError = (state: BotStore) => state.error;