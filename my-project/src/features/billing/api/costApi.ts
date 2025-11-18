import { apiClient } from '@/shared/api/client';
import { API_ENDPOINTS } from '@/shared/constants/apiEndpoints';
import axios from 'axios';

interface BotUsageApiResponse {
  bot_id: string;
  total_requests: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_tokens: number;
  total_cost: number;
  period_start?: string | null;
  period_end?: string | null;
}

export interface BotUsageSummary {
  botId: string;
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCost: number;
  periodStart?: string | null;
  periodEnd?: string | null;
}

interface GetBotUsageParams {
  botId: string;
  startDate?: Date;
  endDate?: Date;
}

interface UserUsageApiResponse {
  user_id: number;
  total_requests: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_tokens: number;
  total_cost: number;
  period_start?: string | null;
  period_end?: string | null;
}

export interface UserUsageSummary {
  userId: number;
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCost: number;
  periodStart?: string | null;
  periodEnd?: string | null;
}

interface BotUsageBreakdownApiResponse {
  bot_id: string;
  bot_name?: string | null;
  request_count: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_tokens: number;
  total_cost: number;
}

export interface BotUsageBreakdown {
  botId: string;
  botName?: string | null;
  requestCount: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCost: number;
}

interface ModelUsageBreakdownApiResponse {
  provider: string;
  model_name: string;
  request_count: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost: number;
}

export interface ModelUsageBreakdown {
  provider: string;
  modelName: string;
  requestCount: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
}

interface DailyCostSummaryApiResponse {
  date: string;
  request_count: number;
  total_tokens: number;
  total_cost: number;
}

export interface DailyCostSummary {
  date: string;
  requestCount: number;
  totalTokens: number;
  totalCost: number;
}

interface GetUserUsageParams {
  startDate?: Date;
  endDate?: Date;
}

// FastAPI expects an ISO 8601 timestamp for datetime query params.
// Send the full string (including timezone) to avoid 422 validation errors.
const formatDateParam = (date?: Date) => (date ? date.toISOString() : undefined);

const createEmptyUsageSummary = (
  botId: string,
  startDate?: Date,
  endDate?: Date
): BotUsageSummary => ({
  botId,
  totalRequests: 0,
  totalInputTokens: 0,
  totalOutputTokens: 0,
  totalTokens: 0,
  totalCost: 0,
  periodStart: startDate?.toISOString() ?? null,
  periodEnd: endDate?.toISOString() ?? null,
});

const transformUsageResponse = (data: BotUsageApiResponse): BotUsageSummary => ({
  botId: data.bot_id,
  totalRequests: data.total_requests ?? 0,
  totalInputTokens: data.total_input_tokens ?? 0,
  totalOutputTokens: data.total_output_tokens ?? 0,
  totalTokens: data.total_tokens ?? 0,
  totalCost: data.total_cost ?? 0,
  periodStart: data.period_start,
  periodEnd: data.period_end,
});

const transformUserUsageResponse = (data: UserUsageApiResponse): UserUsageSummary => ({
  userId: data.user_id,
  totalRequests: data.total_requests ?? 0,
  totalInputTokens: data.total_input_tokens ?? 0,
  totalOutputTokens: data.total_output_tokens ?? 0,
  totalTokens: data.total_tokens ?? 0,
  totalCost: data.total_cost ?? 0,
  periodStart: data.period_start,
  periodEnd: data.period_end,
});

const transformBotUsageBreakdown = (data: BotUsageBreakdownApiResponse): BotUsageBreakdown => ({
  botId: data.bot_id,
  botName: data.bot_name,
  requestCount: data.request_count ?? 0,
  totalInputTokens: data.total_input_tokens ?? 0,
  totalOutputTokens: data.total_output_tokens ?? 0,
  totalTokens: data.total_tokens ?? 0,
  totalCost: data.total_cost ?? 0,
});

const transformModelUsageBreakdown = (data: ModelUsageBreakdownApiResponse): ModelUsageBreakdown => ({
  provider: data.provider,
  modelName: data.model_name,
  requestCount: data.request_count ?? 0,
  totalInputTokens: data.total_input_tokens ?? 0,
  totalOutputTokens: data.total_output_tokens ?? 0,
  totalCost: data.total_cost ?? 0,
});

const transformDailyCostSummary = (data: DailyCostSummaryApiResponse): DailyCostSummary => ({
  date: data.date,
  requestCount: data.request_count ?? 0,
  totalTokens: data.total_tokens ?? 0,
  totalCost: data.total_cost ?? 0,
});

export const costApi = {
  async getBotUsage({
    botId,
    startDate,
    endDate,
  }: GetBotUsageParams): Promise<BotUsageSummary> {
    try {
      const startDateParam = formatDateParam(startDate);
      const endDateParam = formatDateParam(endDate);
      
      console.log(`[Billing] Fetching usage for bot ${botId}`, {
        startDate: startDateParam,
        endDate: endDateParam,
      });

      const { data } = await apiClient.get<BotUsageApiResponse>(
        API_ENDPOINTS.COST.USAGE(botId),
        {
          params: {
            start_date: startDateParam,
            end_date: endDateParam,
          },
        }
      );

      console.log(`[Billing] Usage data received for bot ${botId}`, {
        total_cost: data.total_cost,
        total_tokens: data.total_tokens,
        total_requests: data.total_requests,
      });

      return transformUsageResponse(data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const errorCode =
          (error.response?.data as { error_code?: string })?.error_code;
        const shouldFallback =
          status === 404 ||
          (status !== undefined && status >= 500) ||
          !error.response ||
          error.code === 'ECONNABORTED';

        if (shouldFallback) {
          console.warn(
            `[Billing] Using fallback usage summary for bot ${botId}`,
            {
              status,
              errorCode,
              errorMessage: error.message,
            }
          );
          return createEmptyUsageSummary(botId, startDate, endDate);
        }
      }
      console.error(`[Billing] Error fetching usage for bot ${botId}`, error);
      throw error;
    }
  },

  /**
   * 유저 전체 사용량 통계 조회
   */
  async getUserUsage({
    startDate,
    endDate,
  }: GetUserUsageParams = {}): Promise<UserUsageSummary> {
    try {
      const startDateParam = formatDateParam(startDate);
      const endDateParam = formatDateParam(endDate);
      
      console.log('[Billing] Fetching user usage stats', {
        startDate: startDateParam,
        endDate: endDateParam,
      });

      const { data } = await apiClient.get<UserUsageApiResponse>(
        API_ENDPOINTS.COST.USER_STATS,
        {
          params: {
            start_date: startDateParam,
            end_date: endDateParam,
          },
        }
      );

      console.log('[Billing] User usage data received', {
        total_cost: data.total_cost,
        total_tokens: data.total_tokens,
        total_requests: data.total_requests,
      });

      return transformUserUsageResponse(data);
    } catch (error) {
      console.error('[Billing] Error fetching user usage', error);
      throw error;
    }
  },

  /**
   * 유저의 봇별 사용량 분해
   */
  async getUserBotBreakdown({
    startDate,
    endDate,
  }: GetUserUsageParams = {}): Promise<BotUsageBreakdown[]> {
    try {
      const startDateParam = formatDateParam(startDate);
      const endDateParam = formatDateParam(endDate);
      
      console.log('[Billing] Fetching user bot breakdown', {
        startDate: startDateParam,
        endDate: endDateParam,
      });

      const { data } = await apiClient.get<BotUsageBreakdownApiResponse[]>(
        API_ENDPOINTS.COST.USER_BREAKDOWN,
        {
          params: {
            start_date: startDateParam,
            end_date: endDateParam,
          },
        }
      );

      return data.map(transformBotUsageBreakdown);
    } catch (error) {
      console.error('[Billing] Error fetching user bot breakdown', error);
      throw error;
    }
  },

  /**
   * 유저의 모델별 사용량 분해
   */
  async getUserModelBreakdown({
    startDate,
    endDate,
  }: GetUserUsageParams = {}): Promise<ModelUsageBreakdown[]> {
    try {
      const startDateParam = formatDateParam(startDate);
      const endDateParam = formatDateParam(endDate);
      
      console.log('[Billing] Fetching user model breakdown', {
        startDate: startDateParam,
        endDate: endDateParam,
      });

      const { data } = await apiClient.get<ModelUsageBreakdownApiResponse[]>(
        API_ENDPOINTS.COST.USER_MODEL_BREAKDOWN,
        {
          params: {
            start_date: startDateParam,
            end_date: endDateParam,
          },
        }
      );

      return data.map(transformModelUsageBreakdown);
    } catch (error) {
      console.error('[Billing] Error fetching user model breakdown', error);
      throw error;
    }
  },

  /**
   * 유저의 일별 비용 요약
   */
  async getUserDailyCosts(days: number = 30): Promise<DailyCostSummary[]> {
    try {
      console.log('[Billing] Fetching user daily costs', { days });

      const { data } = await apiClient.get<DailyCostSummaryApiResponse[]>(
        API_ENDPOINTS.COST.USER_DAILY,
        {
          params: {
            days,
          },
        }
      );

      return data.map(transformDailyCostSummary);
    } catch (error) {
      console.error('[Billing] Error fetching user daily costs', error);
      throw error;
    }
  },
};
