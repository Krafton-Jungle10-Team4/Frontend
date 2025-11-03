/**
 * Activity API Client
 * 활동 관련 API 호출 함수들 (추후 구현)
 */

import type { Activity } from '../types/activity.types';

export const activityApi = {
  /**
   * 활동 내역 조회 (추후 구현)
   */
  async getActivities(): Promise<Activity[]> {
    // TODO: 백엔드 API 추가 후 구현
    console.warn('getActivities is not implemented yet');
    return [];
  },

  /**
   * 활동 내역 삭제 (추후 구현)
   */
  async deleteActivity(id: string): Promise<{ success: boolean }> {
    // TODO: 백엔드 API 추가 후 구현
    console.warn('deleteActivity is not implemented yet');
    return { success: true };
  },
};
