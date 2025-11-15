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

export interface BillingBotUsage {
  bot_id: string;
  bot_name: string;
  total_cost: number;
  total_tokens: number;
  total_requests: number;
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
  bot_usage?: BillingBotUsage[];
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
  bot_usage: [],
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
    bot_usage: [],
  };
