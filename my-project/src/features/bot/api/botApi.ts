/**
 * Bot API
 * Bot 관련 모든 API 호출 정의
 */

import { apiClient } from '@/shared/api/client';
import { API_ENDPOINTS } from '@/shared/constants/apiEndpoints';
import type { Bot, CreateBotDto, UpdateBotDto } from '../types/bot.types';
import type { BotResponse, CreateBotRequest } from '@/shared/types/api.types';

/**
 * API 응답 → 프론트엔드 Bot 타입 변환
 * (snake_case → camelCase)
 */
function transformBotResponse(apiResponse: BotResponse): Bot {
  // createdAt이 null이면 updatedAt 사용, 둘 다 없으면 현재 시간
  const fallbackDate = new Date().toISOString();
  const createdAt = apiResponse.created_at || apiResponse.updated_at || fallbackDate;
  const updatedAt = apiResponse.updated_at || apiResponse.created_at || fallbackDate;

  return {
    id: apiResponse.id,
    name: apiResponse.name,
    description: apiResponse.description || undefined,
    avatar: apiResponse.avatar || undefined,
    status: apiResponse.status as Bot['status'],
    messagesCount: apiResponse.messages_count,
    errorsCount: apiResponse.errors_count,
    createdAt,
    updatedAt,
  };
}

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
   * API 명세서 기준 요청/응답 처리
   */
  create: async (dto: CreateBotDto): Promise<Bot> => {
    try {
      // CreateBotDto → CreateBotRequest 변환
      const request: CreateBotRequest = {
        name: dto.name,
        goal: dto.goal as any, // BotGoal enum으로 변환됨
        personality: dto.personality || '',
        knowledge: dto.knowledge || [],
      };

      // 백엔드 응답 구조: { data: BotResponse }
      const response = await apiClient.post<{ data: BotResponse }>(
        API_ENDPOINTS.BOTS.CREATE,
        request
      );

      // 🔧 수정: response.data.data에서 실제 BotResponse 추출
      const botData = response.data.data;

      // BotResponse → Bot 변환 (snake_case → camelCase)
      return transformBotResponse(botData);
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
    const { data } = await apiClient.patch<Bot>(API_ENDPOINTS.BOTS.UPDATE(id), {
      status,
    });
    return data;
  },
} as const;
