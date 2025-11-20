import { create } from 'zustand';
import {
  apiKeyClient,
  APIKey,
  CreateAPIKeyRequest,
} from '../api/apiKeyClient.ts';

interface ApiKeyStore {
  apiKeys: APIKey[];
  isLoading: boolean;
  error: string | null;
  selectedKey: APIKey | null;

  // Actions
  fetchApiKeys: (botId: string) => Promise<void>;
  createApiKey: (
    botId: string,
    data: CreateAPIKeyRequest
  ) => Promise<string>; // 평문 키 반환
  updateApiKey: (
    botId: string,
    keyId: string,
    data: Partial<CreateAPIKeyRequest>
  ) => Promise<void>;
  deleteApiKey: (botId: string, keyId: string) => Promise<void>;
  setSelectedKey: (key: APIKey | null) => void;
  reset: () => void;
}

const initialState = {
  apiKeys: [],
  isLoading: false,
  error: null,
  selectedKey: null,
};

export const useApiKeyStore = create<ApiKeyStore>((set, get) => ({
  ...initialState,

  fetchApiKeys: async (botId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiKeyClient.list(botId);
      set({ apiKeys: response.data.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail?.message || error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  createApiKey: async (botId, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiKeyClient.create(botId, data);

      // ⚠️ 평문 키는 생성 시에만 제공되므로 즉시 반환
      const plainKey = response.data.key;

      // Store에 추가 (평문 키 제외, usage_summary 기본값 추가)
      const newKey: APIKey = {
        ...response.data,
        usage_summary: {
          requests_today: 0,
          requests_month: 0,
          last_used_at: undefined,
        },
      };

      set((state) => ({
        apiKeys: [newKey, ...state.apiKeys],
        isLoading: false,
      }));

      return plainKey; // 평문 키 반환
    } catch (error: any) {
      set({
        error: error.response?.data?.detail?.message || error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  updateApiKey: async (botId, keyId, data) => {
    set({ isLoading: true, error: null });
    try {
      await apiKeyClient.update(botId, keyId, data);

      // 목록 새로고침
      await get().fetchApiKeys(botId);
    } catch (error: any) {
      set({
        error: error.response?.data?.detail?.message || error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  deleteApiKey: async (botId, keyId) => {
    set({ isLoading: true, error: null });
    try {
      await apiKeyClient.delete(botId, keyId);

      // Store에서 제거
      set((state) => ({
        apiKeys: state.apiKeys.filter((k) => k.id !== keyId),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.detail?.message || error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  setSelectedKey: (key) => set({ selectedKey: key }),

  reset: () => set(initialState),
}));

