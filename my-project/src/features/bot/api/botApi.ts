/**
 * Bot API
 * Bot 관련 모든 API 호출 정의
 */

import { apiClient } from '@/shared/api/client';
import { API_ENDPOINTS } from '@/shared/constants/apiEndpoints';
import { DEFAULT_WORKFLOW } from '@/shared/constants/defaultWorkflow';
import {
  transformFromBackend,
  transformToBackend,
} from '@/shared/utils/workflowTransform';
import type { Bot, CreateBotDto, UpdateBotDto } from '../types/bot.types';
import type {
  BotDetailApiResponse,
  BotListItemApiResponse,
  BotListResponseV2,
  CreateBotRequest,
  StatusToggleApiResponse,
} from '@/shared/types/api.types';

/**
 * API 응답 → 프론트엔드 Bot 타입 변환
 * (snake_case → camelCase)
 */
type BotDetailPayload = BotDetailApiResponse['data'];

function transformBotDetailResponse(apiResponse: BotDetailPayload): Bot {
  const fallbackDate = new Date().toISOString();
  const createdAt = apiResponse.createdAt || fallbackDate;
  const updatedAt = apiResponse.updatedAt || apiResponse.createdAt || fallbackDate;

  return {
    id: apiResponse.id,
    name: apiResponse.name,
    description: apiResponse.description || undefined,
    avatar: undefined,
    status: apiResponse.isActive ? 'active' : 'inactive',
    messagesCount: 0,
    errorsCount: 0,
    category: ((apiResponse as any).category as any) || 'workflow',
    tags: (apiResponse as any).tags || [],
    createdBy: (apiResponse as any).createdBy || 0,
    createdAt,
    updatedAt,
    workflow: apiResponse.workflow
      ? transformFromBackend(apiResponse.workflow)
      : null,
  };
}

function transformBotListItem(item: BotListItemApiResponse): Bot {
  return {
    id: item.id,
    name: item.name,
    description: item.description || undefined,
    avatar: undefined,
    status: item.isActive ? 'active' : 'inactive',
    messagesCount: 0,
    errorsCount: 0,
    category: (item.category as any) || 'workflow',
    tags: item.tags || [],
    createdBy: item.createdBy || 0,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt || item.createdAt,
    workflow: null,
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
    category: dto.category || 'workflow',
    tags: dto.tags || [],
    createdBy: 0,
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
  getAll: async (params?: {
    search?: string;
    category?: string;
    tags?: string[];
    onlyMine?: boolean;
  }): Promise<Bot[]> => {
    const queryParams = new URLSearchParams();

    if (params?.search) {
      queryParams.append('search', params.search);
    }
    if (params?.category) {
      queryParams.append('category', params.category);
    }
    if (params?.tags && params.tags.length > 0) {
      params.tags.forEach(tag => {
        queryParams.append('tags', tag);
      });
    }
    if (params?.onlyMine !== undefined) {
      queryParams.append('onlyMine', String(params.onlyMine));
    }

    const url = `${API_ENDPOINTS.BOTS.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const { data } = await apiClient.get<BotListResponseV2>(url);
    return data.data.map(transformBotListItem);
  },

  /**
   * 사용 가능한 태그 목록 조회
   */
  getTags: async (): Promise<string[]> => {
    const { data } = await apiClient.get<string[]>(API_ENDPOINTS.BOTS.TAGS);
    return data;
  },

  /**
   * 특정 봇 조회
   */
  getById: async (id: string): Promise<Bot> => {
    const { data } = await apiClient.get<BotDetailApiResponse>(
      API_ENDPOINTS.BOTS.BY_ID(id)
    );

    return transformBotDetailResponse(data.data);
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
        goal: dto.description || dto.goal as any,
        personality: dto.personality,
        knowledge: dto.knowledge,
        category: dto.category,
        tags: dto.tags || [],
      };

      // workflow가 제공되면 백엔드 스키마로 변환하여 추가
      if (dto.workflow) {
        request.workflow = transformToBackend(
          dto.workflow.nodes,
          dto.workflow.edges
        );
      } else {
        // workflow가 없으면 기본 구조 사용
        request.workflow = transformToBackend(
          DEFAULT_WORKFLOW.nodes,
          DEFAULT_WORKFLOW.edges
        );
      }

      const response = await apiClient.post<BotDetailApiResponse>(
        API_ENDPOINTS.BOTS.CREATE,
        request
      );

      return transformBotDetailResponse(response.data.data);
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

        // Mock 봇에도 기본 workflow 추가
        mockBot.workflow = dto.workflow || DEFAULT_WORKFLOW;

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
    const payload: Record<string, unknown> = { ...dto };

    if (dto.workflow) {
      payload.workflow = transformToBackend(
        dto.workflow.nodes,
        dto.workflow.edges
      );
    }

    const { data } = await apiClient.patch<BotDetailApiResponse>(
      API_ENDPOINTS.BOTS.UPDATE(id),
      payload
    );
    return transformBotDetailResponse(data.data);
  },

  /**
   * 봇 삭제
   * Mock 봇(로컬에만 존재)인 경우 404가 발생할 수 있으므로 404는 무시
   */
  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(API_ENDPOINTS.BOTS.DELETE(id));
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn(`Bot ${id} not found on server (possibly a mock bot), ignoring 404`);
        return;
      }
      throw error;
    }
  },

  /**
   * 봇 상태 변경
   */
  updateStatus: async (
    id: string,
    status: 'draft' | 'active' | 'inactive' | 'error'
  ): Promise<Bot> => {
    const isActive = status === 'active';
    await apiClient.patch<StatusToggleApiResponse>(
      API_ENDPOINTS.BOTS.STATUS(id),
      {
        isActive,
      }
    );

    return botApi.getById(id);
  },

  enableWorkflowV2: async (id: string): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.BOTS.ENABLE_WORKFLOW_V2(id), {});
  },
} as const;
