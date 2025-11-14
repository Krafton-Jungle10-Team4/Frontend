// @SnapShot/Frontend/my-project/src/features/billing/pages/BillingSettingsPage.tsx

import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useBilling } from '../hooks/useBilling';
import { useBillingStore } from '@/shared/stores/billingStore';
import { useAuth, useAuthStore } from '@/features/auth';
import { useUIStore } from '@/shared/stores/uiStore';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/shared/components/card';
import { Button } from '@/shared/components/button';
import { Progress } from '@/shared/components/progress';
import { LeftSidebar, TopNavigation, WorkspaceSidebar } from '@/widgets';
import { mockPlans } from '../mock/billingMock';
import { CalendarDays, CheckCircle2, CreditCard, Zap } from 'lucide-react';

export function BillingSettingsPage() {
  const navigate = useNavigate();
  const { billingStatus, isLoading } = useBilling();
  const upgradePlan = useBillingStore((state) => state.upgradePlan);
  
  const user = useAuthStore((state) => state.user);
  const resetAuthStore = useAuthStore((state) => state.reset);
  const userName = user?.name || 'User';
  const userEmail = user?.email || '';
  const { logout } = useAuth();
  
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
  const language = useUIStore((state) => state.language);
  const setLanguage = useUIStore((state) => state.setLanguage);
  const openPricingModal = useUIStore((state) => state.openPricingModal);

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

  const translations = {
    en: { currentPage: 'Billing' },
    ko: { currentPage: '결제' },
  };
  const t = translations[language];

  const renderContent = () => {
    if (isLoading || !billingStatus) {
      return (
        <div className="flex h-full items-center justify-center bg-gray-50 px-4">
          <div className="rounded-2xl bg-white px-6 py-8 text-sm text-gray-600 shadow-sm">
            결제 정보를 불러오는 중입니다...
          </div>
        </div>
      );
    }

    const { current_plan, usage, billing_cycle } = billingStatus;
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
      const message =
        language === 'en'
          ? 'Redirecting to the payment page (coming soon).'
          : '결제 페이지로 이동합니다. (준비 중)';
      toast.info(message);
    };

    const formatDate = (value: string) =>
      new Date(value).toLocaleDateString(language === 'en' ? 'en-US' : 'ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

    const startDate = formatDate(billing_cycle.start_date);
    const endDate = formatDate(billing_cycle.end_date);
    const planIconColor =
      current_plan.plan_id === 'enterprise'
        ? 'text-purple-500'
        : current_plan.plan_id === 'pro'
          ? 'text-teal-500'
          : 'text-gray-500';

    return (
      <div className="min-h-full bg-gray-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
          <section className="rounded-3xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 p-6 text-white shadow-xl sm:p-10">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                {language === 'en' ? 'Current Plan' : '현재 플랜'}
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
            <div className="mt-8 grid gap-4 text-sm text-white/90 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase text-white/70">이번 달 사용</p>
                <p className="text-2xl font-semibold">
                  ${usage.monthly_cost.toFixed(2)}
                </p>
                <span className="text-xs text-white/70">
                  {language === 'en' ? 'out of' : '총'} ${usage.total_credit.toFixed(2)}
                </span>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase text-white/70">남은 크레딧</p>
                <p className="text-2xl font-semibold">
                  ${usage.credit_remaining.toFixed(2)}
                </p>
                <span className="text-xs text-white/70">
                  {language === 'en' ? 'Auto refresh with upgrade' : '업그레이드 시 자동 충전'}
                </span>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase text-white/70">다음 갱신일</p>
                <p className="text-2xl font-semibold">{endDate}</p>
                <span className="text-xs text-white/70">
                  {language === 'en' ? 'Billing cycle' : '결제 주기'} {startDate} - {endDate}
                </span>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="border-white/80 bg-white text-teal-600 hover:bg-white/90 hover:text-teal-700"
                onClick={openPricingModal}
              >
                <Zap className="h-4 w-4" />
                {language === 'en' ? 'Manage Plan' : '플랜 변경'}
              </Button>
              <Button
                variant="outline"
                className="ml-auto border-white/50 bg-transparent text-white hover:bg-white/10"
                onClick={handleCancelSubscription}
                disabled={isFreePlan}
              >
                {language === 'en' ? 'Cancel subscription' : '구독 취소'}
              </Button>
              <Button
                variant="outline"
                className="border border-white/70 bg-white/20 text-white hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-40"
                onClick={handlePayOutstanding}
                disabled={!canPayOutstanding}
              >
                {language === 'en' ? 'Pay Outstanding' : '결제하기'}
              </Button>
            </div>
            <p className="mt-3 text-xs text-white/80">
              {canPayOutstanding
                ? language === 'en'
                  ? `Additional charge due: $${additionalCharge.toFixed(2)}`
                  : `추가 청구 예정 금액: $${additionalCharge.toFixed(2)}`
                : language === 'en'
                  ? 'No additional charges this cycle.'
                  : '이번 결제 주기에 추가 청구 예정 금액이 없습니다.'}
            </p>
          </section>

          <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <Card className="rounded-2xl border border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {language === 'en' ? 'Credit Usage' : '크레딧 사용량'}
                </CardTitle>
                <p className="text-sm text-gray-500">
                  {language === 'en'
                    ? 'Track how much credit your workspace has consumed.'
                    : '워크스페이스에서 사용 중인 크레딧을 확인하세요.'}
                </p>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                      {language === 'en' ? 'Used' : '사용'}: $
                      {usage.monthly_cost.toFixed(2)}
                    </span>
                    <span>
                      {language === 'en' ? 'Remaining' : '남음'}: $
                      {usage.credit_remaining.toFixed(2)}
                    </span>
                  </div>
                  <Progress value={creditUsagePercentage} className="mt-3 h-2" />
                </div>
                <div className="grid gap-4 rounded-2xl bg-gray-50 p-4 text-sm text-gray-600 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase text-gray-400">
                      {language === 'en' ? 'Total credit' : '총 크레딧'}
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      ${usage.total_credit.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-gray-400">
                      {language === 'en' ? 'Usage ratio' : '사용 비율'}
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {creditUsagePercentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-1 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                <span
                  className={
                    canPayOutstanding
                      ? 'font-semibold text-red-600'
                      : 'font-semibold text-emerald-600'
                  }
                >
                  {canPayOutstanding
                    ? language === 'en'
                      ? `Additional charge pending: $${additionalCharge.toFixed(2)}`
                      : `추가 청구 예정 금액: $${additionalCharge.toFixed(2)}`
                    : language === 'en'
                      ? 'All usage is within your credit allowance.'
                      : '모든 사용량이 제공된 크레딧 한도 내에 있습니다.'}
                </span>
                <span>
                  {language === 'en'
                    ? 'Usage resets at the start of each billing cycle.'
                    : '사용량은 매 결제 주기 시작 시 초기화됩니다.'}
                </span>
              </CardFooter>
            </Card>

            <Card className="rounded-2xl border border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {language === 'en' ? 'Billing Cycle' : '결제 주기'}
                </CardTitle>
                <p className="text-sm text-gray-500">
                  {language === 'en'
                    ? 'Upcoming renewal schedule at a glance.'
                    : '다음 갱신 일정을 한눈에 확인하세요.'}
                </p>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-gray-600">
                <div className="flex items-start gap-3 rounded-2xl bg-teal-50/60 p-4">
                  <CalendarDays className="h-5 w-5 text-teal-600" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {language === 'en' ? 'Next renewal' : '다음 갱신일'}
                    </p>
                    <p>{endDate}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl bg-gray-50 p-4">
                  <CreditCard className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {language === 'en' ? 'Current cycle' : '현재 결제 주기'}
                    </p>
                    <p>
                      {startDate} - {endDate}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {language === 'en'
                    ? 'Need an invoice or to update payment info? Reach out to our billing team anytime.'
                    : '인보이스 발행 또는 결제 수단 변경이 필요하면 언제든지 문의해주세요.'}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">
                {language === 'en' ? 'Plan Benefits' : '플랜 혜택'}
              </CardTitle>
              <p className="text-sm text-gray-500">
                {language === 'en'
                  ? 'Everything included with your current subscription.'
                  : '현재 구독에서 제공되는 모든 기능입니다.'}
              </p>
            </CardHeader>
            <CardContent>
              {planDetails ? (
                <ul className="grid gap-3 text-sm text-gray-600 sm:grid-cols-2">
                  {planDetails.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle2 className={`h-5 w-5 flex-shrink-0 ${planIconColor}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  {language === 'en'
                    ? 'Unable to load plan benefits. Please try again later.'
                    : '플랜 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-background">
      <WorkspaceSidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName={userName}
        currentPage={t.currentPage}
        language={language}
      />
      <div className="hidden lg:block">
        <LeftSidebar onLogoClick={() => navigate('/home')} />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavigation
          onToggleSidebar={() => setSidebarOpen(true)}
          userName={userName}
          userEmail={userEmail}
          onHomeClick={() => navigate('/home')}
          language={language}
          onLanguageChange={setLanguage}
          onLogout={handleLogout}
          currentPage={t.currentPage}
        />
        <div className="flex-1 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
