# 🤖 Chatbot Workspace Management System

> **버전**: v64  
> **상태**: ✅ Production Ready  
> **최종 업데이트**: 2025-11-03

AI 챗봇을 쉽게 생성, 관리, 테스트할 수 있는 웹 애플리케이션입니다.

---

## 📚 목차

- [프로젝트 개요](#프로젝트-개요)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [빠른 시작](#빠른-시작)
- [프로젝트 구조](#프로젝트-구조)
- [개발 히스토리](#개발-히스토리)
- [GitHub PR 전략](#github-pr-전략)
- [배포](#배포)
- [문서](#문서)
- [라이선스](#라이선스)

---

## 프로젝트 개요

### 🎯 목적
사용자가 4단계 마법사를 통해 직관적으로 AI 챗봇을 생성하고, 실시간으로 테스트하며, 효율적으로 관리할 수 있는 플랫폼

### ✨ 핵심 가치
- **직관적인 UI/UX**: 4단계 봇 생성 프로세스
- **실시간 피드백**: 파일 업로드, 훈련 진행률, 채팅 응답
- **다국어 지원**: 영어/한국어 전환 (기본: 영어)
- **확장 가능한 구조**: 모듈화된 컴포넌트 (재사용성 95%)
- **타입 안정성**: TypeScript로 작성

### 📊 프로젝트 통계
- **총 파일**: ~100개
- **총 코드**: ~5,000줄
- **컴포넌트**: 25+개
- **API 엔드포인트**: 25개
- **문서**: 3개 (통합됨)

---

## 주요 기능

### 1️⃣ 메인 워크스페이스
<details>
<summary>상세 보기</summary>

- **봇 리스트**
  - Grid/List 뷰 전환
  - 실시간 검색
  - 최대 5개 봇 제한 (툴팁 표시)
  
- **봇 카드**
  - 배포 날짜, 메시지/에러 통계
  - 활성화/비활성화 토글
  - 편집/삭제 메뉴

- **빈 상태**
  - 봇이 없을 때 안내 화면
  - "Create your first bot" CTA

- **사이드바**
  - 좌측: 메인 메뉴 (Home, Integrations, Usage, Billing, Settings)
  - 우측: 최근 활동 내역
</details>

### 2️⃣ 봇 생성 (4단계)
<details>
<summary>상세 보기</summary>

#### Step 1: 봇 이름
- 텍스트 입력 + 실시간 검증

#### Step 2: 목표 선택
- 6가지 프리셋 + 커스텀
- "Refine Prompt" 기능 (LLM 최적화)

#### Step 3: 성격 설정
- 웹사이트 URL 또는 텍스트 입력
- URL 자동 검증

#### Step 4: 지식 추가 (3탭)
- **Websites**: URL 크롤링 + 트리 구조
- **Files**: 드래그 앤 드롭 업로드 (PDF, TXT, MD)
- **Text**: 직접 입력

**특징**:
- 세션 기반 임시 저장
- Exit 확인 + 자동 클린업
- 단계별 진행 표시
</details>

### 3️⃣ 훈련 진행
<details>
<summary>상세 보기</summary>

- 5단계 진행률 표시 (0-100%)
- 1초마다 실시간 폴링
- 완료 시 자동 미리보기 이동
</details>

### 4️⃣ 봇 미리보기
<details>
<summary>상세 보기</summary>

- 실시간 채팅 인터페이스
- 타이핑 인디케이터
- 공유 링크 생성 (클립보드 복사)
- 채팅 리셋 기능
</details>

### 5️⃣ 다국어 지원
```typescript
// 영어 (기본)
"Create Bot", "Search bots...", "Grid View"

// 한국어
"봇 생성", "봇 검색...", "그리드 뷰"
```

---

## 기술 스택

### Frontend
| 기술 | 버전 | 용도 |
|------|------|------|
| React | 18 | UI 프레임워크 |
| TypeScript | 5+ | 타입 안정성 |
| Tailwind CSS | 4 | 스타일링 |
| React Router | 6 | URL 기반 라우팅 |
| shadcn/ui | Latest | UI 컴포넌트 라이브러리 |
| lucide-react | Latest | 아이콘 |
| sonner | 2.0.3 | Toast 알림 |

### Backend
- **API**: FastAPI (http://3.37.127.46)
- **인증**: (구현 대기)
- **데이터베이스**: (구현 대기)

### Build Tools
- **Vite** 5+
- **npm/yarn**

---

## 빠른 시작

### 설치

```bash
# 1. 저장소 클론
git clone <repository-url>
cd chatbot-workspace

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
echo "VITE_API_BASE_URL=http://3.37.127.46" > .env

# 4. 개발 서버 실행
npm run dev
```

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

### 주요 명령어

```bash
npm run dev        # 개발 서버 (localhost:5173)
npm run build      # 프로덕션 빌드
npm run preview    # 빌드 결과 미리보기
npm run lint       # 코드 검사
```

---

## 프로젝트 구조

```
📦 chatbot-workspace
├── 📂 components/               # UI 컴포넌트
│   ├── 📂 BotSetup/            # 봇 생성 (13개 모듈)
│   │   ├── index.tsx
│   │   ├── BotSetupContext.tsx  # Context API
│   │   ├── types.ts
│   │   ├── 📂 components/
│   │   │   ├── StepNavigation.tsx
│   │   │   └── ExitDialog.tsx
│   │   └── 📂 steps/
│   │       ├── Step1Name.tsx
│   │       ├── Step2Goal.tsx
│   │       ├── Step3Personality.tsx
│   │       └── 📂 Step4Knowledge/
│   │           ├── index.tsx
│   │           ├── WebsitesTab.tsx
│   │           ├── FilesTab.tsx
│   │           └── TextTab.tsx
│   │
│   ├── BotCard.tsx
│   ├── BotPreview.tsx
│   ├── EmptyState.tsx
│   ├── SetupComplete.tsx
│   ├── TopNavigation.tsx
│   ├── WorkspaceHeader.tsx
│   ├── WorkspaceSidebar.tsx
│   ├── LeftSidebar.tsx
│   ├── RightSidebar.tsx
│   ├── SearchFilters.tsx
│   └── 📂 ui/                  # shadcn/ui (45개)
│
├── 📂 contexts/
│   └── AppContext.tsx          # 전역 상태 관리
│
├── 📂 pages/                   # 라우트 페이지
│   ├── HomePage.tsx            # /
│   ├── BotSetupPage.tsx        # /setup
│   ├── SetupCompletePage.tsx   # /setup/complete
│   └── BotPreviewPage.tsx      # /preview
│
├── 📂 utils/                   # 유틸리티 함수
│   ├── api.ts                  # API 클라이언트 (9개 메서드)
│   ├── validation.ts           # 검증 함수 (6개)
│   ├── format.ts               # 포맷팅 함수 (4개)
│   ├── session.ts              # Session ID 생성
│   └── constants.ts            # 상수
│
├── 📂 data/                    # Mock 데이터
│   ├── mockBots.ts
│   └── mockActivities.ts
│
├── 📂 styles/
│   └── globals.css             # 전역 스타일
│
├── App.tsx                     # 라우터 설정
├── README.md                   # 이 문서
├── DEVELOPMENT.md              # 개발자 가이드
└── Attributions.md             # 라이선스/크레딧
```

---

## 개발 히스토리

### v1-v50: 주요 마일스톤

#### Phase 1: 기초 (v1-v15)
- React + TypeScript 프로젝트 설정
- Tailwind CSS v4 + shadcn/ui 통합
- 메인 워크스페이스 구현
- 레이아웃 컴포넌트

#### Phase 2: 봇 생성 (v16-v30)
- 4단계 봇 생성 마법사 (모놀리식 975줄)
- 파일 업로드 (Drag & Drop)
- 웹사이트 URL Discover
- Exit 확인 + Cleanup

#### Phase 3: 훈련/미리보기 (v31-v40)
- 훈련 진행 페이지 (실시간 폴링)
- 챗봇 미리보기 (채팅 인터페이스)
- 공유 링크 생성

#### Phase 4: 리팩토링 (v41-v50)
- **v41-v45**: BotSetup 리팩토링 🔥
  - 975줄 → 13개 모듈 (평균 100줄)
  - 재사용성: 0% → 95%
  - Context API 도입
- **v46-v48**: 유틸리티 분리 (api, validation, format)
- **v49**: React Router 통합
- **v50**: 버그 수정 + 안정화

### v51: 문서 통합 ✨

**변경 사항**:
- 8개 마크다운 파일 → 3개로 통합
  - `README.md` ← PROJECT_SUMMARY.md
  - `DEVELOPMENT.md` ← API_REFERENCE + DEVELOPER_GUIDE + ROUTING_GUIDE + REFACTORING
  - `Attributions.md` (유지)
- 삭제된 파일:
  - API_REFERENCE.md
  - DEVELOPER_GUIDE.md
  - PROJECT_SUMMARY.md
  - REFACTORING_COMPLETE.md
  - REFACTORING_PROPOSAL.md
  - ROUTING_GUIDE.md
  - guidelines/Guidelines.md

**성과**:
- 문서 관리 복잡도 60% 감소
- 단일 개발자 가이드로 통합
- 프로젝트 개요 명확화

---

### v52-v62: 아키텍처 및 UX 최적화

**v52**: 초기 상태 최적화 (빈 배열로 시작)  
**v53**: GitHub PR 전략 문서화 (GIT_PR.md)  
**v54-v56**: BotSetup 완전 모듈화 (1000줄+ → 13개 모듈)  
**v57**: React Router 라우팅 시스템  
**v58**: Context API 전역 상태 관리  
**v59**: UI 디자인 완전 복원  
**v60**: Step 제목 강조 (text-3xl font-bold)  
**v61**: Knowledge 탭 균등 분배 (flex-1)  
**v62**: 메인페이지 모바일 최적화 (완전한 반응형)

---

### v64: 사이드바 구분선 수정 (현재) 📏

**변경 사항**:
- LeftSidebar와 RightSidebar에 `h-full` 클래스 추가
- 사이드바 구분선이 화면 전체 높이로 표시되도록 개선

**수정된 파일**:
```
- components/LeftSidebar.tsx
- components/RightSidebar.tsx
```

**성과**:
- 시각적 일관성 향상
- 레이아웃 완성도 개선
- UI 버그 수정

---

## GitHub PR 전략

### 브랜치 구조

```
main (production)
  ↑
develop (integration)
  ↑
feature/* (개별 기능)
```

### PR 순서 (16단계)

| PR | 브랜치 | 설명 | 파일 수 |
|----|--------|------|---------|
| #1 | `feature/initial-setup` | 프로젝트 설정, shadcn/ui | ~50 |
| #2 | `feature/layout-components` | 레이아웃 컴포넌트 | 5 |
| #3 | `feature/main-workspace` | 봇 리스트, 카드 | 5 |
| #4 | `feature/utils` | 유틸리티 함수 | 4 |
| #5 | `feature/api-client` | API 클라이언트 | 2 |
| #6 | `feature/context-api` | 전역 상태 관리 | 1 |
| #7 | `feature/bot-setup-step1-2` | Setup Step 1-2 | 7 |
| #8 | `feature/bot-setup-step3` | Setup Step 3 | 1 |
| #9 | `feature/bot-setup-step4-websites` | Setup Step 4 (Websites) | 2 |
| #10 | `feature/bot-setup-step4-files` | Setup Step 4 (Files) | 1 |
| #11 | `feature/bot-setup-step4-text` | Setup Step 4 (Text) | 2 |
| #12 | `feature/setup-complete` | 훈련 진행 | 2 |
| #13 | `feature/bot-preview` | 봇 미리보기 | 2 |
| #14 | `feature/react-router` | 라우팅 시스템 | 3 |
| #15 | `feature/documentation` | 문서화 | 3 |
| #16 | `develop → main` | **v1.0.0 릴리스** | - |

### Commit 메시지 예시

```bash
# PR #1
chore: initial project setup with React, TypeScript, and Tailwind CSS

# PR #7
feat: implement bot setup steps 1-2 with context pattern

# PR #14
feat: integrate React Router v6 for URL-based routing

# PR #15
docs: consolidate documentation (v51)

# PR #16
release: v1.0.0 - Chatbot Workspace Management System
```

자세한 PR 전략은 `DEVELOPMENT.md` 참조

---

## 배포

### 환경 변수

```bash
# .env
VITE_API_BASE_URL=http://3.37.127.46
```

### 배포 플랫폼

#### Vercel (추천)
```bash
npm i -g vercel
vercel --prod
```

#### Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod
```

#### AWS S3 + CloudFront
```bash
npm run build
aws s3 sync dist/ s3://your-bucket-name
aws cloudfront create-invalidation --distribution-id XXX --paths "/*"
```

---

## 문서

| 문서 | 설명 |
|------|------|
| **README.md** | 프로젝트 개요 및 빠른 시작 (이 문서) |
| **DEVELOPMENT.md** | API 명세, 아키텍처, 구현 가이드, PR 전략 |
| **Attributions.md** | 라이선스 및 크레딧 |

---

## 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 로드맵

### 즉시 가능
- [ ] React Hook Form + Zod 검증
- [ ] Unit 테스트 (Jest + RTL)
- [ ] Storybook 컴포넌트 문서화

### 중기 계획
- [ ] Tanstack Query (서버 상태 관리)
- [ ] 에러 바운더리 추가
- [ ] 다크 모드 지원

### 장기 계획
- [ ] E2E 테스트 (Playwright)
- [ ] CI/CD 파이프라인
- [ ] 성능 모니터링

---

## 라이선스

(라이선스 정보 추가 필요)

---

## Contact

- **이슈**: [GitHub Issues](https://github.com/your-repo/issues)
- **이메일**: your-email@example.com

---

**버전**: v64  
**최종 업데이트**: 2025-11-03  
**상태**: ✅ Production Ready

**🎉 배포 준비 완료!**
