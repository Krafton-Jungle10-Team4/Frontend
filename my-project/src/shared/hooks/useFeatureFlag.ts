/**
 * Feature Flag Hook
 *
 * Hook for checking feature flag status
 * Reads from centralized feature flag store with environment variable support
 * and runtime toggle capability for A/B testing and rollbacks
 */

import { useFeatureFlagStore, type FeatureFlag } from '@/shared/stores/featureFlagStore';

/**
 * Check if a feature flag is enabled
 *
 * @param flag - The feature flag to check
 * @returns true if the feature is enabled
 *
 * @example
 * ```tsx
 * const useAsyncUpload = useFeatureFlag('async_document_upload');
 * return useAsyncUpload ? <NewFeature /> : <LegacyFeature />;
 * ```
 */
export const useFeatureFlag = (flag: FeatureFlag): boolean => {
  return useFeatureFlagStore((state) => state.isEnabled(flag));
};

// Re-export type for convenience
export type { FeatureFlag };
