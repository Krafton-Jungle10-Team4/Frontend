# UI Design Strategy Options Report
> **Project:** SnapShot UI/UX Renovation  
> **Target:** Workspace Core Pages (Navigation, Marketplace, Studio, Knowledge)  
> **Date:** 2025.11.24  
> **Author:** Gemini (UX Strategy Consultant)

---

## 🎨 Design Identity: "Solid Intelligence"
`LandingPage.tsx`에서 추출한 핵심 비주얼 키워드는 **'신뢰감(Solid)', '연결성(Node/Mesh)', '현대적 미학(Aurora/Glass)'**입니다.  
내부 워크스페이스(Workspace)는 사용자가 실제 업무를 수행하는 공간이므로, **랜딩 페이지의 화려함(Wow Factor)**을 유지하되 **업무 효율성(Usability)**을 해치지 않는 균형이 필요합니다.

---

## 1. TopNavigation Strategy
**Current Status:** 단순한 기능 나열, 회색 배경 (`bg-gray-100`), 표준적인 좌/우 배치.

### [Option A] The "Glass Control" (심미성 & 몰입감 중심)
> **Concept:** 콘텐츠 위에 떠 있는 듯한 Glassmorphism 헤더. 스크롤 시 콘텐츠와 부드럽게 섞이며 개방감을 줍니다.

*   **Layout:**
    *   **Background:** `bg-white/70` + `backdrop-blur-md` (배경 블러 처리).
    *   **Border:** 하단 경계선을 제거하고 미세한 `shadow-sm`만 적용.
    *   **Spacing:** `h-14` (현재 `h-16`보다 약간 슬림하게)로 콘텐츠 영역 확보.
*   **Key Features:**
    *   **Center Island:** 메뉴 탭을 중앙에 '캡슐 형태' (`rounded-full`, `bg-gray-100/50`)로 모아 배치.
    *   **Visual Feedback:** 호버 시 은은한 Glow 효과.
*   **Pros:** 세련되고 현대적인 느낌. 화면이 넓어 보임.
*   **Cons:** 배경이 복잡할 경우 가독성이 떨어질 수 있음.

### [Option B] The "Command Center" (기능성 & 명확성 중심)
> **Concept:** 명확한 구획을 가진 견고한 헤더. 복잡한 워크플로우 작업 중에도 "내가 어디에 있는지" 확실히 알려줍니다.

*   **Layout:**
    *   **Background:** `bg-white` (완전 불투명) or `bg-slate-900` (다크 테마 헤더).
    *   **Border:** 하단에 `border-b`를 명확히 주어 네비게이션 영역을 분리.
    *   **Structure:** [Logo / Breadcrumbs] -- [Global Search] -- [Actions].
*   **Key Features:**
    *   **Global Search:** 헤더 중앙에 `⌘K` 커맨드 팔레트 검색창 배치.
    *   **Breadcrumbs:** 로고 옆에 현재 경로(예: Studio > My Bot > Workflow) 표시.
*   **Pros:** 정보 구조 파악이 용이. 대규모 앱에 적합.
*   **Cons:** 다소 딱딱하고 보수적인(SaaS스러운) 느낌.

---

## 2. Marketplace Strategy
**Current Status:** 단순 검색바 + 카드 그리드. 탐색의 재미가 부족함.

### [Option A] "App Store" Vibe (큐레이션 & 발견 중심)
> **Concept:** 사용자가 무엇을 찾을지 모를 때, 매력적인 템플릿을 제안하여 설치를 유도합니다.

*   **Layout:**
    *   **Hero Section:** 상단에 "Featured Workflow" 대형 배너 (Aurora 그라디언트 배경).
    *   **Horizontal Scroll:** "이번 주 인기 봇", "생산성 도구", "RAG 템플릿" 등 테마별 가로 스크롤 섹션.
    *   **Card Design:** 썸네일 이미지를 크게 강조하고, 텍스트는 간결하게.
*   **Key Features:**
    *   **Visual Tags:** 텍스트 태그 대신 아이콘/컬러 뱃지로 카테고리 표시.
    *   **One-Click Copy:** 카드 호버 시 "템플릿 복제" 버튼 즉시 노출.
*   **Pros:** 탐색 경험이 즐거움. 신규 기능/템플릿 홍보에 유리.
*   **Cons:** 구현 복잡도가 높음. 한 화면에 보이는 정보량이 적음.

### [Option B] "Pinterest" Discovery (탐색 & 효율 중심)
> **Concept:** 목적이 분명하거나, 많은 아이디어를 빠르게 훑어보고 싶은 사용자를 위함.

*   **Layout:**
    *   **Sticky Sidebar:** 좌측에 카테고리/태그 필터를 고정 (`sticky`).
    *   **Masonry Grid:** 카드 높이를 유동적으로 하여 화면 빈 공간 없이 꽉 채움.
    *   **Compact Card:** 불필요한 장식은 줄이고, 제목/설명/사용수/별점만 밀도 있게 배치.
*   **Key Features:**
    *   **Instant Filter:** 좌측 사이드바 클릭 시 즉시 그리드 재정렬 (No page reload).
    *   **Quick Preview:** 카드 클릭 시 페이지 이동 없이 모달(Dialog)로 상세 내용 표시.
*   **Pros:** 정보 밀도가 높음. 원하는 것을 빠르게 찾기 좋음.
*   **Cons:** 자칫하면 정보 과부하(Cluttered)로 보일 수 있음.

---

## 3. Studio Strategy
**Current Status:** 내 봇 목록을 보여주는 그리드. 상태 관리 기능이 더 강화되어야 함.

### [Option A] "Control Tower" Dashboard (현황 & 데이터 중심)
> **Concept:** "내 봇들이 잘 돌아가고 있나?"를 한눈에 파악하는 엔지니어링 대시보드.

*   **Layout:**
    *   **View Mode:** 기본 `Table` 뷰 (리스트). `Grid` 뷰는 옵션.
    *   **Columns:** 상태(Live/Stop), 마지막 실행 시간, 성공률(%), 비용($), 에러 로그.
*   **Key Features:**
    *   **Sparklines:** 리스트 내에 미니 차트(지난 24시간 요청 수) 삽입.
    *   **Bulk Actions:** 여러 봇을 선택해 일괄 중지/시작/삭제.
*   **Pros:** 관리해야 할 봇이 많을 때 압도적으로 편리함. 전문가용 느낌.
*   **Cons:** 초보자에게는 위압감을 줄 수 있음. 시각적 재미 부족.

### [Option B] "Agent Gallery" (비주얼 & 아이덴티티 중심)
> **Concept:** 각 봇을 하나의 '페르소나'로 취급. 애착을 가지고 키워가는 느낌.

*   **Layout:**
    *   **Card Grid:** 큼직한 카드. 봇의 아바타(로고)를 중심에 배치.
    *   **Status Ring:** 아바타 주변에 상태 표시 링(초록색: Live, 회색: Sleep) 적용.
*   **Key Features:**
    *   **Performance Badge:** 카드 구석에 "성공률 99%" 등의 핵심 지표 하나만 뱃지로 표시.
    *   **Quick Actions:** 카드 하단에 [편집], [채팅], [로그] 아이콘 버튼 배치.
*   **Pros:** 직관적이고 감성적인 접근. 봇의 개성이 드러남.
*   **Cons:** 구체적인 수치 데이터를 확인하려면 클릭해서 들어가야 함.

---

## 4. Knowledge Strategy
**Current Status:** 파일 목록 그리드. `Documents`를 `Knowledge`로 변환하여 표시 중.

### [Option A] "The Wiki" (구조화 & 열람 중심 - Notion Style)
> **Concept:** 단순 파일 저장이 아닌, 지식 체계(Hierarchy)를 잡는 공간.

*   **Layout:**
    *   **Split View:** (좌) 트리 구조 폴더/목록 - (우) 선택된 문서 미리보기/속성.
    *   **Iconography:** 문서 타입별 아이콘(PDF, DOC, TXT)을 직관적으로 표시.
*   **Key Features:**
    *   **Quick Preview:** 문서를 다운로드하지 않고 우측 패널에서 텍스트 내용 즉시 확인.
    *   **Breadcrumbs:** 폴더 깊이가 깊어져도 위치 파악 용이.
*   **Pros:** 문서 내용을 빠르게 훑어보고 관리하기 좋음. 문맥 파악 유리.
*   **Cons:** 모바일이나 좁은 화면에서는 공간 활용이 어려움.

### [Option B] "Digital Asset Manager" (관리 & 검색 중심 - Google Drive Style)
> **Concept:** 대량의 파일을 빠르고 효율적으로 업로드/분류/검색하는 저장소.

*   **Layout:**
    *   **Header Filter:** 상단에 "PDF", "Images", "Text" 등 파일 타입 칩(Chip) 배치.
    *   **Sortable Grid/List:** 사용자가 뷰 모드를 자유롭게 전환.
*   **Key Features:**
    *   **Drag & Drop Zone:** 화면 전체를 드롭존으로 활용하여 파일 업로드.
    *   **Multi-Select:** Shift/Drag로 여러 파일 선택 후 일괄 태그 지정/삭제.
*   **Pros:** 익숙한 UX (파일 탐색기). 대량 관리에 최적화.
*   **Cons:** 문서의 '내용'보다는 '파일' 자체에 집중하게 됨.

---

## 💡 Summary & Recommendation
*   **TopNavigation:** `[Option B] Command Center` 추천. (복잡한 SaaS 툴이므로 명확한 네비게이션과 검색이 중요)
*   **Marketplace:** `[Option A] App Store` 추천. (유저에게 '발견'의 즐거움을 주고 템플릿 사용을 유도)
*   **Studio:** `[Option A] Control Tower` 추천. (장기적으로 봇이 늘어날 경우 관리 효율성이 필수)
*   **Knowledge:** `[Option B] Asset Manager` 추천. (RAG 지식베이스 특성상 다양한 포맷의 대량 파일을 다루기 때문)

이 전략 보고서를 바탕으로 귀하(Client)의 선호도에 맞춰 구체적인 UI 개발을 진행할 수 있습니다.
