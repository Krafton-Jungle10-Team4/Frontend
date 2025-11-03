/**
 * User Store
 * 사용자 정보 상태 관리
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User } from '@/shared/types';

interface UserStore {
  // State
  userName: string;
  user: User | null;

  // Actions
  setUserName: (name: string) => void;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        userName: 'John Doe', // Default name for demo
        user: null,

        // Set user name (for simple cases)
        setUserName: (name: string) => set({ userName: name }),

        // Set full user object
        setUser: (user: User | null) =>
          set({
            user,
            userName: user?.name || 'John Doe',
          }),

        // Update user partially
        updateUser: (updates: Partial<User>) =>
          set((state) => ({
            user: state.user ? { ...state.user, ...updates } : null,
            userName: updates.name || state.userName,
          })),

        // Clear user data
        clearUser: () =>
          set({
            user: null,
            userName: 'John Doe',
          }),
      }),
      {
        name: 'user-storage',
        partialize: (state) => ({
          userName: state.userName,
          user: state.user,
        }),
      }
    ),
    {
      name: 'UserStore',
    }
  )
);

// Selectors
export const selectUserName = (state: UserStore) => state.userName;
export const selectUser = (state: UserStore) => state.user;
export const selectIsLoggedIn = (state: UserStore) => state.user !== null;
