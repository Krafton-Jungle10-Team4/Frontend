/**
 * Feature Flag Hook
 *
 * Simple feature flag system for enabling/disabling features
 * Currently uses environment variables, can be extended to remote config
 */

type FeatureFlag = 'async_document_upload';

const FEATURE_FLAGS: Record<FeatureFlag, boolean> = {
  // Enable async document upload feature by default
  async_document_upload: true,
};

/**
 * Check if a feature flag is enabled
 * @param flag - The feature flag to check
 * @returns true if the feature is enabled
 */
export const useFeatureFlag = (flag: FeatureFlag): boolean => {
  return FEATURE_FLAGS[flag] ?? false;
};
