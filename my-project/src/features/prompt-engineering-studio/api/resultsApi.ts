import { apiClient } from '@shared/api';
import { API_ENDPOINTS } from '@shared/constants';

export const resultsApi = {
  getTestResults: async (testSetId: string) => {
    // const response = await apiClient.get(`${API_ENDPOINTS.TESTS.RESULTS}/${testSetId}`);
    // return response.data;
    
    // For now, return mock data
    const { mockTestResults } = await import('@features/prompt-engineering-studio/data/mockResults');
    return mockTestResults;
  },
};
