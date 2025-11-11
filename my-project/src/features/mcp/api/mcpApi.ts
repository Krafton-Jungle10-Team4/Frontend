/**
 * MCP API 클라이언트
 */
import { apiClient } from '@/shared/api/client';
import { API_ENDPOINTS } from '@/shared/constants/apiEndpoints';
import type {
  MCPProvider,
  MCPKeyCreate,
  MCPKeyResponse,
  MCPKeyListResponse,
} from '../types/mcp.types';

export const mcpApi = {
  /**
   * MCP 제공자 목록 조회
   */
  getProviders: async (): Promise<MCPProvider[]> => {
    const { data } = await apiClient.get(API_ENDPOINTS.MCP.PROVIDERS);
    return data;
  },

  /**
   * 특정 MCP 제공자 조회
   */
  getProvider: async (providerId: string): Promise<MCPProvider> => {
    const { data } = await apiClient.get(
      API_ENDPOINTS.MCP.PROVIDER_DETAIL(providerId)
    );
    return data;
  },

  /**
   * MCP 키 생성
   */
  createKey: async (keyData: MCPKeyCreate): Promise<MCPKeyResponse> => {
    const { data } = await apiClient.post(API_ENDPOINTS.MCP.KEYS, keyData);
    return data;
  },

  /**
   * MCP 키 목록 조회
   */
  listKeys: async (params?: {
    provider_id?: string;
    bot_id?: string;
    is_active?: boolean;
  }): Promise<MCPKeyListResponse> => {
    const { data } = await apiClient.get(API_ENDPOINTS.MCP.KEYS, {
      params,
    });
    return data;
  },

  /**
   * 특정 MCP 키 조회
   */
  getKey: async (keyId: string): Promise<MCPKeyResponse> => {
    const { data } = await apiClient.get(API_ENDPOINTS.MCP.KEY_DETAIL(keyId));
    return data;
  },

  /**
   * MCP 키 삭제
   */
  deleteKey: async (keyId: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.MCP.KEY_DETAIL(keyId));
  },
};
