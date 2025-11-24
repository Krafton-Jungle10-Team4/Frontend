# UI Design Improvement Plan: SnapShot Workspace

## 1. 디자인 비전 및 가이드라인
**목표**: `LandingPage`의 "Enterprise SaaS", "Solid Intelligence" 감성을 워크스페이스 내부(Studio, Marketplace, Knowledge)까지 확장하여 일관되고 세련된 사용자 경험 제공.

### 🎨 Core Design Language
*   **키워드**: Glassmorphism, Aurora Gradients, Bento Grid, Micro-interactions.
*   **색상 팔레트**:
    *   **Background**: `bg-slate-50` (기존 `gray-100`보다 차가운 톤) 또는 아주 미세한 그라디언트.
    *   **Accent**: Indigo-500 ~ Violet-600 (LandingPage의 브랜드 컬러).
    *   **Surface**: `bg-white` + `shadow-sm` + `border-slate-200` (깔끔한 카드).
*   **타이포그래피**: 가독성을 위한 산세리프, 헤더에는 `tracking-tight` 적용.

---

## 2. 페이지별 상세 디자인 계획

### 📍 1. TopNavigation (Global Navigation)
**현재 상태**: 기능적이지만 평범한 회색조 디자인 (`bg-gray-100`).
**개선 컨셉**: "Floating Glass Header" 또는 "Clean Minimalist Navbar".

#### 🛠 UI 변경 사항
1.  **배경 및 구조**:
    *   `bg-gray-100` 제거 → `bg-white/80` + `backdrop-blur-md` (반투명 유리 효과) 적용.
    *   하단 보더를 `border-gray-200` 대신 매우 얇은 `border-slate-100`으로 변경하여 경계감을 완화.
2.  **중앙 탭 (Navigation Tabs)**:
    *   현재 텍스트 기반 탭을 **Segmented Control** 스타일 또는 **Underline Animation** 탭으로 변경.
    *   활성 탭에 브랜드 컬러(Indigo) 포인트 및 배경 `bg-indigo-50` 적용.
    *   아이콘(Lucide React)을 텍스트와 함께 배치하여 인지 속도 향상.
        *   Studio: 🧩 (Puzzle/Component)
        *   Marketplace: 🛍️ (Store/Globe)
        *   Knowledge: 📚 (Book/Database)
3.  **우측 사용자 영역**:
    *   **플랜 배지**: 기존 단순 배지에서 `LandingPage`의 `StatusBadge` 스타일을 축소 적용 (Glow 효과 추가).
    *   **프로필**: 아바타에 `ring-2 ring-indigo-100` 효과 추가로 포커싱.

---

### 🛍️ 2. Marketplace Page
**현재 상태**: 단순 검색바 + 그리드 나열. 정보의 위계가 부족함.
**개선 컨셉**: "Discover & Explore" (앱스토어 투데이 탭 느낌).

#### 🛠 UI 변경 사항
1.  **Hero Section (상단 배너)**:
    *   단순 텍스트 제목 대신, **추천 템플릿 슬라이더**나 **트렌딩 태그**를 시각화한 배너 영역 추가.
    *   배경에 `LandingPage`의 `Hero Aurora` 효과를 은은하게 적용.
2.  **검색 및 필터**:
    *   `MarketplaceSearchBar`를 더 크게 중앙 배치 (Hero 섹션 내부로 통합 고려).
    *   태그를 단순 버튼이 아닌 **아이콘이 포함된 카테고리 카드** 형태로 변경 (e.g., 💬 Chatbot, 📄 Analysis, 🎨 Creative).
3.  **아이템 카드 (Grid Item)**:
    *   **Bento Grid 스타일** 적용.
    *   카드 호버 시 약간의 `scale-up` 및 `shadow-lg`.
    *   카드 내부에 **미리보기 이미지** 영역 확대.
    *   하단 메타데이터(다운로드 수, 작성자)를 아이콘과 함께 깔끔하게 정리.

---

### 🧩 3. Studio Page (My Workspace)
**현재 상태**: Marketplace와 동일한 레이아웃. "내 작업 공간"이라는 느낌 부족.
**개선 컨셉**: "Command Center" (전문가용 대시보드).

#### 🛠 UI 변경 사항
1.  **Dashboard Header**:
    *   페이지 상단에 **나의 봇 현황 요약** 위젯 추가 (`LandingPage`의 `Metric` 컴포넌트 활용).
        *   *예: 총 봇 개수, 이번 주 실행 횟수, 토큰 사용량 그래프.*
2.  **"새 봇 만들기" 경험**:
    *   일반 버튼이 아닌, 그리드의 첫 번째 요소로 **"Create New Bot" 카드** 배치.
    *   점선 테두리 (`border-dashed`) + 중앙 `+` 아이콘 + 호버 시 Glow 효과.
3.  **워크플로우 카드 (Card Design)**:
    *   **Header**: 봇 이름 + 상태 점 (Live: 초록, Draft: 회색).
    *   **Body**: 봇의 구조를 추상화한 **Mini Node Graph** (SVG)를 배경으로 깔아 시각적 재미 요소 추가.
    *   **Footer**: 주요 액션(편집, 실행, 로그)을 아이콘 버튼으로 노출하여 접근성 강화.
    *   리스트 뷰/그리드 뷰 토글 버튼 디자인 현대화.

---

### 📚 4. Knowledge Page (RAG Assets)
**현재 상태**: 파일 목록 나열. 데이터 밀도가 낮아 보임.
**개선 컨셉**: "Digital Library" & "Data Depot".

#### 🛠 UI 변경 사항
1.  **업로드 영역 (Dropzone)**:
    *   상단에 넓은 **Drag & Drop 영역** 배치. "여기에 파일을 놓아 지식베이스에 추가하세요" 문구와 함께 부드러운 애니메이션 적용.
2.  **파일 시각화**:
    *   파일 확장자(PDF, TXT, DOC)별로 **고유한 컬러 아이콘** 사용.
    *   **문서 처리 상태(Status)**를 `Process Bar` 형태로 시각화 (Embedding 중... 45%).
3.  **검색 및 정렬 최적화**:
    *   데이터 테이블(Table) 뷰와 그리드(Grid) 뷰 제공.
    *   테이블 뷰에서는 **토큰 수**, **청크 수** 등 상세 기술 데이터를 컬럼으로 제공.
    *   필터 사이드바를 도입하여 태그/날짜/타입별 정밀 필터링 지원.

---

## 3. 실행 계획 (Action Plan)

1.  **공통 컴포넌트 고도화 (`@shared/components`)**:
    *   `GlassCard`, `AuroraBackground`, `ModernTab` 등 디자인 시스템 컴포넌트 추가.
2.  **Layout Refactoring**:
    *   `TopNavigation` 스타일 업데이트.
3.  **Page-by-Page Update**:
    *   Phase 1: `Marketplace` (가장 시각적 변화가 큰 곳).
    *   Phase 2: `Studio` (사용성 중심 개선).
    *   Phase 3: `Knowledge` (데이터 표현 개선).
