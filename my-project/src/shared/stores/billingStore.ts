// @SnapShot/Frontend/my-project/src/shared/stores/billingStore.ts

/**
 * @file billingStore.ts
 * @description 사용자의 Billing 관련 상태를 관리하는 Zustand 스토어입니다.
 */

import { create } from 'zustand';
import { BillingStatus, Plan, mockPlans } from '@/features/billing/mock/billingMock';

// 스토어의 상태(State) 타입을 정의합니다.
interface BillingState {
  status: BillingStatus | null; // 사용자 구독 상태 정보
  isLoading: boolean; // 상태 정보 로딩 여부
  error: Error | null; // 에러 상태
  syncedPlanId: Plan['plan_id'] | null; // 최근 사용량 동기화된 플랜 ID
  setStatus: (status: BillingStatus) => void; // 상태를 설정하는 액션
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  setSyncedPlanId: (planId: Plan['plan_id'] | null) => void;
  upgradePlan: (planId: Plan['plan_id']) => void; // 플랜을 업그레이드하는 액션
}

// Zustand 스토어를 생성합니다.
export const useBillingStore = create<BillingState>((set, get) => ({
  // 초기 상태값
  status: null,
  isLoading: true,
  error: null,
  syncedPlanId: null,
  
  // 상태를 업데이트하는 액션 함수
  setStatus: (status: BillingStatus) =>
    set({ status, isLoading: false, error: null }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: Error | null) => set({ error, isLoading: false }),
  setSyncedPlanId: (planId: Plan['plan_id'] | null) =>
    set({ syncedPlanId: planId }),

  // 플랜을 업그레이드하는 액션
  upgradePlan: (planId: Plan['plan_id']) => {
    const newPlan = mockPlans.find(p => p.plan_id === planId);
    if (!newPlan) {
      console.error(`Plan with id "${planId}" not found.`);
      return;
    }

    const today = new Date();
    const endDate = new Date(today);
    endDate.setMonth(today.getMonth() + 1);

    const newStatus: BillingStatus = {
      current_plan: {
        plan_id: newPlan.plan_id,
        name: newPlan.name,
      },
      usage: {
        monthly_cost: 0,
        credit_remaining: newPlan.credits.amount,
        total_credit: newPlan.credits.amount,
      },
      billing_cycle: {
        start_date: today.toISOString(),
        end_date: endDate.toISOString(),
      },
      bot_usage: [],
    };

    set({ syncedPlanId: null });
    get().setStatus(newStatus);
  },
}));
