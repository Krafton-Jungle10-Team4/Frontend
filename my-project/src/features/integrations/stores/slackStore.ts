/**
 * Slack Integration Store
 * Slack 연동 상태 관리
 */
import { create } from 'zustand';
import { SlackIntegration, SlackChannel } from '../types';
import { slackClient } from '../api/slackClient';

interface SlackStore {
  integrations: SlackIntegration[];
  currentIntegration: SlackIntegration | null;
  channels: SlackChannel[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchIntegrations: () => Promise<void>;
  fetchBotIntegration: (botId: string) => Promise<void>;
  deleteIntegration: (integrationId: number) => Promise<void>;
  fetchChannels: (integrationId: number) => Promise<void>;
  connectSlack: (botId?: string) => Promise<void>;
  reset: () => void;
}

export const useSlackStore = create<SlackStore>((set, get) => ({
  integrations: [],
  currentIntegration: null,
  channels: [],
  isLoading: false,
  error: null,

  fetchIntegrations: async () => {
    set({ isLoading: true, error: null });
    try {
      const integrations = await slackClient.listIntegrations();
      set({ integrations, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to fetch integrations',
        isLoading: false,
      });
    }
  },

  fetchBotIntegration: async (botId: string) => {
    set({ isLoading: true, error: null });
    try {
      const integration = await slackClient.getBotIntegration(botId);
      set({ currentIntegration: integration, isLoading: false });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.detail || 'Failed to fetch bot integration',
        isLoading: false,
      });
    }
  },

  deleteIntegration: async (integrationId: number) => {
    set({ isLoading: true, error: null });
    try {
      await slackClient.deleteIntegration(integrationId);
      const integrations = get().integrations.filter(
        (i) => i.id !== integrationId
      );
      set({ integrations, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to delete integration',
        isLoading: false,
      });
    }
  },

  fetchChannels: async (integrationId: number) => {
    set({ isLoading: true, error: null });
    try {
      const channels = await slackClient.getChannels(integrationId);
      set({ channels, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to fetch channels',
        isLoading: false,
      });
    }
  },

  connectSlack: async (botId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const { oauth_url } = await slackClient.connect(botId);
      // OAuth URL로 리다이렉트
      window.location.href = oauth_url;
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to connect Slack',
        isLoading: false,
      });
    }
  },

  reset: () => {
    set({
      integrations: [],
      currentIntegration: null,
      channels: [],
      isLoading: false,
      error: null,
    });
  },
}));

