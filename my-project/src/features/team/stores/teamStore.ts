/**
 * Team Store
 * 팀 및 API Key 관리 상태
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { teamApi } from '../api/teamApi';
import type { Team, APIKey, InviteToken } from '../types/team.types';
import {
  mapTeamResponseToTeam,
  mapAPIKeyResponseToAPIKey,
  mapInviteTokenResponseToInviteToken,
} from '../types/team.types';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface TeamStore extends AsyncState<Team> {
  // State
  team: Team | null;
  apiKeys: APIKey[];
  selectedAPIKey: APIKey | null;
  inviteToken: InviteToken | null;

  // Actions - Team
  loadTeam: () => Promise<void>;
  joinTeam: (token: string) => Promise<void>;
  clearTeam: () => void;

  // Actions - API Keys
  loadAPIKeys: () => Promise<void>;
  createAPIKey: (name: string, description?: string) => Promise<APIKey>;
  deleteAPIKey: (keyId: number) => Promise<void>;
  selectAPIKey: (apiKey: APIKey | null) => void;

  // Actions - Invite
  createInviteToken: () => Promise<InviteToken>;
  clearInviteToken: () => void;

  // Internal
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
}

export const useTeamStore = create<TeamStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        data: null,
        team: null,
        apiKeys: [],
        selectedAPIKey: null,
        inviteToken: null,
        loading: false,
        error: null,

        // Load team information
        loadTeam: async () => {
          set({ loading: true, error: null });

          try {
            const response = await teamApi.getMyTeam();
            const team = mapTeamResponseToTeam(response);

            set({
              team,
              data: team,
              loading: false,
            });
          } catch (error) {
            set({
              error: error as Error,
              loading: false,
            });
            throw error;
          }
        },

        // Join team with invite token
        joinTeam: async (token: string) => {
          set({ loading: true, error: null });

          try {
            const response = await teamApi.joinTeam(token);
            const team = mapTeamResponseToTeam(response);

            set({
              team,
              data: team,
              loading: false,
            });
          } catch (error) {
            set({
              error: error as Error,
              loading: false,
            });
            throw error;
          }
        },

        // Clear team data
        clearTeam: () => {
          set({
            team: null,
            apiKeys: [],
            selectedAPIKey: null,
            inviteToken: null,
            data: null,
            error: null,
          });
        },

        // Load API keys
        loadAPIKeys: async () => {
          const { team } = get();
          if (!team) {
            throw new Error('No team loaded');
          }

          set({ loading: true, error: null });

          try {
            const response = await teamApi.listAPIKeys(team.id);
            const apiKeys = response.map(mapAPIKeyResponseToAPIKey);

            set({
              apiKeys,
              loading: false,
            });
          } catch (error) {
            set({
              error: error as Error,
              loading: false,
            });
            throw error;
          }
        },

        // Create API key
        createAPIKey: async (name: string, description?: string) => {
          const { team } = get();
          if (!team) {
            throw new Error('No team loaded');
          }

          set({ loading: true, error: null });

          try {
            const response = await teamApi.createAPIKey(team.id, {
              name,
              description,
            });
            const newAPIKey = mapAPIKeyResponseToAPIKey(response);

            set((state) => ({
              apiKeys: [newAPIKey, ...state.apiKeys],
              loading: false,
            }));

            return newAPIKey;
          } catch (error) {
            set({
              error: error as Error,
              loading: false,
            });
            throw error;
          }
        },

        // Delete API key
        deleteAPIKey: async (keyId: number) => {
          const { team } = get();
          if (!team) {
            throw new Error('No team loaded');
          }

          set({ loading: true, error: null });

          try {
            await teamApi.deleteAPIKey(team.id, keyId);

            set((state) => ({
              apiKeys: state.apiKeys.filter((key) => key.id !== keyId),
              selectedAPIKey:
                state.selectedAPIKey?.id === keyId
                  ? null
                  : state.selectedAPIKey,
              loading: false,
            }));
          } catch (error) {
            set({
              error: error as Error,
              loading: false,
            });
            throw error;
          }
        },

        // Select API key
        selectAPIKey: (apiKey: APIKey | null) => {
          set({ selectedAPIKey: apiKey });
        },

        // Create invite token
        createInviteToken: async () => {
          const { team } = get();
          if (!team) {
            throw new Error('No team loaded');
          }

          set({ loading: true, error: null });

          try {
            const response = await teamApi.createInviteToken(team.id);
            const inviteToken = mapInviteTokenResponseToInviteToken(response);

            set({
              inviteToken,
              loading: false,
            });

            return inviteToken;
          } catch (error) {
            set({
              error: error as Error,
              loading: false,
            });
            throw error;
          }
        },

        // Clear invite token
        clearInviteToken: () => {
          set({ inviteToken: null });
        },

        // Internal setters
        setLoading: (loading: boolean) => set({ loading }),
        setError: (error: Error | null) => set({ error }),
      }),
      {
        name: 'team-storage',
        partialize: (state) => ({
          team: state.team,
          apiKeys: state.apiKeys,
        }),
      }
    ),
    {
      name: 'TeamStore',
    }
  )
);

// Selectors
export const selectTeam = (state: TeamStore) => state.team;
export const selectAPIKeys = (state: TeamStore) => state.apiKeys;
export const selectSelectedAPIKey = (state: TeamStore) => state.selectedAPIKey;
export const selectInviteToken = (state: TeamStore) => state.inviteToken;
export const selectIsLoading = (state: TeamStore) => state.loading;
export const selectError = (state: TeamStore) => state.error;

// Utility selectors
export const selectHasTeam = (state: TeamStore) => state.team !== null;
export const selectActiveAPIKeys = (state: TeamStore) =>
  state.apiKeys.filter((key) => key.isActive);
