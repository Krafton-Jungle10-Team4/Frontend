// @SnapShot/Frontend/my-project/src/features/billing/components/PricingModal.tsx

import { toast } from 'sonner';
import { useBillingStore } from '@/shared/stores/billingStore';
import { useUIStore } from '@/shared/stores/uiStore';
import { mockPlans, Plan } from '../mock/billingMock';
import { Button } from '@/shared/components/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/shared/components/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/dialog';
import { cn } from '@/shared/components/utils';
import { CheckCircle2 } from 'lucide-react';

const planVisualConfig: Record<
  Plan['plan_id'],
  {
    badge: string;
    badgeLabel: string;
    border: string;
    gradient: string;
    button: string;
    icon: string;
    highlight?: string;
  }
> = {
  free: {
    badge: 'bg-gray-100 text-gray-700',
    badgeLabel: '무료로 시작',
    border: 'border-gray-200',
    gradient: 'from-white via-white to-gray-50',
    button: 'bg-gray-900 text-white hover:bg-gray-900/90',
    icon: 'text-gray-500',
  },
  pro: {
    badge: 'bg-teal-100 text-teal-900',
    badgeLabel: '가장 인기',
    border: 'border-teal-200',
    gradient: 'from-white via-teal-50 to-white',
    button: 'bg-teal-500 text-white hover:bg-teal-600',
    icon: 'text-teal-500',
    highlight: 'ring-2 ring-teal-200 shadow-xl shadow-teal-100 scale-[1.01]',
  },
  enterprise: {
    badge: 'bg-purple-100 text-purple-900',
    badgeLabel: '맞춤 지원',
    border: 'border-purple-200',
    gradient: 'from-white via-purple-50 to-white',
    button: 'bg-purple-600 text-white hover:bg-purple-700',
    icon: 'text-purple-500',
  },
};

const creditLabel = (frequency: Plan['credits']['frequency']) =>
  frequency === 'monthly' ? '월 제공 크레딧' : '제공 크레딧';

const PLAN_PRIORITY: Record<Plan['plan_id'], number> = {
  free: 0,
  pro: 1,
  enterprise: 2,
};

type PlanRelation = 'current' | 'upgrade' | 'downgrade';

const getPlanRelation = (
  planId: Plan['plan_id'],
  currentPlanId: Plan['plan_id']
): PlanRelation => {
  if (planId === currentPlanId) {
    return 'current';
  }
  return PLAN_PRIORITY[planId] > PLAN_PRIORITY[currentPlanId]
    ? 'upgrade'
    : 'downgrade';
};

const PlanCard = ({
  plan,
  onUpgrade,
  relation,
}: {
  plan: Plan;
  onUpgrade: (planId: Plan['plan_id']) => void;
  relation: PlanRelation;
}) => {
  const config = planVisualConfig[plan.plan_id];
  const isCurrentPlan = relation === 'current';
  const isDowngrade = relation === 'downgrade';
  const buttonDisabled = isCurrentPlan || isDowngrade;
  const buttonLabel = isCurrentPlan
    ? '현재 플랜'
    : isDowngrade
      ? '다운그레이드 불가'
      : `${plan.name}으로 업그레이드`;

  return (
    <Card
      className={cn(
        'h-full rounded-2xl border-2 bg-gradient-to-b transition-all duration-200 backdrop-blur-sm',
        config.gradient,
        config.border,
        config.highlight
      )}
    >
      <CardHeader className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-gray-900">
            {plan.name}
          </CardTitle>
          <span
            className={cn(
              'text-xs font-semibold tracking-wide uppercase px-3 py-1 rounded-full',
              config.badge
            )}
          >
            {config.badgeLabel}
          </span>
        </div>
        <p className="text-3xl font-extrabold text-gray-900">
          {plan.monthly_fee_description}
        </p>
        <p className="text-sm text-gray-500">{plan.target}</p>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 space-y-4 pb-0">
        <div className="rounded-xl bg-white/70 px-4 py-3 text-sm">
          <p className="text-xs font-semibold uppercase text-gray-500">
            {creditLabel(plan.credits.frequency)}
          </p>
          <p className="text-lg font-semibold text-gray-900">
            ${plan.credits.amount.toFixed(0)}
          </p>
        </div>
        <ul className="space-y-3 text-sm">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-gray-600">
              <CheckCircle2 className={cn('h-5 w-5 flex-shrink-0', config.icon)} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-0 pb-6">
        <Button
          className={cn(
            'w-full h-11 text-sm font-semibold rounded-xl transition-all',
            config.button,
            buttonDisabled && 'cursor-default'
          )}
          onClick={() => {
            if (buttonDisabled) return;
            onUpgrade(plan.plan_id);
          }}
          disabled={buttonDisabled}
        >
          {buttonLabel}
        </Button>
      </CardFooter>
    </Card>
  );
};

export function PricingModal() {
  const { isPricingModalOpen, closePricingModal } = useUIStore();
  const upgradePlan = useBillingStore((state) => state.upgradePlan);
  const currentPlanId =
    useBillingStore(
      (state) => state.status?.current_plan.plan_id
    ) ?? 'free';
  const orderedPlans = [...mockPlans].sort(
    (a, b) => PLAN_PRIORITY[a.plan_id] - PLAN_PRIORITY[b.plan_id]
  );

  const handleUpgrade = (planId: Plan['plan_id']) => {
    const relation = getPlanRelation(planId, currentPlanId);
    if (relation !== 'upgrade') return;
    upgradePlan(planId);
    const planName = mockPlans.find(p => p.plan_id === planId)?.name;
    toast.success(`${planName} 플랜으로 변경되었습니다!`);
    closePricingModal();
  };

  return (
    <Dialog open={isPricingModalOpen} onOpenChange={closePricingModal}>
      <DialogContent className="w-[95vw] max-w-none sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl rounded-3xl border-none p-0 shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-slate-900 via-teal-600 to-cyan-500 px-4 py-10 text-center text-white sm:px-8">
          <DialogHeader className="space-y-4 text-center text-white sm:text-center">
            <DialogTitle className="text-3xl font-extrabold tracking-tight text-white drop-shadow-lg sm:text-4xl">
              당신에게 맞는 플랜을 선택하세요
            </DialogTitle>
            <p className="text-white/85 text-base sm:text-lg">
              모든 플랜은 팀 협업과 워크플로우 자동화를 위해 설계되었으며, 필요에 따라 자유롭게 업그레이드할 수 있습니다.
            </p>
          </DialogHeader>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-white/90">
            {['신뢰할 수 있는 결제 시스템', '크레딧 기반 사용량 추적', '언제든지 플랜 변경 가능'].map(
              (item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 backdrop-blur"
                >
                  <CheckCircle2 className="h-4 w-4 text-white" />
                  {item}
                </span>
              )
            )}
          </div>
        </div>
        <div className="bg-white px-4 py-10 sm:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {orderedPlans.map((plan) => (
              <PlanCard
                key={plan.plan_id}
                plan={plan}
                onUpgrade={handleUpgrade}
                relation={getPlanRelation(plan.plan_id, currentPlanId)}
              />
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-gray-500">
            모든 유료 플랜은 7일 내 취소 시 전액 환불되며, 업그레이드는 즉시 적용됩니다.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
