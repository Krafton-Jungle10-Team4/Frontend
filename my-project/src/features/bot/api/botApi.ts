/**
 * Bot API
 * Bot 관련 모든 API 호출 정의
 */

import { apiClient } from '@/shared/api/client';
import type { Bot, CreateBotDto, UpdateBotDto } from '../types/bot.types';

/**
 * Bot API 엔드포인트
 */
const ENDPOINTS = {
  BOTS: '/bots',
  BOT_BY_ID: (id: string) => `/bots/${id}`,
} as const;

/**
 * Bot API 함수들
 */
export const botApi = {
  /**
   * 모든 봇 조회
   */
  getAll: async (params?: { search?: string }): Promise<Bot[]> => {
    const { data } = await apiClient.get<Bot[]>(ENDPOINTS.BOTS, { params });
    return data;
  },

  /**
   * 특정 봇 조회
   */
  getById: async (id: string): Promise<Bot> => {
    const { data } = await apiClient.get<Bot>(ENDPOINTS.BOT_BY_ID(id));
    return data;
  },

  /**
   * 봇 생성
   */
  create: async (dto: CreateBotDto): Promise<Bot> => {
    const { data } = await apiClient.post<Bot>(ENDPOINTS.BOTS, dto);
    return data;
  },

  /**
   * 봇 업데이트
   */
  update: async (id: string, dto: UpdateBotDto): Promise<Bot> => {
    const { data } = await apiClient.patch<Bot>(ENDPOINTS.BOT_BY_ID(id), dto);
    return data;
  },

  /**
   * 봇 삭제
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.BOT_BY_ID(id));
  },

  /**
   * 봇 상태 변경
   */
  updateStatus: async (
    id: string,
    status: 'active' | 'inactive' | 'error'
  ): Promise<Bot> => {
    const { data } = await apiClient.patch<Bot>(ENDPOINTS.BOT_BY_ID(id), {
      status,
    });
    return data;
  },
} as const;
