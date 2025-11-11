// Feature flags configuration
// Controls feature rollout and A/B testing

export const featureFlags = {
  asyncDocumentUpload: {
    enabled: import.meta.env.VITE_ENABLE_ASYNC_UPLOAD === 'true',
    description: '비동기 문서 업로드 및 모니터링',
  },
} as const;

/**
 * Hook to check if a feature flag is enabled
 * @param flag - Feature flag key
 * @returns Whether the feature is enabled
 */
export const useFeatureFlag = (flag: keyof typeof featureFlags): boolean => {
  return featureFlags[flag].enabled;
};

/**
 * Direct access to feature flag status (non-hook version)
 * Use this in non-component contexts
 */
export const isFeatureEnabled = (flag: keyof typeof featureFlags): boolean => {
  return featureFlags[flag].enabled;
};
