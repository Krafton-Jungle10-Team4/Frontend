/**
 * Activity Store
 * 활동 로그 상태 관리
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Activity } from '../types/activity.types';

interface ActivityStore {
  // State
  activities: Activity[];
  maxActivities: number;

  // Actions
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
  clearActivities: () => void;
  removeActivity: (id: string) => void;
  setMaxActivities: (max: number) => void;

  // Getters
  getRecentActivities: (count: number) => Activity[];
  getActivitiesByType: (type: Activity['type']) => Activity[];
  getActivitiesByBotId: (botId: string) => Activity[];
}

export const useActivityStore = create<ActivityStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        activities: [],
        maxActivities: 100,

        // Add activity
        addActivity: (activity) =>
          set((state) => {
            const newActivity: Activity = {
              ...activity,
              id: `activity_${Date.now()}_${Math.random().toString(36).substring(7)}`,
              timestamp: new Date().toISOString(),
            };

            const newActivities = [newActivity, ...state.activities];

            // Keep only max activities
            const trimmedActivities =
              newActivities.length > state.maxActivities
                ? newActivities.slice(0, state.maxActivities)
                : newActivities;

            return { activities: trimmedActivities };
          }),

        // Clear all activities
        clearActivities: () => set({ activities: [] }),

        // Remove specific activity
        removeActivity: (id: string) =>
          set((state) => ({
            activities: state.activities.filter((a) => a.id !== id),
          })),

        // Set max activities limit
        setMaxActivities: (max: number) =>
          set((state) => ({
            maxActivities: max,
            activities:
              state.activities.length > max
                ? state.activities.slice(0, max)
                : state.activities,
          })),

        // Get recent activities
        getRecentActivities: (count: number) =>
          get().activities.slice(0, count),

        // Get activities by type
        getActivitiesByType: (type: Activity['type']) =>
          get().activities.filter((a) => a.type === type),

        // Get activities by bot ID
        getActivitiesByBotId: (botId: string) =>
          get().activities.filter((a) => a.botId === botId),
      }),
      {
        name: 'activity-storage',
        partialize: (state) => ({
          activities: state.activities.slice(0, 50), // Only persist last 50
        }),
      }
    ),
    {
      name: 'ActivityStore',
    }
  )
);

// Selectors
export const selectActivities = (state: ActivityStore) => state.activities;
export const selectRecentActivities =
  (count: number) => (state: ActivityStore) =>
    state.activities.slice(0, count);
export const selectActivitiesCount = (state: ActivityStore) =>
  state.activities.length;
