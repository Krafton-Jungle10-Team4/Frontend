/**
 * Feature Flag Store
 *
 * Centralized feature flag management with environment variable support
 * and runtime toggle capability for A/B testing and rollbacks
 *
 * Note: Flags are initialized from environment variables on every page load
 * to ensure immediate rollback capability. Runtime toggles work within a
 * session but do not persist across page reloads.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

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
 * Provides runtime feature flag management without persistence.
 * Flags are always initialized from environment variables on page load,
 * ensuring emergency rollbacks work immediately for all users.
 */
export const useFeatureFlagStore = create<FeatureFlagState>()(
  devtools(
    (set, get) => ({
      // Initialize from environment variables
      flags: getInitialFlags(),

      /**
       * Set a feature flag to a specific value
       * Note: This change only lasts for the current session
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
       * Note: This change only lasts for the current session
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
      name: 'FeatureFlagStore',
    }
  )
);
