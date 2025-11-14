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

const formatDateParam = (date?: Date) =>
  date ? date.toISOString().split('T')[0] : undefined;

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
      const { data } = await apiClient.get<BotUsageApiResponse>(
        API_ENDPOINTS.COST.USAGE(botId),
        {
          params: {
            start_date: formatDateParam(startDate),
            end_date: formatDateParam(endDate),
          },
        }
      );

      return transformUsageResponse(data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return {
          botId,
          totalRequests: 0,
          totalInputTokens: 0,
          totalOutputTokens: 0,
          totalTokens: 0,
          totalCost: 0,
          periodStart: startDate?.toISOString() ?? null,
          periodEnd: endDate?.toISOString() ?? null,
        };
      }
      throw error;
    }
  },
};
