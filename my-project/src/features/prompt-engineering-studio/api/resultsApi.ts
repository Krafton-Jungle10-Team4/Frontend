export const resultsApi = {
  getTestResults: async (testSetId: string) => {
    // const response = await apiClient.get(`${API_ENDPOINTS.TESTS.RESULTS}/${testSetId}`);
    // return response.data;
    
    // For now, return mock data
    const { mockTestResults } = await import('@features/prompt-engineering-studio/data/mockResults');
    const filtered = mockTestResults.filter((result) => result.testSetId === testSetId);
    return filtered.length > 0 ? filtered : mockTestResults;
  },
};
