
# Billing 시스템 (FE Mock UI + Flow) 구현 계획서 v2

**작성자:** 시니어 프론트엔드 개발자 (Tech Lead)  
**작성일:** 2025-11-14  
**문서 버전:** 2.0

---

## [개요]

이 문서는 Billing 시스템의 백엔드 API가 준비되기 전, 프론트엔드 UI/UX 흐름을 선제적으로 구축하기 위한 Mock UI 구현 계획을 정의합니다. 모든 데이터는 실제 API 호출 없이 사전에 정의된 가짜(Mock) 데이터를 사용하며, 사용자가 가격 정책을 확인하고 업그레이드를 시도하는 핵심 흐름(Flow)을 구현하는 것을 목표로 합니다.

**작업 기준 문서:** `@SnapShot/Frontend/dev_md/Pricing/Billing_System_Proposal.md`

---

## [Phase 1] Mock 데이터 및 상태 관리 기반 구축

### [FE Task] Phase 1.1: Mock 데이터 정의

`Billing_System_Proposal.md` 문서의 API 응답 예시를 기반으로, 플랜 정보와 현재 사용자 구독 상태에 대한 Mock 데이터를 생성합니다.

#### @SnapShot/Frontend/my-project/src/features/billing/mock/billingMock.ts
```typescript
// @SnapShot/Frontend/my-project/src/features/billing/mock/billingMock.ts

/**
 * @file billingMock.ts
 * @description Billing 시스템을 위한 Mock 데이터를 정의합니다.
 * API가 준비되기 전까지 UI 개발 및 테스트를 위해 사용됩니다.
 */

// 구독 플랜의 타입을 정의합니다.
export interface Plan {
  plan_id: 'free' | 'pro' | 'enterprise';
  name: 'Free' | 'Pro' | 'Enterprise';
  price: number;
  monthly_fee_description: string;
  target: string;
  features: string[];
  credits: {
    amount: number;
    frequency: 'once' | 'monthly';
  };
}

// 현재 사용자/팀의 구독 상태 타입을 정의합니다.
export interface BillingStatus {
  current_plan: {
    plan_id: 'free' | 'pro' | 'enterprise';
    name: 'Free' | 'Pro' | 'Enterprise';
  };
  usage: {
    monthly_cost: number;
    credit_remaining: number;
    total_credit: number;
  };
  billing_cycle: {
    start_date: string;
    end_date: string;
  };
}

// 3가지 구독 플랜에 대한 Mock 데이터 배열입니다.
// GET /api/v1/billing/plans API의 응답을 모방합니다.
export const mockPlans: Plan[] = [
  {
    plan_id: 'free',
    name: 'Free',
    price: 0,
    monthly_fee_description: '$0 / month',
    target: '개인 개발자, 학생, 기능 체험',
    features: [
      '봇 생성: 3개',
      '팀원: 1명 (본인)',
      '지식베이스(KB): 50MB',
      '프롬프트 스튜디오: 월 100회 테스트',
      '기본 워크플로우 노드',
      '커뮤니티 지원',
    ],
    credits: {
      amount: 10,
      frequency: 'once',
    },
  },
  {
    plan_id: 'pro',
    name: 'Pro',
    price: 29,
    monthly_fee_description: '$29 / month',
    target: '전문 개발자, 스타트업, 중소기업',
    features: [
      '봇 생성: 10개',
      '팀원: 5명',
      '지식베이스(KB): 1GB',
      '프롬프트 스튜디오: 무제한',
      '모든 워크플로우 노드',
      'API Rate Limit 완화',
      '"Powered by" 브랜딩 제거',
      '이메일 기술 지원',
    ],
    credits: {
      amount: 20,
      frequency: 'monthly',
    },
  },
  {
    plan_id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    monthly_fee_description: '$99 / month',
    target: '대기업, 전문 에이전시',
    features: [
      '봇 생성: 무제한',
      '팀원: 무제한',
      '지식베이스(KB): 10GB',
      '프롬프트 스튜디오: 무제한',
      '커스텀 워크플로우 노드',
      '전용 API 처리량',
      '전담 매니저 & SLA',
      '고급 보안 및 감사 로그',
    ],
    credits: {
      amount: 50,
      frequency: 'monthly',
    },
  },
];

// 현재 사용자의 구독 상태에 대한 Mock 데이터 객체입니다.
// GET /api/v1/billing/status API의 응답을 모방합니다.
// 시나리오: Pro 플랜 구독 중, 월 제공 크레딧 $20 중 $15.7 사용, $4.3 남음.
export const mockBillingStatus: BillingStatus = {
  current_plan: {
    plan_id: 'pro',
    name: 'Pro',
  },
  usage: {
    monthly_cost: 15.7,
    credit_remaining: 4.3,
    total_credit: 20,
  },
  billing_cycle: {
    start_date: '2025-11-01T00:00:00Z',
    end_date: '2025-11-30T23:59:59Z',
  },
};

// 시나리오: Free 플랜 사용자의 Mock 데이터
export const mockFreeUserBillingStatus: BillingStatus = {
    current_plan: {
      plan_id: 'free',
      name: 'Free',
    },
    usage: {
      monthly_cost: 7.5,
      credit_remaining: 2.5,
      total_credit: 10,
    },
    billing_cycle: {
      start_date: '2025-11-01T00:00:00Z',
      end_date: '2025-11-30T23:59:59Z',
    },
  };
```

### [FE Task] Phase 1.2: 전역 스토어(Zustand) 생성

사용자의 구독 상태를 전역적으로 관리하기 위한 Zustand 스토어를 생성합니다.

#### @SnapShot/Frontend/my-project/src/shared/stores/billingStore.ts
```typescript
// @SnapShot/Frontend/my-project/src/shared/stores/billingStore.ts

/**
 * @file billingStore.ts
 * @description 사용자의 Billing 관련 상태를 관리하는 Zustand 스토어입니다.
 */

import { create } from 'zustand';
import { BillingStatus } from '@/features/billing/mock/billingMock';

// 스토어의 상태(State) 타입을 정의합니다.
interface BillingState {
  status: BillingStatus | null; // 사용자 구독 상태 정보
  isLoading: boolean; // 상태 정보 로딩 여부
  error: Error | null; // 에러 상태
  setStatus: (status: BillingStatus) => void; // 상태를 설정하는 액션
}

// Zustand 스토어를 생성합니다.
export const useBillingStore = create<BillingState>((set) => ({
  // 초기 상태값
  status: null,
  isLoading: true,
  error: null,
  
  // 상태를 업데이트하는 액션 함수
  // 외부(예: useBilling 훅)에서 호출하여 스토어의 상태를 변경합니다.
  setStatus: (status: BillingStatus) => set({ status, isLoading: false, error: null }),
}));
```

### [FE Task] Phase 1.3: Mock 데이터 연동 훅 생성

실제 API 호출 없이 Mock 데이터를 사용하여 Billing 스토어를 초기화하는 커스텀 훅을 생성합니다.

#### @SnapShot/Frontend/my-project/src/features/billing/hooks/useBilling.ts
```typescript
// @SnapShot/Frontend/my-project/src/features/billing/hooks/useBilling.ts

/**
 * @file useBilling.ts
 * @description Billing 관련 상태를 조회하고 관리하는 커스텀 훅입니다.
 * 현재는 Mock 데이터를 사용하여 스토어를 초기화하는 역할을 합니다.
 * 추후 실제 API 연동 로직으로 교체될 예정입니다.
 */

import { useEffect } from 'react';
import { useBillingStore } from '@/shared/stores/billingStore';
// 개발 단계에서는 Free 유저와 Pro 유저 시나리오를 쉽게 전환하기 위해 두 가지를 모두 import 합니다.
import { mockBillingStatus, mockFreeUserBillingStatus } from '../mock/billingMock';

export function useBilling() {
  // useBillingStore에서 상태와 액션을 가져옵니다.
  const { status, isLoading, error, setStatus } = useBillingStore();

  // 컴포넌트 마운트 시 1회만 실행되는 useEffect
  useEffect(() => {
    // 현재는 실제 API 호출 없이 Mock 데이터를 사용하여 스토어를 초기화합니다.
    // TODO: 추후 실제 API가 구현되면 아래 로직을 API 호출 코드로 대체해야 합니다.
    
    // --- Mock Logic ---
    try {
      // 1초의 가상 로딩 시간을 줍니다.
      const timer = setTimeout(() => {
        // 여기서 Free 유저 시나리오와 Pro 유저 시나리오를 선택할 수 있습니다.
        // HomePage의 업그레이드 플로우를 테스트하려면 `mockFreeUserBillingStatus`를 사용하세요.
        setStatus(mockFreeUserBillingStatus);
        // setStatus(mockBillingStatus); // Pro 유저 테스트 시 이 코드를 사용
      }, 1000);

      // 컴포넌트 언마운트 시 타이머를 정리합니다.
      return () => clearTimeout(timer);

    } catch (e) {
      // Mock 로직에서는 에러가 발생할 가능성이 낮지만, 형식상 남겨둡니다.
      console.error("Failed to load mock billing data", e);
    }
    // setStatus는 변경되지 않으므로 의존성 배열에 포함합니다.
  }, [setStatus]);

  // 훅을 사용하는 컴포넌트에 상태와 로딩 여부 등을 반환합니다.
  return {
    billingStatus: status,
    isLoading,
    error,
    // 편의를 위해 현재 플랜이 free인지 확인하는 boolean 값을 제공합니다.
    isFreePlan: status?.current_plan.plan_id === 'free',
  };
}
```

---

## [Phase 2] UI 페이지 생성 및 Mock 데이터 연동

### [FE Task] Phase 2.1: `PricingPage` 생성

Mock 데이터를 사용하여 3가지 구독 플랜을 보여주는 UI 페이지를 생성합니다.

#### @SnapShot/Frontend/my-project/src/features/billing/pages/PricingPage.tsx
```tsx
// @SnapShot/Frontend/my-project/src/features/billing/pages/PricingPage.tsx

/**
 * @file PricingPage.tsx
 * @description 구독 플랜의 종류와 가격을 보여주는 페이지 컴포넌트입니다.
 */

import { mockPlans, Plan } from '../mock/billingMock';
import { Button } from '@/shared/components/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/shared/components/card';
import { CheckCircle2 } from 'lucide-react';

// 단일 플랜 카드를 렌더링하는 컴포넌트
const PlanCard = ({ plan }: { plan: Plan }) => (
  <Card className="flex flex-col">
    <CardHeader>
      <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
      <p className="text-3xl font-extrabold">{plan.monthly_fee_description}</p>
      <p className="text-sm text-gray-500">{plan.target}</p>
    </CardHeader>
    <CardContent className="flex-grow">
      <ul className="space-y-2">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </CardContent>
    <CardFooter>
      <Button className="w-full">
        {plan.plan_id === 'free' ? 'Get Started' : 'Upgrade to ' + plan.name}
      </Button>
    </CardFooter>
  </Card>
);

// 전체 가격 페이지 컴포넌트
export function PricingPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Find the right plan for your needs
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Start for free, then upgrade as you grow.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* mockPlans 배열을 map하여 각 플랜 카드를 렌더링합니다. */}
        {mockPlans.map((plan) => (
          <PlanCard key={plan.plan_id} plan={plan} />
        ))}
      </div>
    </div>
  );
}
```

### [FE Task] Phase 2.2: `BillingSettingsPage` 생성

`useBilling` 훅을 통해 가져온 Mock 데이터를 사용하여 현재 사용자의 구독 상태를 보여주는 페이지를 생성합니다.

#### @SnapShot/Frontend/my-project/src/features/billing/pages/BillingSettingsPage.tsx
```tsx
// @SnapShot/Frontend/my-project/src/features/billing/pages/BillingSettingsPage.tsx

/**
 * @file BillingSettingsPage.tsx
 * @description 사용자의 현재 구독 상태 및 결제 정보를 보여주는 설정 페이지입니다.
 */

import { useBilling } from '../hooks/useBilling';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/shared/components/card';
import { Button } from '@/shared/components/button';
import { Progress } from '@/shared/components/progress';

export function BillingSettingsPage() {
  // useBilling 훅을 호출하여 Mock 데이터를 가져옵니다.
  const { billingStatus, isLoading } = useBilling();

  // 로딩 중일 때 보여줄 UI
  if (isLoading || !billingStatus) {
    return <div className="p-8">Loading billing information...</div>;
  }

  const { current_plan, usage, billing_cycle } = billingStatus;
  const creditUsagePercentage = (usage.monthly_cost / usage.total_credit) * 100;

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Billing & Subscription</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Current Plan: {current_plan.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold">Credit Usage</h3>
            <p className="text-sm text-gray-600">
              You have used ${usage.monthly_cost.toFixed(2)} of your ${usage.total_credit.toFixed(2)} credit this month.
            </p>
            <Progress value={creditUsagePercentage} className="w-full mt-2" />
            <p className="text-right text-sm mt-1">
              ${usage.credit_remaining.toFixed(2)} remaining
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Billing Cycle</h3>
            <p className="text-sm text-gray-600">
              Your current billing cycle ends on {new Date(billing_cycle.end_date).toLocaleDateString()}.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <p className="text-sm text-gray-500">Manage your subscription and payment methods.</p>
          <div>
            <Button variant="outline" className="mr-2">Cancel Subscription</Button>
            <Button>Change Plan</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
```

### [FE Task] Phase 2.3: `UpgradeModal` 컴포넌트 생성

업그레이드를 유도하는 공용 모달 컴포넌트를 생성합니다.

#### @SnapShot/Frontend/my-project/src/shared/components/UpgradeModal.tsx
```tsx
// @SnapShot/Frontend/my-project/src/shared/components/UpgradeModal.tsx

/**
 * @file UpgradeModal.tsx
 * @description 상위 플랜으로 업그레이드를 유도하는 공용 모달 컴포넌트입니다.
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/dialog';
import { Button } from './button';
import { ArrowRight, Zap } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export function UpgradeModal({ isOpen, onClose, onUpgrade }: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Zap className="h-6 w-6 text-yellow-500 mr-2" />
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription>
            Unlock powerful features to build even better bots.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ul className="list-disc list-inside space-y-2">
            <li>Create up to 10 bots</li>
            <li>Invite up to 5 team members</li>
            <li>Access all advanced workflow nodes</li>
            <li>Remove "Powered by SnapShot" branding</li>
          </ul>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Maybe Later
          </Button>
          <Button onClick={onUpgrade}>
            View Plans <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### [FE Task] Phase 2.4: `RootLayout`에 크레딧 표시 위젯 추가 (수정)

`useBilling` 훅을 사용하여 레이아웃에 현재 크레딧 상태를 보여주는 간단한 위젯을 추가합니다. (이 예시에서는 `WorkspaceSidebar`에 추가하는 것을 가정합니다.)

#### @SnapShot/Frontend/my-project/src/widgets/navigation/WorkspaceSidebar.tsx (수정 예시)
```tsx
// @SnapShot/Frontend/my-project/src/widgets/navigation/WorkspaceSidebar.tsx.tsx

// ... 기존 import 구문들 ...
import { useBilling } from '@/features/billing/hooks/useBilling';
import { Progress } from '@/shared/components/progress';

// ... 기존 WorkspaceSidebar 컴포넌트 코드 ...
export function WorkspaceSidebar({ isOpen, onClose, userName, currentPage, language }) {
  const { billingStatus, isLoading } = useBilling();

  // ... 기존 return 구문 상단 ...

  return (
    // ...
    <nav>
      {/* ... 기존 네비게이션 아이템 ... */}
    </nav>

    {/* Credit Usage Widget 추가 */}
    <div className="mt-auto p-4">
      <h3 className="text-sm font-semibold text-gray-400 mb-2">Credit Usage</h3>
      {isLoading ? (
        <p className="text-xs text-gray-500">Loading...</p>
      ) : billingStatus ? (
        <div>
          <Progress value={(billingStatus.usage.monthly_cost / billingStatus.usage.total_credit) * 100} className="h-2" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>${billingStatus.usage.monthly_cost.toFixed(2)}</span>
            <span>${billingStatus.usage.total_credit.toFixed(2)}</span>
          </div>
        </div>
      ) : null}
    </div>
    // ...
  );
}
```

### [FE Task] Phase 2.5: `HomePage`에 업그레이드 플로우 연동 (수정)

`HomePage`에서 현재 플랜을 확인하고, Free 플랜 사용자에게 업그레이드 버튼과 모달을 표시하며, `PricingPage`로 이동하는 전체 흐름을 구현합니다.

#### @SnapShot/Frontend/my-project/src/features/bot/pages/HomePage.tsx (수정)
```tsx
// @SnapShot/Frontend/my-project/src/features/bot/pages/HomePage.tsx

/**
 * @file HomePage.tsx
 * @description Bot 목록 페이지의 Container 컴포넌트 (Billing 플로우 추가)
 */

import { useState } from 'react'; // useState import 추가
import { useNavigate } from 'react-router-dom';
import {
  LeftSidebar,
  TopNavigation,
  WorkspaceHeader,
  RightSidebar,
  WorkspaceSidebar,
} from '@/widgets';
import { SearchFilters } from '../components/SearchFilters';
import { BotList } from '../components/BotList';
import { useAuth, useAuthStore } from '@/features/auth';
import { useUIStore } from '@/shared/stores/uiStore';
import { useActivityStore } from '@/features/activity';
import { useFilteredBots } from '../hooks/useFilteredBots';
import { useBotActions } from '../hooks/useBotActions';
import { useBots } from '../hooks/useBots';
import { useBilling } from '@/features/billing/hooks/useBilling'; // useBilling 훅 import
import { UpgradeModal } from '@/shared/components/UpgradeModal'; // UpgradeModal import
import { Button } from '@/shared/components/button'; // Button import
import { Zap } from 'lucide-react'; // 아이콘 import

export function HomePage() {
  const navigate = useNavigate();

  // --- 기존 상태 및 훅 ---
  const user = useAuthStore((state) => state.user);
  const resetAuthStore = useAuthStore((state) => state.reset);
  const userName = user?.name || 'User';
  const userEmail = user?.email || '';
  const { logout } = useAuth();
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
  const searchQuery = useUIStore((state) => state.searchQuery);
  const setSearchQuery = useUIStore((state) => state.setSearchQuery);
  const viewMode = useUIStore((state) => state.viewMode);
  const setViewMode = useUIStore((state) => state.setViewMode);
  const language = useUIStore((state) => state.language);
  const setLanguage = useUIStore((state) => state.setLanguage);
  const activities = useActivityStore((state) => state.activities);
  const {
    bots: filteredBots,
    totalCount,
    isEmpty,
    hasResults,
  } = useFilteredBots({ searchQuery });
  const { handleCreateBot, handleDeleteBot, isCreatingBot } = useBotActions();
  const { loading: botsLoading, error: botsError } = useBots();

  // --- Billing 시스템 연동 ---
  const { isFreePlan } = useBilling(); // 현재 Free 플랜인지 확인
  const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false); // 모달 상태 추가

  const handleBotClick = (botId: string) => {
    const bot = filteredBots.find((b) => b.id === botId);
    navigate(`/bot/${botId}/workflow`, {
      state: { botName: bot?.name || 'Bot' },
    });
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

  // 업그레이드 버튼 클릭 시 모달을 열고, 모달 내에서 Pricing 페이지로 이동
  const handleUpgradeClick = () => {
    setUpgradeModalOpen(false); // 모달을 닫고
    navigate('/pricing'); // Pricing 페이지로 이동
  };

  const translations = {
    en: { currentPage: 'Home' },
    ko: { currentPage: '홈' },
  };
  const t = translations[language];

  return (
    <>
      <div className="flex h-screen bg-background">
        {/* ... (기존 사이드바, 네비게이션 등 UI 구조는 동일) ... */}
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
          />
          <WorkspaceHeader
            onCreateBot={handleCreateBot}
            isCreatingBot={isCreatingBot}
            userName={userName}
            botCount={totalCount}
            maxBots={5}
            language={language}
          />
          
          {/* --- 업그레이드 버튼 추가 --- */}
          {isFreePlan && (
            <div className="px-4 sm:px-6 lg:px-8 pt-4">
              <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md flex justify-between items-center">
                <p>You are on the Free plan. Upgrade to unlock more features!</p>
                <Button onClick={() => setUpgradeModalOpen(true)}>
                  <Zap className="h-4 w-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            </div>
          )}

          <SearchFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            language={language}
          />
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              {/* ... (기존 BotList 및 로딩/에러 처리 로직) ... */}
              {botsLoading && isEmpty ? (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <p className="text-sm sm:text-base">
                  {language === 'en'
                    ? 'Loading bots...'
                    : '봇을 불러오는 중입니다...'}
                </p>
              </div>
            ) : (
              <BotList
                bots={filteredBots}
                searchQuery={searchQuery}
                viewMode={viewMode}
                language={language}
                isEmpty={isEmpty}
                hasResults={hasResults}
                onDelete={handleDeleteBot}
                onCreateBot={handleCreateBot}
                onBotClick={handleBotClick}
              />
            )}
            {botsError && (
              <p className="mt-4 text-sm text-red-500">
                {language === 'en'
                  ? 'Failed to load bots. Please try again.'
                  : '봇 목록을 불러오지 못했습니다. 다시 시도해주세요.'}
              </p>
            )}
            </div>
            <div className="hidden xl:block">
              <RightSidebar
                totalBots={totalCount}
                activities={activities}
                maxBots={5}
                userName={userName}
                language={language}
              />
            </div>
          </div>
        </div>
      </div>
      {/* UpgradeModal 렌더링 */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        onUpgrade={handleUpgradeClick}
      />
    </>
  );
}
```

---

## [스코프 제한]

본 계획서는 **Phase 1과 2**에 해당하는 **프론트엔드 Mock UI 및 기본 흐름(Flow) 구현**까지만을 다룹니다.

**[이번 스코프에서 제외되는 항목]**
-   **실제 API 연동:** 모든 데이터는 `billingMock.ts`를 통해 제공됩니다. `axios`, `react-query` 등을 사용한 실제 네트워크 요청은 구현하지 않습니다.
-   **실제 기능 제한 로직:** `useBilling` 훅을 통해 플랜 정보를 가져올 수는 있으나, 이를 바탕으로 `CreateBotButton`을 비활성화하는 등의 실제 기능 제한(Gating) 로직은 다음 단계에서 구현합니다.
-   **결제 연동:** Stripe, Portone 등 외부 결제 서비스와의 연동은 포함되지 않습니다.
-   **백엔드 작업:** 이 문서는 오직 프론트엔드 작업만을 다룹니다.
