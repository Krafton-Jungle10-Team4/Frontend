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
};
