/**
 * Feature Flag Store
 *
 * Centralized feature flag management with environment variable support
 * and runtime toggle capability for A/B testing and rollbacks
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type FeatureFlag = 'async_document_upload';

interface FeatureFlagState {
  // Feature flag states
  flags: Record<FeatureFlag, boolean>;

  // Actions
  setFlag: (flag: FeatureFlag, enabled: boolean) => void;
  toggleFlag: (flag: FeatureFlag) => void;
  resetFlags: () => void;
  isEnabled: (flag: FeatureFlag) => boolean;
}

/**
 * Get initial feature flag values from environment variables
 */
const getInitialFlags = (): Record<FeatureFlag, boolean> => {
  return {
    async_document_upload:
      import.meta.env.VITE_FEATURE_ASYNC_DOCUMENT_UPLOAD === 'true' ||
      import.meta.env.VITE_FEATURE_ASYNC_DOCUMENT_UPLOAD === '1' ||
      // Default to true if not specified
      import.meta.env.VITE_FEATURE_ASYNC_DOCUMENT_UPLOAD === undefined,
  };
};

/**
 * Feature Flag Store
 *
 * Provides runtime feature flag management with persistence
 */
export const useFeatureFlagStore = create<FeatureFlagState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initialize from environment variables
        flags: getInitialFlags(),

        /**
         * Set a feature flag to a specific value
         */
        setFlag: (flag: FeatureFlag, enabled: boolean) => {
          set((state) => ({
            flags: {
              ...state.flags,
              [flag]: enabled,
            },
          }));
        },

        /**
         * Toggle a feature flag
         */
        toggleFlag: (flag: FeatureFlag) => {
          set((state) => ({
            flags: {
              ...state.flags,
              [flag]: !state.flags[flag],
            },
          }));
        },

        /**
         * Reset all flags to environment defaults
         */
        resetFlags: () => {
          set({ flags: getInitialFlags() });
        },

        /**
         * Check if a feature flag is enabled
         */
        isEnabled: (flag: FeatureFlag) => {
          return get().flags[flag] ?? false;
        },
      }),
      {
        name: 'feature-flags',
        version: 1,
      }
    ),
    {
      name: 'FeatureFlagStore',
    }
  )
);
