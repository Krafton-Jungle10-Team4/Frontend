
# SnapShot Billing 시스템 기획 제안서

**작성자:** 수석 솔루션 아키텍트(SA) / 프로덕트 매니저(PM)  
**작성일:** 2025-11-14  
**문서 버전:** 1.0

---

## 1. [요금 모델 추천] (구독제 vs. 사용량 기반)

### 1.1. 시장 분석 요약

`AI_Agent_Platforms_Pricing.md` 문서 분석 결과, `Dify`, `Botpress` 등 대부분의 경쟁사는 **구독(Subscription) 모델을 기반으로 하되, 특정 리소스 초과 시 추가 비용을 부과하는 하이브리드(Hybrid) 방식**을 채택하고 있습니다. 이는 사용자에게 예측 가능한 비용을 제공하면서도, 헤비 유저(Heavy User)로부터 추가 수익을 창출할 수 있는 균형 잡힌 모델입니다.

- **구독제:** 예측 가능한 월별 비용, 안정적인 수익원 확보, 기능별 등급(Tier) 설정 용이.
- **사용량 기반(Pay-as-you-go):** 사용한 만큼만 지불하여 초기 진입 장벽이 낮음, 수익 예측의 불확실성.

### 1.2. SnapShot 서비스 모델 추천

**결론: `하이브리드 구독제`를 추천합니다.**

SnapShot은 LLM 기반 봇 생성 및 워크플로우 자동화 서비스로, 사용자는 일관된 개발 및 운영 환경을 필요로 합니다. 완전 사용량 기반 모델은 비용 예측이 어려워 기업 사용자들이 도입을 주저하게 만들 수 있습니다.

따라서, **월별 고정 비용으로 핵심 기능과 일정량의 리소스를 제공하는 `구독제`를 기본으로 채택**하고, 제공된 크레딧이나 리소스 한도를 초과할 경우 추가 비용을 지불하는 방식을 결합하는 것이 가장 이상적입니다. 이는 사용자에게 심리적 안정감을 주고, 서비스 제공자는 안정적인 MRR(월간 반복 수익)을 확보할 수 있는 최적의 전략입니다.

---

## 2. [구독 플랜 제안] (Subscription Plan Design)

사용자 유입부터 전문적인 사용까지 전 단계를 고려하여 다음과 같은 3단계 구독 플랜을 제안합니다.

| 구분 | **Free** | **Pro** | **Enterprise** |
| :--- | :--- | :--- | :--- |
| **월 요금** | $0 | $29 / month | $99 / month |
| **핵심 타겟** | 개인 개발자, 학생, 기능 체험 | 전문 개발자, 스타트업, 중소기업 | 대기업, 전문 에이전시 |
| **무료 크레딧** | **$10** (최초 1회 제공) | **$20** (매월 제공) | **$50** (매월 제공) |
| **봇 생성** | 3개 | 10개 | 무제한 |
| **팀원** | 1명 (본인) | 5명 | 무제한 |
| **지식베이스(KB)** | 50MB | 1GB | 10GB |
| **프롬프트 스튜디오** | 월 100회 테스트 | 무제한 | 무제한 |
| **워크플로우 노드**| 기본 노드만 사용 가능 | 모든 노드 사용 가능 | 모든 노드 + 커스텀 노드 |
| **API 요청** | Rate Limit 적용 | Rate Limit 완화 | 전용 처리량 |
| **브랜딩 제거** | 불가 | 가능 | 가능 |
| **기술 지원** | 커뮤니티 지원 | 이메일 지원 | 전담 매니저 & SLA |

### 2.1. Free 플랜 설계 및 $10 무료 크레딧

- **중요성:** Free 플랜은 사용자가 SnapShot의 핵심 가치를 직접 체험하고 서비스에 익숙해지는 가장 중요한 관문입니다. 충분한 기능을 제공하여 '아하 모먼트'를 느끼게 하고, 자연스럽게 유료 플랜으로 전환하도록 유도해야 합니다.
- **$10 무료 크레딧:** 사용자가 제안한 '$10 무료 크레딧'은 매우 합리적인 방안입니다.
    - **기술적 타당성:** 현재 `cost_monitoring.py` API는 `bot_id` 기준으로 LLM 사용 비용(`total_cost`)을 정확히 추적하고 있습니다. 이 데이터를 `user_id` 또는 `team_id` 기준으로 집계하는 로직을 추가하면, 전체 사용 비용에서 크레딧을 차감하는 형태로 쉽게 구현할 수 있습니다.
    - **구현 방안:**
        1.  `User` 또는 `Team` 모델에 `credit` 컬럼을 추가합니다.
        2.  신규 가입 시 해당 유저에게 $10 크레딧을 지급합니다.
        3.  LLM 비용이 발생할 때마다 집계하여 크레딧에서 차감하고, 크레딧이 모두 소진되면 사용자에게 알림을 보내고 유료 플랜 가입을 유도합니다.

---

## 3. [기능 제한(Gating) 포인트 발굴]

`@SnapShot/Backend`와 `@SnapShot/Frontend/my-project` 코드베이스 분석 결과, 다음과 같은 구체적인 기능 제한 포인트를 발굴했습니다.

### 3.1. 사용자 제안 기반

- **봇 생성 제한:** (`bots.py`)
    - **[BE]** `POST /api/v1/bots` 엔드포인트에서 현재 사용자의 봇 개수를 확인하고, 플랜별 한도를 초과하면 403 Forbidden 에러를 반환합니다.
    - **[FE]** `features/bot`에서 봇 생성 버튼을 비활성화하거나, 클릭 시 업그레이드 유도 모달을 표시합니다.
- **프롬프트 엔지니어링 스튜디오 테스트 횟수 제한:** (`prompt-engineering-studio`)
    - **[BE]** 스튜디오 테스트 관련 API 호출 횟수를 월별로 카운팅하고, 한도 초과 시 제한합니다. 이를 위해 `UsageLog`와 유사한 `StudioUsageLog` 테이블이 필요합니다.
    - **[FE]** `features/prompt-engineering-studio`에서 남은 테스트 횟수를 표시하고, 소진 시 업그레이드를 유도합니다.
- **LLM 모델 제한:** (`workflows.py`)
    - **[BE]** 워크플로우 저장/실행 시, 사용된 LLM 노드의 모델이 현재 플랜에서 허용되는지 검증합니다. (예: Free 플랜은 `Claude Sonnet`, Pro 이상부터 `Opus` 사용 가능)
    - **[FE]** `features/workflow`의 LLM 노드 설정 UI에서, 상위 플랜의 모델은 'Upgrade' 뱃지와 함께 비활성화 처리합니다.

### 3.2. 추가 발굴 제안 (SA/PM 제안)

- **팀원 초대 수 제한:** (`team`)
    - **[BE]** 팀원 초대 API에서 현재 팀원 수를 확인하고 플랜별 한도를 적용합니다.
    - **[FE]** `features/team`의 멤버 관리 페이지에서 초대 버튼을 제한합니다.
- **지식베이스(Knowledge Base) 용량 제한:** (`upload.py`, `documents`)
    - **[BE]** `upload.py`에서 파일 업로드 시, 해당 유저/팀의 총 문서 파일 사이즈를 계산하여 플랜별 한도(50MB, 1GB 등)를 초과하는지 확인합니다.
    - **[FE]** `features/documents` 페이지에 현재 사용량과 총 용량을 표시하는 UI를 추가합니다.
- **워크플로우 특정 노드 사용 제한:** (`workflows.py`, `workflow`)
    - **[BE]** 워크플로우 실행(`workflow_executions.py`) 시, 워크플로우에 포함된 노드 타입들을 검사합니다. `HTTP Request`, `Advanced Agent` 등 특정 노드는 Pro 플랜 이상에서만 사용 가능하도록 제한합니다.
    - **[FE]** `features/workflow`의 노드 팔레트에서 고급 노드들은 자물쇠 아이콘과 함께 비활성화하고, 드래그 시 업그레이드 모달을 띄웁니다.
- **API 요청 수 제한 (Rate Limiting):**
    - **[BE]** FastAPI의 `slowapi` 같은 미들웨어를 활용하여 사용자 등급별로 API 호출 Rate Limit을 차등 적용합니다. (예: Free - 60 RPM, Pro - 300 RPM)
- **데이터 보관 기간 제한:** (`activity`)
    - **[BE]** `LLMUsageLog`, `ActivityLog` 등 로그성 데이터를 조회하는 API에서 플랜별로 조회 가능한 기간을 제한합니다. (예: Free - 7일, Pro - 30일, Enterprise - 영구)
    - **[FE]** `features/dashboard`, `features/activity` 페이지의 날짜 선택 UI에서 선택 가능한 범위를 제한합니다.
- **브랜딩 제거 (Powered by SnapShot):** (`widget`)
    - **[BE]** `widget.py`에서 위젯 설정을 가져올 때, 플랜 정보를 함께 내려주어 브랜딩 표시 여부를 결정합니다.
    - **[FE]** `features/widget`의 설정 페이지에서 '브랜딩 제거' 옵션을 Pro 플랜 이상 사용자에게만 활성화합니다.

---

## 4. [API 갭 분석 (Gap Analysis)] (AS-IS vs. TO-BE)

현재 `cost_monitoring.py`는 비용 '조회'만 가능합니다. 제안된 구독제를 구현하려면 사용자/팀의 **플랜 상태 관리, 결제 연동, 기능 접근 제어**를 위한 새로운 API가 반드시 필요합니다.

### 4.1. AS-IS: 현재 API의 한계

- **상태 관리 불가:** 사용자/팀이 어떤 구독 플랜을 사용 중인지, 크레딧이 얼마나 남았는지 알 수 없습니다.
- **쓰기 작업 불가:** 플랜을 변경하거나 결제 정보를 등록하는 `POST`, `PUT` API가 전무합니다.
- **집계 기준 한계:** 모든 비용이 `bot_id` 기준으로만 집계되어, `user_id` 또는 `team_id` 기준의 통합적인 비용/크레딧 관리가 어렵습니다.

### 4.2. TO-BE: 신규 필요 API 엔드포인트 제안

아래는 구독제 기반 Billing 시스템을 위해 `@SnapShot/Backend/app/api/v1/endpoints/billing.py` 파일에 추가되어야 할 최소한의 API 명세입니다.

```yaml
# @SnapShot/Backend/app/api/v1/endpoints/billing.py 에 추가될 API 명세
# ---
# [Billing & Plans API]

# 1. 사용 가능한 모든 플랜 목록 조회
# GET /api/v1/billing/plans
# - Response:
#   - 200 OK:
#     - body:
#       - plan_id: "free"
#         name: "Free"
#         price: 0
#         features: ["Bots: 3", "Team Members: 1", ...]
#       - plan_id: "pro"
#         name: "Pro"
#         price: 29
#         features: ["Bots: 10", "Team Members: 5", ...]

# 2. 현재 팀/유저의 구독 상태 및 사용량 조회
# GET /api/v1/billing/status
# - Description: 대시보드에서 현재 플랜, 남은 크레딧, 이번 달 사용량 등을 보여주기 위함
# - Response:
#   - 200 OK:
#     - body:
#       - current_plan:
#           plan_id: "pro"
#           name: "Pro"
#       - usage:
#           monthly_cost: 15.7
#           credit_remaining: 4.3 # (기본 제공 $20 - $15.7)
#       - billing_cycle:
#           start_date: "2025-11-01T00:00:00Z"
#           end_date: "2025-11-30T23:59:59Z"

# 3. Stripe/Portone 등 결제 세션 생성
# POST /api/v1/billing/checkout-session
# - Description: 사용자가 '업그레이드' 버튼 클릭 시 호출, 결제 위젯으로 리디렉션
# - Request:
#   - body:
#     - plan_id: "pro"
#     - success_url: "https://snapagent.shop/settings/billing?success=true"
#     - cancel_url: "https://snapagent.shop/settings/billing?canceled=true"
# - Response:
#   - 200 OK:
#     - body:
#       - session_id: "cs_test_a1..."
#       - redirect_url: "https://checkout.stripe.com/c/pay/cs_test_a1..."

# 4. 결제 완료 후 Webhook 수신
# POST /api/v1/billing/webhook
# - Description: Stripe 등 외부 결제 서비스로부터 결제 성공/실패 이벤트를 수신
# - Request:
#   - header:
#     - Stripe-Signature: "t=...,v1=..."
#   - body: (Stripe 이벤트 객체)
# - Response:
#   - 200 OK:
#   - 400 Bad Request:
# - Logic:
#   - Webhook 시그니처 검증
#   - 'checkout.session.completed' 이벤트 수신 시, 해당 유저/팀의 플랜을 DB에서 업데이트

# 5. 구독 취소
# DELETE /api/v1/billing/subscription
# - Description: 사용자가 구독을 취소할 때 호출
# - Response:
#   - 200 OK:
#     - body:
#       - message: "Subscription canceled successfully. Your plan will remain active until the end of the billing period."
#   - 404 Not Found:
```

---

## 5. [FE/BE 구현 로드맵 (Roadmap)]

### 5.1. [BE Task] 백엔드 구현 계획

**1단계: 데이터 모델 확장**

-   `@SnapShot/Backend/app/models/`
    -   **`user.py` / `team.py` 수정:** `plan_id` (String), `credit` (Numeric), `stripe_customer_id` (String) 등 구독 관련 필드 추가.
    -   **`plan.py` 생성:** `Plan` 모델을 새로 생성하여 `plan_id`, `name`, `price`, `features` 등 플랜 정보를 관리.
    -   **`subscription.py` 생성:** `Subscription` 모델을 생성하여 `user_id`/`team_id`, `plan_id`, `status` (active, canceled), `current_period_end` 등 구독 상태를 관리.

**2단계: 신규 Billing API 구현**

-   `@SnapShot/Backend/app/api/v1/endpoints/billing.py`
    -   **파일 생성:** 위 `4.2.`에서 제안한 5개의 API 엔드포인트(`plans`, `status`, `checkout-session`, `webhook`, `subscription`)를 구현합니다.
    -   **결제 연동:** `stripe` 파이썬 라이브러리를 사용하여 외부 결제 서비스와 연동 로직을 구현합니다.

**3단계: 기능 제한(Gating) 로직 적용**

-   `@SnapShot/Backend/app/core/auth/dependencies.py`
    -   **`get_current_user` 수정:** 현재 사용자의 `plan`과 `subscription` 정보를 함께 로드하도록 수정.
    -   **`PermissionChecker` 의존성 주입:** 각 엔드포인트에서 사용자의 플랜을 확인하고 기능 접근을 제어하는 `Depends(PermissionChecker(required_plan='pro'))` 와 같은 의존성을 만듭니다.
-   **기존 엔드포인트 수정:**
    -   `bots.py`, `workflows.py`, `upload.py` 등 주요 엔드포인트에 위에서 만든 `PermissionChecker`를 적용하여 기능 제한 로직을 추가합니다.

### 5.2. [FE Task] 프론트엔드 구현 계획

**1단계: 전역 상태 및 훅(Hook) 추가**

-   `@SnapShot/Frontend/my-project/src/shared/stores/billingStore.ts`
    -   **파일 생성:** `Zustand`를 사용하여 현재 사용자의 구독 상태(`plan`, `credit`, `usage`)를 관리하는 전역 스토어를 생성합니다.
-   `@SnapShot/Frontend/my-project/src/features/billing/hooks/useBilling.ts`
    -   **파일 생성:** `billingStore`의 상태를 쉽게 가져오고, 플랜 업그레이드/취소 등의 액션을 트리거하는 커스텀 훅을 만듭니다.

**2단계: 신규 UI 페이지 및 컴포넌트 생성**

-   `@SnapShot/Frontend/my-project/src/features/billing/pages/PricingPage.tsx`
    -   **페이지 생성:** `/pricing` 경로에 해당하며, 위에서 제안한 3가지 구독 플랜의 상세 정보와 가격을 비교하여 보여주는 페이지입니다. 각 플랜 카드에는 '업그레이드' 또는 '현재 플랜' 버튼이 포함됩니다.

-   `@SnapShot/Frontend/my-project/src/features/billing/pages/BillingSettingsPage.tsx`
    -   **페이지 생성:** `/settings/billing` 경로에 해당하며, 로그인한 사용자가 자신의 현재 구독 상태, 남은 크레딧, 월간 사용량, 다음 결제일, 결제 내역 등을 확인할 수 있는 페이지입니다. 구독 취소 기능도 이 페이지에서 제공합니다.

-   `@SnapShot/Frontend/my-project/src/shared/components/UpgradeModal.tsx`
    -   **컴포넌트 생성:** Free 플랜 사용자가 유료 기능을 사용하려고 할 때 표시되는 공용 모달입니다. 기능의 이점을 설명하고 `PricingPage`로 이동하여 업그레이드하도록 유도합니다.

-   `@SnapShot/Frontend/my-project/src/widgets/layouts/RootLayout.tsx`
    -   **컴포넌트 수정:** 사이드바나 헤더에 현재 사용량 및 크레딧을 시각적으로 표시하는 위젯을 추가합니다. (예: 프로그레스 바)

**3단계: 라우팅 및 접근 제어**

-   `@SnapShot/Frontend/my-project/src/app/router.tsx`
    -   **라우터 수정:** `/pricing`, `/settings/billing` 등 신규 페이지의 라우팅 규칙을 추가합니다.
-   **기존 컴포넌트 수정:**
    -   `features/bot/components/CreateBotButton.tsx`, `features/workflow/components/NodePalette.tsx` 등 기능 제한이 필요한 여러 컴포넌트에서 `useBilling` 훅을 사용하여 현재 플랜을 확인하고, 조건에 따라 UI를 비활성화하거나 `UpgradeModal`을 띄우도록 수정합니다.
