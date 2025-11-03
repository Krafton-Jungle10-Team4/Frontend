# Styles

이 폴더는 전역 스타일, 공통 스타일, 테마 설정을 포함합니다.

## 개념

**Styles 폴더**는 **프로젝트 전반에 적용되는 CSS/SCSS** 파일들을 관리하며, 일관된 디자인 시스템을 유지합니다.

## 네이밍 규칙

- **파일명**: `camelCase.css` 또는 `_파일명.scss` (SCSS partial)
- **클래스명**: `kebab-case` 또는 BEM 방식

## 디렉토리 구조 예시

```
styles/
├── global.css             # 전역 스타일 (reset, 기본 요소)
├── variables.css          # CSS 변수 정의
├── mixins.scss            # SCSS mixin (재사용 스타일 함수)
├── theme.css              # 테마 설정 (light/dark)
├── animations.css         # 애니메이션 정의
└── utilities.css          # 유틸리티 클래스
```

## 예시

### 1. 전역 스타일

```css
/* src/styles/global.css */

/* CSS Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 기본 타이포그래피 */
body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
    'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-primary);
  background-color: var(--bg-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 1rem;
}

h1 {
  font-size: 2.5rem;
}
h2 {
  font-size: 2rem;
}
h3 {
  font-size: 1.75rem;
}
h4 {
  font-size: 1.5rem;
}
h5 {
  font-size: 1.25rem;
}
h6 {
  font-size: 1rem;
}

a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color 0.2s;
}

a:hover {
  color: var(--color-primary-dark);
}

/* 스크롤바 스타일 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}
```

### 2. CSS 변수

```css
/* src/styles/variables.css */

:root {
  /* 컬러 시스템 */
  --color-primary: #3b82f6;
  --color-primary-dark: #2563eb;
  --color-primary-light: #60a5fa;

  --color-secondary: #10b981;
  --color-danger: #ef4444;
  --color-warning: #f59e0b;
  --color-info: #06b6d4;

  /* 그레이 스케일 */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;

  /* 텍스트 컬러 */
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;
  --text-inverse: #ffffff;

  /* 배경 컬러 */
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-tertiary: #f3f4f6;

  /* 보더 */
  --border-color: #e5e7eb;
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
  --border-radius-full: 9999px;

  /* 간격 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;

  /* 그림자 */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);

  /* 애니메이션 */
  --transition-fast: 150ms;
  --transition-normal: 300ms;
  --transition-slow: 500ms;

  /* z-index */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
}
```

### 3. 다크 테마

```css
/* src/styles/theme.css */

/* 다크 테마 */
[data-theme='dark'] {
  /* 텍스트 컬러 */
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --text-tertiary: #9ca3af;
  --text-inverse: #111827;

  /* 배경 컬러 */
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --bg-tertiary: #374151;

  /* 보더 */
  --border-color: #374151;
}

/* 테마 전환 애니메이션 */
* {
  transition:
    background-color var(--transition-normal),
    color var(--transition-normal),
    border-color var(--transition-normal);
}
```

**사용 예시 (React)**:

```typescript
const App = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      테마 변경
    </button>
  );
};
```

### 4. 유틸리티 클래스

```css
/* src/styles/utilities.css */

/* Flexbox */
.flex {
  display: flex;
}
.flex-col {
  flex-direction: column;
}
.items-center {
  align-items: center;
}
.justify-center {
  justify-content: center;
}
.justify-between {
  justify-content: space-between;
}
.gap-2 {
  gap: var(--spacing-sm);
}
.gap-4 {
  gap: var(--spacing-md);
}

/* Grid */
.grid {
  display: grid;
}
.grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}
.grid-cols-3 {
  grid-template-columns: repeat(3, 1fr);
}
.grid-cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

/* 간격 */
.m-0 {
  margin: 0;
}
.m-2 {
  margin: var(--spacing-sm);
}
.m-4 {
  margin: var(--spacing-md);
}
.p-0 {
  padding: 0;
}
.p-2 {
  padding: var(--spacing-sm);
}
.p-4 {
  padding: var(--spacing-md);
}

/* 텍스트 */
.text-center {
  text-align: center;
}
.text-left {
  text-align: left;
}
.text-right {
  text-align: right;
}
.font-bold {
  font-weight: 700;
}
.font-semibold {
  font-weight: 600;
}
.font-normal {
  font-weight: 400;
}

/* 색상 */
.text-primary {
  color: var(--color-primary);
}
.text-danger {
  color: var(--color-danger);
}
.bg-primary {
  background-color: var(--bg-primary);
}
.bg-secondary {
  background-color: var(--bg-secondary);
}

/* 보더 */
.border {
  border: 1px solid var(--border-color);
}
.border-0 {
  border: none;
}
.rounded-sm {
  border-radius: var(--border-radius-sm);
}
.rounded-md {
  border-radius: var(--border-radius-md);
}
.rounded-lg {
  border-radius: var(--border-radius-lg);
}
.rounded-full {
  border-radius: var(--border-radius-full);
}

/* 그림자 */
.shadow-sm {
  box-shadow: var(--shadow-sm);
}
.shadow-md {
  box-shadow: var(--shadow-md);
}
.shadow-lg {
  box-shadow: var(--shadow-lg);
}

/* 표시/숨김 */
.hidden {
  display: none;
}
.visible {
  visibility: visible;
}
.invisible {
  visibility: hidden;
}
```

### 5. 애니메이션

```css
/* src/styles/animations.css */

/* 페이드 인 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-in {
  animation: fadeIn var(--transition-normal) ease-in;
}

/* 슬라이드 인 */
@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.slide-in {
  animation: slideIn var(--transition-normal) ease-out;
}

/* 스핀 (로딩 아이콘) */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spin {
  animation: spin 1s linear infinite;
}

/* 펄스 (알림 뱃지) */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 바운스 */
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.bounce {
  animation: bounce 1s ease-in-out infinite;
}
```

### 6. SCSS Mixins (선택사항)

```scss
/* src/styles/mixins.scss */

// 반응형 미디어 쿼리
@mixin mobile {
  @media (max-width: 767px) {
    @content;
  }
}

@mixin tablet {
  @media (min-width: 768px) and (max-width: 1023px) {
    @content;
  }
}

@mixin desktop {
  @media (min-width: 1024px) {
    @content;
  }
}

// Flexbox 센터 정렬
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

// 말줄임표
@mixin truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 여러 줄 말줄임표
@mixin line-clamp($lines) {
  display: -webkit-box;
  -webkit-line-clamp: $lines;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

**사용 예시**:

```scss
.container {
  @include flex-center;

  @include mobile {
    flex-direction: column;
  }
}

.title {
  @include truncate;
}

.description {
  @include line-clamp(3);
}
```

## 스타일 import 순서 (main.tsx)

```typescript
// src/main.tsx
import './styles/variables.css'; // 1. 변수 먼저
import './styles/global.css'; // 2. 전역 스타일
import './styles/theme.css'; // 3. 테마
import './styles/utilities.css'; // 4. 유틸리티
import './styles/animations.css'; // 5. 애니메이션
```

## CSS Modules 사용 예시 (컴포넌트별 스타일)

```css
/* src/components/common/Button.module.css */
.button {
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--border-radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.button-primary {
  background-color: var(--color-primary);
  color: white;
}

.button-primary:hover {
  background-color: var(--color-primary-dark);
}

.button-secondary {
  background-color: var(--gray-200);
  color: var(--text-primary);
}
```

**사용 예시**:

```typescript
import styles from './Button.module.css';

export const Button = ({ variant = 'primary', children }) => {
  return (
    <button className={`${styles.button} ${styles[`button-${variant}`]}`}>
      {children}
    </button>
  );
};
```

## Tailwind CSS 사용 시

```css
/* src/styles/tailwind.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 커스텀 유틸리티 추가 */
@layer utilities {
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
}
```

## 작성 가이드

### 1. CSS 변수 활용

```css
/* ✅ 좋은 예: CSS 변수 사용 */
.button {
  background-color: var(--color-primary);
  padding: var(--spacing-md);
}

/* ❌ 나쁜 예: 하드코딩 */
.button {
  background-color: #3b82f6;
  padding: 16px;
}
```

### 2. 네이밍 컨벤션 (BEM)

```css
/* Block */
.card {
}

/* Element (블록 내부 요소) */
.card__header {
}
.card__body {
}
.card__footer {
}

/* Modifier (변형) */
.card--highlighted {
}
.card--disabled {
}
```

### 3. 컴포넌트 스타일 분리

```
✅ 컴포넌트별 스타일: CSS Modules 사용
   src/components/Button/Button.module.css

✅ 전역 스타일: styles 폴더
   src/styles/global.css
```

## 주의사항

- ✅ CSS 변수로 일관된 디자인 시스템 유지
- ✅ 컴포넌트 스타일은 CSS Modules 또는 styled-components 사용
- ✅ 전역 스타일은 최소화하고, 유틸리티 클래스 활용
- ✅ 반응형 디자인을 위한 미디어 쿼리 적극 활용
- ❌ `!important` 사용 지양
- ❌ 인라인 스타일 남용 지양
- ❌ 중복 스타일 정의 지양 (DRY 원칙)
