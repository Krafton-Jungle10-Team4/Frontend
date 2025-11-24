# UI Design Strategy Options Report (v2)
> **Role:** UX Strategy Consultant for SnapShot Workspace  
> **Goal:** Landing `Solid Intelligence` 무드(Glass · Aurora · Network Mesh)를 유지하면서, Workspace 각 페이지의 목적에 맞는 **다양한 디자인 전략 옵션** 제안  
> **Note:** 기존 `UI_Strategy_Options.md`의 강점을 계승하되, 정보 밀도·업무 맥락을 더 세분화했습니다.

---

## Design DNA to Keep (from `LandingPage.tsx`)
- **Visual:** Glass surface + Aurora gradient + Node/Mesh 모티브, 카드형 라운딩과 얇은 라인, 미세한 글로우.
- **Tone:** 전문적이지만 과시적이지 않은 엔터프라이즈 SaaS, 선명한 인디고 계열 포인트 컬러.
- **Micro Interaction:** 스크롤/호버 시 부드러운 스케일·섀도우 변화, 캡슐형 Pill/Badge.

---

## 1) TopNavigation (`widgets/navigation/TopNavigation.tsx`)
**과제:** 정보 밀도(탭/검색/플랜/계정)와 심미성(가벼운 헤더, 투명감) 사이 균형.

### [Option A] Glass Ribbon (미니멀 & 몰입)
- **핵심 컨셉:** 콘텐츠 위에 떠 있는 반투명 리본. 시야 방해 최소화 + 브랜드 감성.
- **레이아웃 특징:**  
  - `bg-white/70 + backdrop-blur-md`, 하단 보더 제거, `shadow-sm`만. 높이 `h-14`로 슬림.  
  - 중앙에 **캡슐형 탭 그룹**(`rounded-full`), 탭 간 미세한 구분 라인.  
  - 우측: 플랜 배지를 Landing의 `StatusBadge` 축소판으로 변환(글로우·도트 유지).
- **Pros:** 화면이 넓어 보이고 고급스러움. 시각적 일관성(Glass/Aurora) 강화.  
- **Cons:** 배경이 복잡한 화면에서 대비가 낮아질 위험. 정보량이 많을 때 공간 부족.

### [Option B] Command Bar (정보 구조 & 작업성)
- **핵심 컨셉:** 명확한 구획과 검색 중심 헤더. 대규모 SaaS 느낌.  
- **레이아웃 특징:**  
  - `bg-white` + `border-b`로 영역 분리. 좌측 로고/브레드크럼, 중앙 **글로벌 검색/⌘K**, 우측 플랜/프로필.  
  - 탭은 좌측 혹은 브레드크럼 하위에 **Secondary Nav**로 배치(정보 위계 강조).  
  - `activeTab`를 Pill + 점(dot)로 표시해 현재 컨텍스트 명확히.  
- **Pros:** 어디에 있는지, 무엇을 할 수 있는지 명확. 검색 우선 UX와 궁합.  
- **Cons:** 시각적 설렘은 적음. 헤더 높이·구획이 커져 콘텐츠 공간이 줄 수 있음.

### [Option C] Context Dock (상황 적응형)
- **핵심 컨셉:** 페이지 맥락에 따라 우측 Dock이 변하는 적응형 헤더.  
- **레이아웃 특징:**  
  - 기본은 Option A 스타일의 Glass. 우측 Dock 영역에 페이지별 핵심 액션 슬롯(예: Studio=“새 에이전트”, Marketplace=“필터 열기”).  
  - 헤더 하단에 **Progress/Status Rail**(예: 동기화, 배포 상태)을 1px 라인 형태로 얇게 표시.  
- **Pros:** 현재 작업과 직접 연결된 액션 노출 → 클릭 이동 감소. 브랜드 무드 유지.  
- **Cons:** 상태/액션이 섞여 복잡해 보일 수 있음. 페이지마다 구성 정의 필요.

---

## 2) Marketplace (`features/workspace/pages/MarketplacePage.tsx`)
**과제:** 템플릿 탐색의 “재미”와 “빠른 비교”를 동시에. 현재는 검색+그리드만 있어 발견성이 약함.

### [Option A] Editorial Storefront (App Store Today 스타일)
- **핵심 컨셉:** 추천/스토리텔링 중심. “오늘의 템플릿”을 전면에.  
- **레이아웃 특징:**  
  - 상단 **Hero 큐레이션 배너**(Aurora 배경, Lottie/미니 노드 그래프).  
  - 가로 스크롤 섹션: “이번 주 인기”, “RAG · Search”, “운영 자동화” 등 테마별.  
  - 카드: 썸네일 비중↑, 텍스트는 2줄 이내. 호버 시 `One-click Copy/Preview`.  
- **Pros:** 신규 사용자 온보딩·홍보에 유리. 시각적 즐거움/브랜드 노출 극대화.  
- **Cons:** 화면당 정보량 감소. 운영 시 큐레이션 콘텐츠 생산 비용 발생.

### [Option B] Visual Pinterest (탐색/필터 우선)
- **핵심 컨셉:** Masonry 그리드 + 즉시 필터. 많은 아이템을 빠르게 훑기.  
- **레이아웃 특징:**  
  - 좌측 **Sticky 필터 패널**(카테고리, 태그, 포맷).  
  - **Masonry Grid** + 컴팩트 카드(제목/핵심 지표/태그). 카드 클릭 시 **모달 프리뷰**.  
  - 상단 검색 바를 떠 있는 `Glass Capsule`로 만들어 Hero 없이도 브랜드 톤 유지.  
- **Pros:** 정보 밀도와 탐색 효율 높음. 사용자가 목표 지향적으로 찾기 좋음.  
- **Cons:** 시각적 “스토리”는 약함. Masonry는 반응형·성능 튜닝 필요.

### [Option C] Data Selector (테이블+미리보기 하이브리드)
- **핵심 컨셉:** 비교/정렬이 중요한 파워유저용.  
- **레이아웃 특징:**  
  - 상단 **Table 뷰**: 이름, 카테고리, 별점, 사용량, 업데이트일.  
  - 우측/하단 **Preview Pane**: 행 선택 시 썸네일·설명·CTA.  
  - 필터 칩과 정렬 컨트롤을 헤더 라인에 정리해 “대시보드” 톤.  
- **Pros:** 대량 템플릿을 빠르게 비교·선택. 엔터프라이즈 B2B 관리자에게 적합.  
- **Cons:** 감성/브랜드 무드가 줄어듦. 초기 진입 시 흥미 유발력이 낮음.

---

## 3) Studio (`features/workspace/pages/StudioPage.tsx`)
**과제:** “내 에이전트 현황” 이해 vs “빠른 관리 액션” 균형. 현재는 그리드 위주.

### [Option A] Control Tower (데이터 지표 중심)
- **핵심 컨셉:** Ops 대시보드. 위험/비용/성능을 한눈에.  
- **레이아웃 특징:**  
  - 상단 **KPI 헤더**(총 에이전트, Live/Stopped, 에러, 토큰 비용, 미니 스파크라인).  
  - 기본 뷰 **Table/List**: 상태, 최신 실행, 성공률, 비용, 태그, 버전.  
  - 행 호버 시 **Inline Quick Actions**(배포, 로그, 중지).  
- **Pros:** 규모가 커질수록 강력. 의사결정·운영 속도↑.  
- **Cons:** 신규 사용자에겐 부담스러울 수 있음. 비주얼 아이덴티티 약화 위험.

### [Option B] Agent Gallery (비주얼 & 정체성)
- **핵심 컨셉:** 각 에이전트를 “캐릭터 카드”로. 애착·브랜딩 강조.  
- **레이아웃 특징:**  
  - **Card Grid** with Avatar + Status Ring(초록/황색/회색).  
  - 카드 내부에 축소형 **Node Graph 미니어처**(Landing mesh 모티브) 배경.  
  - 하단 액션 아이콘(편집·채팅·로그) + 한 줄 성과 배지(성공률/최근 실행).  
- **Pros:** 직관적·친근. 브랜드 무드와 일관.  
- **Cons:** 세부 지표 비교 어려움. 많은 수를 다룰 때 공간 비효율.

### [Option C] Split Hybrid (집계 + 카드)
- **핵심 컨셉:** 상단 요약 + 하단 카드/리스트 토글.  
- **레이아웃 특징:**  
  - 상단 2행 **Summary Belt**: KPI, 토큰 사용량 그래프, 최근 에러 알림을 Pill 형태로.  
  - 본문은 **Card/Grid ↔ Table** 토글. 선택 상태를 상단 **Action Dock**에 띄워 일괄 작업.  
  - “새 에이전트”를 첫 카드로 배치(점선 박스 + 글로우)해 생성 플로우 유도.  
- **Pros:** 비주얼과 데이터 균형. 사용자 숙련도에 따라 뷰 전환 가능.  
- **Cons:** 구현 범위 넓음. 전환/동기화 상태 관리 필요.

---

## 4) Knowledge (`features/workspace/pages/KnowledgePage.tsx`)
**과제:** 대량 문서의 가독성과 검색/업로드 편의성. 현재는 카드형 그리드+검색.

### [Option A] Structured Wiki (Notion-like)
- **핵심 컨셉:** 계층/문맥 중심. 빠른 미리보기로 “내용”에 집중.  
- **레이아웃 특징:**  
  - **Split View**: 좌측 트리/태그, 우측 문서 리스트 + 인라인 Preview.  
  - 리스트는 `Dense List`(행당 2–3줄) + 타입 아이콘(PDF/DOC/TXT 색상).  
  - 상단에 **Breadcrumb + Quick Filters(상태/확장자)**, 하단에 선택 문서 속성 패널.  
- **Pros:** 깊은 폴더도 위치 파악 용이. 내용 스캔·맥락 파악이 빠름.  
- **Cons:** 모바일/좁은 화면 제약. 초반에 빈 트리면 허전해 보일 수 있음.

### [Option B] Drive Console (파일 관리자형)
- **핵심 컨셉:** 업로드·정렬·대량 처리에 최적화.  
- **레이아웃 특징:**  
  - 상단 **Type Chips + Sort**(이름/업데이트/크기).  
  - **Grid/List 토글**; Grid는 큰 아이콘·파일 썸네일, List는 열 정렬.  
  - 전체 영역 **Drag & Drop 업로드**, 멀티셀렉트 후 태그/삭제/이동 일괄 처리.  
- **Pros:** 익숙한 UX, 대량 관리에 효율. 고급 필터/정렬에 강점.  
- **Cons:** 내용보다는 “파일” 관점에 치우침. 브랜드 무드가 약해질 수 있음.

### [Option C] Research Workbench (데이터 테이블 + 프리뷰)
- **핵심 컨셉:** RAG/LLM 관점의 품질 관리.  
- **레이아웃 특징:**  
  - **Data Table** 컬럼: 토큰 수, 청크 수, 임베딩 상태, 최신 동기화, 출처.  
  - 선택 시 우측 **Preview Pane**에서 하이라이트된 본문/메타데이터/연결 워크플로우를 표시.  
  - 상단에 **Alert Chips**(실패/지연), “재처리” 등 운영 액션을 붙여 운영감시 톤.  
- **Pros:** 품질/성능 관리에 직접적. 엔터프라이즈 운영팀에 적합.  
- **Cons:** 러닝커브가 있고, 내용 탐색 경험은 건조해질 수 있음.

---

## 활용 가이드
- **브랜드 무드 유지:** 모든 옵션에서 Header/CTA/Badge에 Aurora·Glass 모티브를 최소한의 강도로 재사용해 Landing과 끊김 없게.  
- **정보 밀도 스위치:** Marketplace/Studio/Knowledge 모두 `Grid ↔ Table` 토글을 설계에 포함해, Option 간 A/B 테스트 및 사용자 롤(Explorer vs Operator) 분기 가능.  
- **모듈화:** `GlassCard`, `CapsuleTabs`, `StatusPill`, `PreviewPane` 등 공용 컴포넌트를 먼저 정의하면 옵션 간 실험 비용을 낮출 수 있음.
