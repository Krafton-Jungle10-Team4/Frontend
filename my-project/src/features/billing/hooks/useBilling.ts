// @SnapShot/Frontend/my-project/src/features/billing/hooks/useBilling.ts

/**
 * @file useBilling.ts
 * @description Billing 관련 상태를 조회하고 관리하는 커스텀 훅입니다.
 * 유저 전체 사용량 API를 이용해 사용자별 총 사용량을 효율적으로 조회합니다.
 */

import { useEffect } from 'react';
import { useBillingStore } from '@/shared/stores/billingStore';
import { mockPlans } from '../mock/billingMock';
import { costApi } from '../api/costApi';

const defaultPlan = mockPlans[0];

const getBillingCycle = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  return {
    start_date: start.toISOString(),
    end_date: end.toISOString(),
  };
};

export function useBilling() {
  const {
    status,
    isLoading,
    error,
    syncedPlanId,
    setStatus,
    setLoading,
    setError,
    setSyncedPlanId,
  } = useBillingStore();

  const currentPlanId = status?.current_plan.plan_id ?? defaultPlan.plan_id;

  useEffect(() => {
    let isMounted = true;

    const fetchUsage = async () => {
      if (syncedPlanId === currentPlanId && status) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const planMeta =
          mockPlans.find((plan) => plan.plan_id === currentPlanId) ??
          defaultPlan;

        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        console.log('[Billing] Fetching user usage stats', {
          monthStart: monthStart.toISOString(),
          endDate: now.toISOString(),
        });

        // 유저 전체 사용량과 봇별 분해를 병렬로 조회
        const [userUsage, botBreakdown] = await Promise.all([
          costApi.getUserUsage({
            startDate: monthStart,
            endDate: now,
          }),
          costApi.getUserBotBreakdown({
            startDate: monthStart,
            endDate: now,
          }),
        ]);

        if (!isMounted) return;

        // 봇별 사용량을 기존 형식으로 변환
        const botUsageDetails = botBreakdown.map((breakdown) => ({
          bot_id: breakdown.botId,
          bot_name: breakdown.botName || 'Unknown Bot',
          total_cost: Number(breakdown.totalCost.toFixed(2)),
          total_tokens: breakdown.totalTokens,
          total_requests: breakdown.requestCount,
        }));

        const totalCost = Number(userUsage.totalCost.toFixed(2));
        const totalCredit = planMeta.credits.amount;
        const creditRemaining = Math.max(totalCredit - totalCost, 0);

        const billingCycle = status?.billing_cycle ?? getBillingCycle();

        console.log('[Billing] Total usage calculated', {
          totalCost,
          totalCredit,
          creditRemaining,
          botUsageDetails,
          userUsage,
        });

        setStatus({
          current_plan:
            status?.current_plan ?? {
              plan_id: planMeta.plan_id,
              name: planMeta.name,
            },
          usage: {
            monthly_cost: totalCost,
            total_credit: totalCredit,
            credit_remaining: Number(creditRemaining.toFixed(2)),
          },
          billing_cycle: billingCycle,
          bot_usage: botUsageDetails,
        });
        setSyncedPlanId(currentPlanId);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to load billing data', err);
        setError(err as Error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchUsage();

    return () => {
      isMounted = false;
    };
  }, [
    currentPlanId,
    setError,
    setLoading,
    setStatus,
    setSyncedPlanId,
    status,
    syncedPlanId,
  ]);

  const effectivePlanId = status?.current_plan.plan_id ?? defaultPlan.plan_id;

  return {
    billingStatus: status,
    isLoading,
    error,
    isFreePlan: effectivePlanId === 'free',
  };
}
