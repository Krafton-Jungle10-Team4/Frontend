// @SnapShot/Frontend/my-project/src/features/billing/hooks/useBilling.ts

/**
 * @file useBilling.ts
 * @description Billing 관련 상태를 조회하고 관리하는 커스텀 훅입니다.
 * 비용 모니터링 API와 Bot 목록 API를 이용해 사용자별 총 사용량을 계산합니다.
 */

import { useEffect } from 'react';
import { useBillingStore } from '@/shared/stores/billingStore';
import { mockPlans } from '../mock/billingMock';
import { botApi } from '@/features/bot/api/botApi';
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
        const bots = await botApi.getAll();

        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const usageResults = await Promise.allSettled(
          bots.map((bot) =>
            costApi.getBotUsage({
              botId: bot.id,
              startDate: monthStart,
              endDate: now,
            })
          )
        );

        if (!isMounted) return;

        const botUsageDetails = bots.map((bot, index) => {
          const result = usageResults[index];
          if (result?.status === 'fulfilled') {
            const summary = result.value;
            return {
              bot_id: bot.id,
              bot_name: bot.name,
              total_cost: Number(summary.totalCost.toFixed(2)),
              total_tokens: summary.totalTokens,
              total_requests: summary.totalRequests,
            };
          }
          return {
            bot_id: bot.id,
            bot_name: bot.name,
            total_cost: 0,
            total_tokens: 0,
            total_requests: 0,
          };
        });

        const totalCost = botUsageDetails.reduce(
          (sum, usage) => sum + usage.total_cost,
          0
        );

        const totalCredit = planMeta.credits.amount;
        const creditRemaining = Math.max(totalCredit - totalCost, 0);

        const billingCycle = status?.billing_cycle ?? getBillingCycle();

        setStatus({
          current_plan:
            status?.current_plan ?? {
              plan_id: planMeta.plan_id,
              name: planMeta.name,
            },
          usage: {
            monthly_cost: Number(totalCost.toFixed(2)),
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
