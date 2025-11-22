import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useBillingStore } from '@/shared/stores/billingStore';
import { mockPlans, Plan } from '../mock/billingMock';
import { Button } from '@/shared/components/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/shared/components/card';
import { cn } from '@/shared/components/utils';
import { CheckCircle2, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

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
    muted?: boolean;
  }
> = {
  free: {
    badge: 'bg-white/70 text-slate-700',
    badgeLabel: '무료로 시작',
    border: 'border-slate-200',
    gradient: 'from-white via-white to-white',
    button: 'bg-white text-[#1c1f4a] border border-slate-200 hover:bg-slate-50 shadow-none',
    icon: 'text-slate-400',
    muted: true,
  },
  pro: {
    badge: 'bg-indigo-100 text-indigo-900',
    badgeLabel: '가장 인기',
    border: 'border-indigo-200/80',
    gradient: 'from-white via-[#eef0ff] to-white',
    button: 'bg-[#4b4de8] text-white shadow-[0_12px_36px_rgba(75,77,232,0.35)] hover:bg-[#4042d4] hover:shadow-[0_14px_44px_rgba(64,66,212,0.45)]',
    icon: 'text-indigo-500',
    highlight: 'ring-2 ring-indigo-200 shadow-[0_20px_60px_rgba(55,53,195,0.25)] scale-[1.01]',
  },
  enterprise: {
    badge: 'bg-gradient-to-r from-[#fff7d6] via-[#ffe7b3] to-[#e6f6ff] text-[#171026]',
    badgeLabel: '맞춤 지원',
    border: 'border-amber-100',
    gradient: 'from-[#fffdf7] via-[#fff5dc] to-[#e7f6ff]',
    button: 'bg-[#ffb347] text-[#2b1a09] shadow-[0_12px_34px_rgba(255,179,71,0.35)] hover:bg-[#ff9f43] hover:shadow-[0_14px_40px_rgba(255,159,67,0.4)]',
    icon: 'text-amber-500',
    highlight: 'ring-2 ring-amber-100 shadow-[0_20px_60px_rgba(255,177,71,0.28)] scale-[1.03]',
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
  const isMuted = !!config.muted;
  const isEnterprise = plan.plan_id === 'enterprise';
  const buttonDisabled = isCurrentPlan || isDowngrade;
  const buttonLabel = isCurrentPlan
    ? '현재 플랜'
    : isDowngrade
      ? '다운그레이드 불가'
      : `${plan.name}로 업그레이드`;

  return (
    <Card
      className={cn(
        'relative h-full overflow-hidden rounded-3xl border-2 bg-gradient-to-b transition-all duration-300 backdrop-blur-sm',
        config.gradient,
        config.border,
        config.highlight,
        isMuted
          ? 'shadow-sm hover:shadow-md hover:-translate-y-0'
          : 'group shadow-lg shadow-indigo-50/80 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-200/80'
      )}
    >
      {!isMuted && (
        <>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(95,91,255,0.12),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(109,211,255,0.14),transparent_45%)] opacity-70 transition duration-500 group-hover:opacity-90" />
          <div className="pointer-events-none absolute -inset-10 rotate-6 bg-gradient-to-r from-white/5 via-white/25 to-white/5 opacity-0 blur-3xl transition duration-700 group-hover:opacity-70" />
        </>
      )}
      {isEnterprise && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,200,120,0.32),transparent_44%),radial-gradient(circle_at_80%_12%,rgba(143,211,255,0.28),transparent_44%)] opacity-50 transition duration-700 group-hover:opacity-95" />
      )}
      <CardHeader className="relative p-6 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-slate-900">
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
        <p className="text-3xl font-extrabold text-slate-900">
          {plan.monthly_fee_description}
        </p>
        <p className="text-sm text-slate-500">{plan.target}</p>
      </CardHeader>
      <CardContent className="relative flex flex-col flex-1 space-y-4 pb-0">
        <div className="rounded-xl bg-indigo-50/80 px-4 py-3 text-sm shadow-inner shadow-indigo-100/80">
          <p className="text-xs font-semibold uppercase text-slate-500">
            {creditLabel(plan.credits.frequency)}
          </p>
          <p className="text-lg font-semibold text-slate-900">
            ${plan.credits.amount.toFixed(0)}
          </p>
        </div>
        <ul className="space-y-3 text-sm">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-slate-600">
              <CheckCircle2 className={cn('h-5 w-5 flex-shrink-0', config.icon)} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="relative pt-0 pb-6">
        <Button
          className={cn(
            'w-full h-12 text-[15px] font-semibold rounded-xl transition-all shadow-sm',
            config.button,
            buttonDisabled && 'cursor-default',
            isMuted ? 'hover:-translate-y-0' : 'hover:-translate-y-0.5'
          )}
          onClick={() => {
            if (buttonDisabled) return;
            onUpgrade(plan.plan_id);
          }}
          disabled={buttonDisabled}
        >
          {buttonLabel}
          {!buttonDisabled && <ArrowRight className="h-4 w-4" />}
        </Button>
      </CardFooter>
    </Card>
  );
};

export function PricingPage() {
  const navigate = useNavigate();
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
    navigate(-1);
  };

  const landingBackdrop = {
    background:
      'radial-gradient(circle at 15% 20%, rgba(55,53,195,0.08), transparent 35%), radial-gradient(circle at 85% 5%, rgba(95,91,255,0.06), transparent 30%), #f7f8fb',
  };

  return (
    <div className="min-h-screen" style={landingBackdrop}>
      <div className="relative overflow-hidden bg-gradient-to-br from-[#080a1c] via-[#111a38] to-[#2b2aa8] px-4 py-16 text-white shadow-[0_25px_70px_rgba(34,41,89,0.35)] sm:px-8">
        <div className="pointer-events-none absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_18%_18%,rgba(95,91,255,0.2),transparent_36%),radial-gradient(circle_at_82%_8%,rgba(109,211,255,0.22),transparent_32%)]" />
        <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="mx-auto max-w-6xl">
          <Button
            variant="ghost"
            className="mb-6 text-white hover:bg-white/10"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            뒤로 가기
          </Button>
          <div className="space-y-4 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight drop-shadow-lg sm:text-4xl bg-gradient-to-r from-white via-[#dfe5ff] to-[#9ab8ff] bg-clip-text text-transparent">
              당신에게 맞는 플랜을 선택하세요
            </h1>
            <p className="text-[#e5ebff] text-base sm:text-lg">
              모든 플랜은 팀 협업과 워크플로우 자동화를 위해 설계되었으며, 필요에 따라 자유롭게 업그레이드할 수 있습니다.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm text-[#e9eeff]">
            {['신뢰할 수 있는 결제 시스템', '크레딧 기반 사용량 추적', '언제든지 플랜 변경 가능'].map(
              (item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 backdrop-blur"
                >
                  <CheckCircle2 className="h-4 w-4 text-[#c5d6ff]" />
                  {item}
                </span>
              )
            )}
          </div>
          {currentPlanId === 'free' && (
            <div className="mt-10 flex items-center gap-4 rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur sm:p-6">
              <div className="flex items-center gap-4 w-full">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
                  <span className="absolute inline-flex h-12 w-12 rounded-full bg-white/30 opacity-60 animate-ping" />
                  <Sparkles className="relative h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-xs uppercase tracking-[0.12em] text-white/60">Upgrade boost</p>
                  <p className="text-sm font-semibold text-white">
                    프로 이상 플랜은 전용 트래픽과 SLA, 새 기능 우선 오픈을 즉시 활성화합니다.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="bg-white/80 px-4 py-12 backdrop-blur sm:px-8">
        <div className="mx-auto max-w-6xl">
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
          <p className="mt-10 text-center text-sm text-slate-500">
            모든 유료 플랜은 7일 내 취소 시 전액 환불되며, 업그레이드는 즉시 적용됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
