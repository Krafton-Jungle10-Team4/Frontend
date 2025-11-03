/**
 * Bot API
 * Bot 관련 모든 API 호출 정의
 */

import { apiClient } from '@/shared/api/client';
import { API_ENDPOINTS } from '@/shared/constants/apiEndpoints';
import type { Bot, CreateBotDto, UpdateBotDto } from '../types/bot.types';

/**
 * Mock 봇 생성 헬퍼 함수 (백엔드 미구현 시 사용)
 */
function createMockBot(dto: CreateBotDto): Bot {
  const now = new Date().toISOString();
  return {
    id: `bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: dto.name,
    description: dto.description || dto.goal || '',
    avatar: undefined,
    status: 'active',
    messagesCount: 0,
    errorsCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Bot API 함수들
 */
export const botApi = {
  /**
   * 모든 봇 조회
   */
  getAll: async (params?: { search?: string }): Promise<Bot[]> => {
    const { data } = await apiClient.get<Bot[]>(API_ENDPOINTS.BOTS.LIST, {
      params,
    });
    return data;
  },

  /**
   * 특정 봇 조회
   */
  getById: async (id: string): Promise<Bot> => {
    const { data } = await apiClient.get<Bot>(API_ENDPOINTS.BOTS.BY_ID(id));
    return data;
  },

  /**
   * 봇 생성
   * 백엔드가 없을 경우 Mock 데이터 반환
   */
  create: async (dto: CreateBotDto): Promise<Bot> => {
    try {
      const { data } = await apiClient.post<Bot>(
        API_ENDPOINTS.BOTS.CREATE,
        dto
      );
      return data;
    } catch (error: any) {
      // 네트워크 연결 실패 시 (백엔드 미구현) Mock 데이터 생성
      if (
        error.message?.includes('네트워크 연결') ||
        error.code === 'ERR_NETWORK'
      ) {
        console.warn(
          '⚠️ Backend not available, using mock data for bot creation'
        );

        // Mock 지연 시간 추가 (실제 API 호출처럼 보이게)
        await new Promise((resolve) => setTimeout(resolve, 500));

        const mockBot = createMockBot(dto);
        return mockBot;
      }

      // 다른 에러는 그대로 throw
      throw error;
    }
  },

  /**
   * 봇 업데이트
   */
  update: async (id: string, dto: UpdateBotDto): Promise<Bot> => {
    const { data } = await apiClient.patch<Bot>(
      API_ENDPOINTS.BOTS.UPDATE(id),
      dto
    );
    return data;
  },

  /**
   * 봇 삭제
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.BOTS.DELETE(id));
  },

  /**
   * 봇 상태 변경
   */
  updateStatus: async (
    id: string,
    status: 'active' | 'inactive' | 'error'
  ): Promise<Bot> => {
    const { data } = await apiClient.patch<Bot>(
      API_ENDPOINTS.BOTS.UPDATE(id),
      {
        status,
      }
    );
    return data;
  },
} as const;
