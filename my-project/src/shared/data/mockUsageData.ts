export interface DailyUsage {
  date: string;
  requests: number;
  tokens: number;
  cost: number;
}

export interface UsageSummary {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  averageRequestsPerDay: number;
}

export interface ModelData {
  [key: string]: DailyUsage[];
}

export const openAIUsage: ModelData = {
  'gpt-4': [
    { date: '2025-10-01', requests: 5200, tokens: 195000, cost: 4.5 },
    { date: '2025-10-08', requests: 5940, tokens: 220000, cost: 5.1 },
    { date: '2025-10-15', requests: 6180, tokens: 228000, cost: 5.28 },
    { date: '2025-10-22', requests: 5720, tokens: 210000, cost: 4.86 },
    { date: '2025-10-29', requests: 6140, tokens: 226000, cost: 5.23 },
  ],
  'gpt-3.5-turbo': [
    { date: '2025-10-01', requests: 3250, tokens: 120000, cost: 1.8 },
    { date: '2025-10-08', requests: 3780, tokens: 138000, cost: 2.06 },
    { date: '2025-10-15', requests: 3970, tokens: 143000, cost: 2.14 },
    { date: '2025-10-22', requests: 3660, tokens: 132000, cost: 1.98 },
    { date: '2025-10-29', requests: 3930, tokens: 142000, cost: 2.13 },
  ],
};

export const geminiUsage: ModelData = {
  'gemini-pro': [
    { date: '2025-10-01', requests: 3820, tokens: 138000, cost: 2.07 },
    { date: '2025-10-08', requests: 4410, tokens: 160000, cost: 2.4 },
    { date: '2025-10-15', requests: 4600, tokens: 167000, cost: 2.51 },
    { date: '2025-10-22', requests: 4250, tokens: 155000, cost: 2.33 },
    { date: '2025-10-29', requests: 4560, tokens: 166000, cost: 2.49 },
  ],
  'gemini-flash': [
    { date: '2025-10-01', requests: 2370, tokens: 86000, cost: 1.29 },
    { date: '2025-10-08', requests: 2730, tokens: 99000, cost: 1.49 },
    { date: '2025-10-15', requests: 2850, tokens: 105000, cost: 1.57 },
    { date: '2025-10-22', requests: 2630, tokens: 96000, cost: 1.44 },
    { date: '2025-10-29', requests: 2820, tokens: 103000, cost: 1.55 },
  ],
};

export function calculateSummary(data: DailyUsage[]): UsageSummary {
  const totalRequests = data.reduce((sum, day) => sum + day.requests, 0);
  const totalTokens = data.reduce((sum, day) => sum + day.tokens, 0);
  const totalCost = data.reduce((sum, day) => sum + day.cost, 0);
  const averageRequestsPerDay =
    data.length > 0 ? Math.round(totalRequests / data.length) : 0;

  return {
    totalRequests,
    totalTokens,
    totalCost,
    averageRequestsPerDay,
  };
}
