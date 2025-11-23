// @SnapShot/Frontend/my-project/src/features/billing/pages/BillingSettingsPage.tsx

import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useBilling } from '../hooks/useBilling';
import { useBillingStore } from '@/shared/stores/billingStore';
import { useAuth, useAuthStore } from '@/features/auth';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/shared/components/card';
import { Button } from '@/shared/components/button';
import { Progress } from '@/shared/components/progress';
import { TopNavigation } from '@/widgets';
import { mockPlans } from '../mock/billingMock';
import { costApi, type DailyCostSummary, type ModelUsageBreakdown } from '../api/costApi';
import { UsageChart } from '@/shared/components/usage/UsageChart';
import { AlertTriangle, CalendarDays, CheckCircle2, CreditCard, Zap, BarChart3, Cpu, Sparkles } from 'lucide-react';

export function BillingSettingsPage() {
  const navigate = useNavigate();
  const { billingStatus, isLoading, error } = useBilling();
  const upgradePlan = useBillingStore((state) => state.upgradePlan);
  
  const user = useAuthStore((state) => state.user);
  const resetAuthStore = useAuthStore((state) => state.reset);
  const userName = user?.name || 'User';
  const userEmail = user?.email || '';
  const { logout } = useAuth();

  // 일별 비용 및 모델별 사용량 데이터
  const [dailyCosts, setDailyCosts] = useState<DailyCostSummary[]>([]);
  const [modelBreakdown, setModelBreakdown] = useState<ModelUsageBreakdown[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    if (!billingStatus) return;

    const loadDetails = async () => {
      setIsLoadingDetails(true);
      try {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const [daily, models] = await Promise.all([
          costApi.getUserDailyCosts(30),
          costApi.getUserModelBreakdown({
            startDate: monthStart,
            endDate: now,
          }),
        ]);

        setDailyCosts(daily);
        setModelBreakdown(models);
      } catch (err) {
        console.error('Failed to load usage details', err);
      } finally {
        setIsLoadingDetails(false);
      }
    };

    void loadDetails();
  }, [billingStatus]);

  const handleCancelSubscription = () => {
    upgradePlan('free');
    toast.success('Free 플랜으로 변경되었습니다.');
  };

  const handleLogout = async () => {
    try {
      await logout();
      resetAuthStore();
      navigate('/landing');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };
  const landingBackdrop = {
    background:
      'radial-gradient(circle at 15% 20%, rgba(55,53,195,0.08), transparent 35%), radial-gradient(circle at 85% 10%, rgba(95,91,255,0.06), transparent 30%), #f7f8fb',
  };

  const renderContent = () => {
    if (error) {
      return (
        <div className="flex h-full items-center justify-center bg-[#f7f8fb] px-4">
          <div className="w-full max-w-md rounded-3xl bg-white/90 p-8 text-center shadow-md shadow-indigo-50/80 backdrop-blur">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-slate-900">
              결제 사용량 정보를 불러오지 못했습니다
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              잠시 후 페이지를 새로고침하여 다시 시도해주세요. 다른 페이지는 계속 이용하셔도 됩니다.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/home')}
              >
                홈으로 이동
              </Button>
              <Button className="w-full" onClick={handleRetry}>
                다시 시도
              </Button>
            </div>
            <p className="mt-4 text-xs text-slate-500 break-words">
              오류 상세: {error.message}
            </p>
          </div>
        </div>
      );
    }

    if (isLoading || !billingStatus) {
      return (
        <div className="flex h-full items-center justify-center bg-[#f7f8fb] px-4">
          <div className="rounded-2xl bg-white/90 px-6 py-8 text-sm text-slate-600 shadow-md shadow-indigo-50/80 backdrop-blur">
            결제 정보를 불러오는 중입니다...
          </div>
        </div>
      );
    }

    const { current_plan, usage, billing_cycle } = billingStatus;
    const botUsage = billingStatus.bot_usage ?? [];
    const sortedBotUsage = [...botUsage].sort(
      (a, b) => b.total_cost - a.total_cost
    );
    const isFreePlan = current_plan.plan_id === 'free';
    const planDetails = mockPlans.find((plan) => plan.plan_id === current_plan.plan_id);
    const creditUsagePercentage =
      usage.total_credit > 0
        ? Math.min((usage.monthly_cost / usage.total_credit) * 100, 100)
        : 0;
    const additionalCharge = Math.max(
      usage.monthly_cost - usage.total_credit,
      0
    );
    const canPayOutstanding = additionalCharge > 0;

    const handlePayOutstanding = () => {
      if (!canPayOutstanding) return;
      const message = '결제 페이지로 이동합니다. (준비 중)';
      toast.info(message);
    };

    const formatDate = (value: string) =>
      new Date(value).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

    const startDate = formatDate(billing_cycle.start_date);
    const endDate = formatDate(billing_cycle.end_date);
    const planIconColor =
      current_plan.plan_id === 'enterprise'
        ? 'text-indigo-700'
        : current_plan.plan_id === 'pro'
          ? 'text-indigo-500'
          : 'text-slate-400';

    return (
      <div className="min-h-full" style={landingBackdrop}>
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b0c14] via-[#161a38] to-[#3735c3] p-6 text-white shadow-[0_25px_70px_rgba(34,41,89,0.35)] sm:p-10">
            <div className="pointer-events-none absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_20%_20%,rgba(95,91,255,0.2),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(109,211,255,0.2),transparent_30%)]" />
            <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
            <div className="relative space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                현재 플랜
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold sm:text-4xl">{current_plan.name}</h1>
                {planDetails?.monthly_fee_description && (
                  <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-white/85">
                    {planDetails.monthly_fee_description}
                  </span>
                )}
              </div>
              <p className="max-w-3xl text-base text-white/85">
                {planDetails?.target ||
                  '팀 협업, 워크플로우 자동화, API 통합까지 필요한 기능을 유연하게 사용하세요.'}
              </p>
            </div>
            <div className="relative mt-8 grid gap-4 text-sm text-white/90 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase text-white/70">이번 달 사용</p>
                <p className="text-2xl font-semibold">
                  ${usage.monthly_cost.toFixed(2)}
                </p>
                <span className="text-xs text-white/70">
                  총 ${usage.total_credit.toFixed(2)}
                </span>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase text-white/70">남은 크레딧</p>
                <p className="text-2xl font-semibold">
                  ${usage.credit_remaining.toFixed(2)}
                </p>
                <span className="text-xs text-white/70">
                  업그레이드 시 자동 충전
                </span>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase text-white/70">다음 갱신일</p>
                <p className="text-2xl font-semibold">{endDate}</p>
                <span className="text-xs text-white/70">
                  결제 주기 {startDate} - {endDate}
                </span>
              </div>
            </div>
            {isFreePlan && (
              <div className="relative mt-6 overflow-hidden rounded-2xl border border-white/20 bg-white/5 p-4 backdrop-blur">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.25),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(95,91,255,0.2),transparent_40%)] opacity-70 animate-pulse" />
                <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
                      <span className="absolute inline-flex h-12 w-12 rounded-full bg-white/25 opacity-60 animate-ping" />
                      <Sparkles className="relative h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.12em] text-white/60">
                        추천 업그레이드
                      </p>
                      <p className="text-sm font-semibold text-white">
                        프로 · 엔터프라이즈 업그레이드 시 전용 트래픽과 우선 지원을 바로 받습니다.
                      </p>
                    </div>
                  </div>
                  <Button
                    className="h-11 rounded-xl bg-white text-[#0f122b] shadow-lg shadow-indigo-900/30 transition hover:-translate-y-0.5 hover:bg-indigo-50"
                    onClick={() => navigate('/pricing')}
                  >
                    업그레이드 살펴보기
                  </Button>
                </div>
              </div>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="border-white/80 bg-white text-[#1c1f4a] hover:bg-indigo-50 hover:text-[#0e1030]"
                onClick={() => navigate('/pricing')}
              >
                <Zap className="h-4 w-4" />
                플랜 변경
              </Button>
              <Button
                variant="outline"
                className="ml-auto border-white/50 bg-transparent text-white hover:bg-white/15"
                onClick={handleCancelSubscription}
                disabled={isFreePlan}
              >
                구독 취소
              </Button>
              <Button
                variant="outline"
                className="border border-white/70 bg-white/20 text-white hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-40"
                onClick={handlePayOutstanding}
                disabled={!canPayOutstanding}
              >
                결제하기
              </Button>
            </div>
            <p className="mt-3 text-xs text-white/80">
              {canPayOutstanding
                ? `추가 청구 예정 금액: $${additionalCharge.toFixed(2)}`
                : '이번 결제 주기에 추가 청구 예정 금액이 없습니다.'}
            </p>
          </section>

          <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <Card className="rounded-2xl border border-indigo-50/80 bg-white/90 shadow-md shadow-indigo-50/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-900">
                  크레딧 사용량
                </CardTitle>
                <p className="text-sm text-slate-500">
                  워크스페이스에서 사용 중인 크레딧을 확인하세요.
                </p>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>
                      사용: ${usage.monthly_cost.toFixed(2)}
                    </span>
                    <span>
                      남음: ${usage.credit_remaining.toFixed(2)}
                    </span>
                  </div>
                  <Progress value={creditUsagePercentage} className="mt-3 h-2" />
                </div>
                <div className="grid gap-4 rounded-2xl bg-indigo-50/60 p-4 text-sm text-slate-600 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase text-slate-500">
                      총 크레딧
                    </p>
                    <p className="text-lg font-semibold text-slate-900">
                      ${usage.total_credit.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-slate-500">
                      사용 비율
                    </p>
                    <p className="text-lg font-semibold text-slate-900">
                      {creditUsagePercentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-1 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <span
                  className={
                    canPayOutstanding
                      ? 'font-semibold text-red-600'
                      : 'font-semibold text-emerald-600'
                  }
                >
                  {canPayOutstanding
                    ? `추가 청구 예정 금액: $${additionalCharge.toFixed(2)}`
                    : '모든 사용량이 제공된 크레딧 한도 내에 있습니다.'}
                </span>
                <span>
                  사용량은 매 결제 주기 시작 시 초기화됩니다.
                </span>
              </CardFooter>
            </Card>

            <Card className="rounded-2xl border border-indigo-50/80 bg-white/90 shadow-md shadow-indigo-50/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-900">
                  결제 주기
                </CardTitle>
                <p className="text-sm text-slate-500">
                  다음 갱신 일정을 한눈에 확인하세요.
                </p>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-600">
                <div className="flex items-start gap-3 rounded-2xl bg-indigo-50/80 p-4">
                  <CalendarDays className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="font-semibold text-slate-900">
                      다음 갱신일
                    </p>
                    <p>{endDate}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                  <CreditCard className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="font-semibold text-slate-900">
                      현재 결제 주기
                    </p>
                    <p>
                      {startDate} - {endDate}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  인보이스 발행 또는 결제 수단 변경이 필요하면 언제든지 문의해주세요.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 일별 비용 차트 */}
          {isLoadingDetails ? (
            <Card className="rounded-2xl border border-indigo-50/80 bg-white/90 shadow-md shadow-indigo-50/70 backdrop-blur-sm">
              <CardContent className="flex h-[350px] items-center justify-center">
                <p className="text-sm text-slate-500">
                  차트 데이터를 불러오는 중...
                </p>
              </CardContent>
            </Card>
          ) : dailyCosts.length === 0 ? (
            <Card className="rounded-2xl border border-indigo-50/80 bg-white/90 shadow-md shadow-indigo-50/70 backdrop-blur-sm">
              <CardContent className="flex h-[350px] items-center justify-center">
                <p className="text-sm text-slate-500">
                  선택한 기간에 사용량 데이터가 없습니다.
                </p>
              </CardContent>
            </Card>
          ) : (
            <UsageChart
              data={dailyCosts.map((item) => ({
                date: item.date,
                requests: item.requestCount,
                tokens: item.totalTokens,
                cost: item.totalCost,
              }))}
              title="일별 사용량 추이"
            />
          )}

          {/* 상세 통계 카드 */}
          {billingStatus && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="rounded-2xl border border-indigo-50/80 bg-white/90 shadow-md shadow-indigo-50/70 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    총 요청 수
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-slate-900">
                    {billingStatus.bot_usage?.reduce((sum, bot) => sum + bot.total_requests, 0).toLocaleString() ?? 0}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    이번 결제 주기
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-indigo-50/80 bg-white/90 shadow-md shadow-indigo-50/70 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <Cpu className="h-4 w-4" />
                    총 토큰 수
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-slate-900">
                    {billingStatus.bot_usage?.reduce((sum, bot) => sum + bot.total_tokens, 0).toLocaleString() ?? 0}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    이번 결제 주기
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-indigo-50/80 bg-white/90 shadow-md shadow-indigo-50/70 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-500">
                    활성 서비스 수
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-slate-900">
                    {sortedBotUsage.length}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    이번 주기 사용 있음
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-indigo-50/80 bg-white/90 shadow-md shadow-indigo-50/70 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-500">
                  서비스 당 평균 비용
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-slate-900">
                    ${sortedBotUsage.length > 0
                      ? (usage.monthly_cost / sortedBotUsage.length).toFixed(2)
                      : '0.00'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    이번 결제 주기
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 모델별 사용량 분해 */}
          <Card className="rounded-2xl border border-indigo-50/80 bg-white/90 shadow-md shadow-indigo-50/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-900">
                모델별 사용량
              </CardTitle>
              <p className="text-sm text-slate-500">
                사용 중인 AI 모델과 각 모델의 비용을 확인하세요.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingDetails ? (
                <div className="rounded-2xl bg-indigo-50/60 p-6 text-center text-sm text-slate-500">
                  모델 데이터를 불러오는 중...
                </div>
              ) : modelBreakdown.length === 0 ? (
                <div className="rounded-2xl bg-indigo-50/60 p-6 text-center text-sm text-slate-500">
                  모델 사용량 데이터가 없습니다.
                </div>
              ) : (
                <div className="space-y-3">
                  {modelBreakdown.map((model, index) => (
                    <div
                      key={`${model.provider}-${model.modelName}-${index}`}
                      className="flex items-center justify-between rounded-2xl border border-indigo-50 p-4 transition-colors hover:bg-indigo-50/60"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900">{model.modelName}</p>
                          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-slate-600">
                            {model.provider}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {model.requestCount.toLocaleString()}회 요청 · 입력 {model.totalInputTokens.toLocaleString()} + 출력 {model.totalOutputTokens.toLocaleString()} 토큰
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-lg font-semibold text-slate-900">
                          ${model.totalCost.toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-500">
                          총 비용
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 봇별 사용량 */}
          <Card className="rounded-2xl border border-indigo-50/80 bg-white/90 shadow-md shadow-indigo-50/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-900">
              서비스 별 사용량
              </CardTitle>
              <p className="text-sm text-slate-500">
                이번 결제 주기 동안 각 서비스가 사용한 비용과 토큰 수입니다.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {sortedBotUsage.length === 0 ? (
                <div className="rounded-2xl bg-indigo-50/60 p-6 text-center text-sm text-slate-500">
                  아직 사용량이 기록된 서비스가 없습니다.
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedBotUsage.map((bot) => (
                    <div
                      key={bot.bot_id}
                      className="flex items-center justify-between rounded-2xl border border-indigo-50 p-4 transition-colors hover:bg-indigo-50/60"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {bot.bot_name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {bot.total_requests}회 요청 · {bot.total_tokens.toLocaleString()} 토큰
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-slate-900">
                          ${bot.total_cost.toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-500">
                          이번 주기
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-indigo-50/80 bg-white/90 shadow-md shadow-indigo-50/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-900">
                플랜 혜택
              </CardTitle>
              <p className="text-sm text-slate-500">
                현재 구독에서 제공되는 모든 기능입니다.
              </p>
            </CardHeader>
            <CardContent>
              {planDetails ? (
                <ul className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                  {planDetails.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle2 className={`h-5 w-5 flex-shrink-0 ${planIconColor}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">
                  플랜 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#f7f8fb]">
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavigation
          userName={userName}
          userEmail={userEmail}
          onHomeClick={() => navigate('/workspace/studio')}
          onLogout={handleLogout}
        />
        <div className="flex-1 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
