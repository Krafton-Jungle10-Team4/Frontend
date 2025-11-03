# Constants

이 폴더는 프로젝트 전반에서 사용되는 상수 값들을 포함합니다.

## 개념

**Constants 폴더**는 **하드코딩된 값을 중앙에서 관리**하여 유지보수성을 높이는 곳입니다.

## 네이밍 규칙

- **파일명**: `camelCase.ts` 또는 `UPPER_SNAKE_CASE.ts`
- **상수명**: `UPPER_SNAKE_CASE` (대문자 + 언더스코어)
- **객체명**: `PascalCase` 또는 `UPPER_SNAKE_CASE`

## 예시

### 1. API 엔드포인트

```typescript
// src/constants/apiEndpoints.ts

/**
 * API 엔드포인트 상수
 */
export const API_ENDPOINTS = {
  // 인증
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },

  // 사용자
  USERS: {
    LIST: '/users',
    DETAIL: (id: number) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id: number) => `/users/${id}`,
    DELETE: (id: number) => `/users/${id}`,
  },

  // 상품
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id: number) => `/products/${id}`,
    CREATE: '/products',
    UPDATE: (id: number) => `/products/${id}`,
    DELETE: (id: number) => `/products/${id}`,
    CATEGORIES: '/products/categories',
  },
} as const;
```

**사용 예시**:

```typescript
import { API_ENDPOINTS } from '@constants/apiEndpoints';
import { apiClient } from '@api/client';

// 사용자 목록 조회
const getUsers = () => apiClient.get(API_ENDPOINTS.USERS.LIST);

// 특정 사용자 조회
const getUser = (id: number) => apiClient.get(API_ENDPOINTS.USERS.DETAIL(id));
```

### 2. 라우트 경로

```typescript
// src/constants/routes.ts

/**
 * 앱 라우트 경로
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',

  // 사용자
  USER: {
    PROFILE: '/user/profile',
    SETTINGS: '/user/settings',
    DETAIL: (id: number) => `/user/${id}`,
  },

  // 상품
  PRODUCT: {
    LIST: '/products',
    DETAIL: (id: number) => `/products/${id}`,
    CREATE: '/products/new',
    EDIT: (id: number) => `/products/${id}/edit`,
  },

  // 관리자
  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    PRODUCTS: '/admin/products',
  },

  // 기타
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/401',
} as const;
```

**사용 예시**:

```typescript
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/routes';

const MyComponent = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate(ROUTES.LOGIN);
  };

  const viewProduct = (productId: number) => {
    navigate(ROUTES.PRODUCT.DETAIL(productId));
  };

  return <div>{/* ... */}</div>;
};
```

### 3. 로컬 스토리지 키

```typescript
// src/constants/storageKeys.ts

/**
 * LocalStorage 키
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_INFO: 'userInfo',
  THEME: 'theme',
  LANGUAGE: 'language',
  RECENT_SEARCHES: 'recentSearches',
} as const;

/**
 * SessionStorage 키
 */
export const SESSION_KEYS = {
  TEMP_DATA: 'tempData',
  FORM_STATE: 'formState',
} as const;
```

**사용 예시**:

```typescript
import { STORAGE_KEYS } from '@constants/storageKeys';

// 토큰 저장
localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);

// 토큰 조회
const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
```

### 4. 에러 메시지

```typescript
// src/constants/errorMessages.ts

/**
 * 에러 메시지
 */
export const ERROR_MESSAGES = {
  // 인증
  AUTH: {
    INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다',
    UNAUTHORIZED: '로그인이 필요합니다',
    TOKEN_EXPIRED: '세션이 만료되었습니다. 다시 로그인해주세요',
    PERMISSION_DENIED: '권한이 없습니다',
  },

  // 유효성 검증
  VALIDATION: {
    REQUIRED: (field: string) => `${field}은(는) 필수 항목입니다`,
    INVALID_EMAIL: '올바른 이메일 형식이 아닙니다',
    PASSWORD_MIN_LENGTH: '비밀번호는 최소 8자 이상이어야 합니다',
    PASSWORD_MISMATCH: '비밀번호가 일치하지 않습니다',
    INVALID_PHONE: '올바른 전화번호 형식이 아닙니다',
  },

  // 네트워크
  NETWORK: {
    CONNECTION_ERROR: '네트워크 연결을 확인해주세요',
    TIMEOUT: '요청 시간이 초과되었습니다',
    SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요',
  },

  // 일반
  COMMON: {
    UNKNOWN: '알 수 없는 오류가 발생했습니다',
    NOT_FOUND: '요청한 페이지를 찾을 수 없습니다',
  },
} as const;
```

**사용 예시**:

```typescript
import { ERROR_MESSAGES } from '@constants/errorMessages';

// 폼 유효성 검증
if (!email) {
  setError(ERROR_MESSAGES.VALIDATION.REQUIRED('이메일'));
}

if (!isValidEmail(email)) {
  setError(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL);
}
```

### 5. 성공 메시지

```typescript
// src/constants/successMessages.ts

/**
 * 성공 메시지
 */
export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN: '로그인되었습니다',
    LOGOUT: '로그아웃되었습니다',
    REGISTER: '회원가입이 완료되었습니다',
  },

  USER: {
    CREATED: '사용자가 생성되었습니다',
    UPDATED: '사용자 정보가 수정되었습니다',
    DELETED: '사용자가 삭제되었습니다',
  },

  PRODUCT: {
    CREATED: '상품이 등록되었습니다',
    UPDATED: '상품 정보가 수정되었습니다',
    DELETED: '상품이 삭제되었습니다',
  },

  COMMON: {
    SAVED: '저장되었습니다',
    COPIED: '클립보드에 복사되었습니다',
  },
} as const;
```

### 6. 앱 설정

```typescript
// src/constants/config.ts

/**
 * 앱 설정
 */
export const APP_CONFIG = {
  NAME: 'My Project',
  VERSION: '1.0.0',
  DESCRIPTION: '프로젝트 설명',

  // API 설정
  API: {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    TIMEOUT: 5000, // 5초
  },

  // 페이지네이션
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },

  // 파일 업로드
  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif'],
  },

  // 비밀번호 규칙
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 50,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true,
  },
} as const;
```

**사용 예시**:

```typescript
import { APP_CONFIG } from '@constants/config';

// 파일 크기 검증
if (file.size > APP_CONFIG.UPLOAD.MAX_FILE_SIZE) {
  alert('파일 크기는 5MB를 초과할 수 없습니다');
}

// 비밀번호 유효성 검증
if (password.length < APP_CONFIG.PASSWORD.MIN_LENGTH) {
  alert(
    `비밀번호는 최소 ${APP_CONFIG.PASSWORD.MIN_LENGTH}자 이상이어야 합니다`
  );
}
```

### 7. 정규표현식

```typescript
// src/constants/regex.ts

/**
 * 정규표현식 패턴
 */
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/,
  PASSWORD:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  NUMBER_ONLY: /^\d+$/,
  KOREAN: /^[가-힣]+$/,
} as const;
```

**사용 예시**:

```typescript
import { REGEX } from '@constants/regex';

const isValidEmail = (email: string) => REGEX.EMAIL.test(email);
const isValidPhone = (phone: string) => REGEX.PHONE.test(phone);
```

### 8. 날짜/시간 포맷

```typescript
// src/constants/dateFormats.ts

/**
 * 날짜 포맷
 */
export const DATE_FORMATS = {
  FULL: 'YYYY-MM-DD HH:mm:ss',
  DATE_ONLY: 'YYYY-MM-DD',
  TIME_ONLY: 'HH:mm:ss',
  DATETIME: 'YYYY-MM-DD HH:mm',
  KOREAN_DATE: 'YYYY년 MM월 DD일',
  KOREAN_DATETIME: 'YYYY년 MM월 DD일 HH시 mm분',
} as const;

/**
 * 시간 단위 (밀리초)
 */
export const TIME_UNITS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;
```

### 9. UI 상수

```typescript
// src/constants/ui.ts

/**
 * 브레이크포인트 (반응형)
 */
export const BREAKPOINTS = {
  MOBILE: 480,
  TABLET: 768,
  DESKTOP: 1024,
  WIDE: 1280,
} as const;

/**
 * Z-Index 레이어
 */
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
} as const;

/**
 * 애니메이션 지속 시간 (ms)
 */
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;
```

## 작성 가이드

### 1. `as const` 사용

```typescript
// ✅ 좋은 예: as const로 타입 안전성 확보
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
} as const;
// ROUTES.HOME의 타입: '/' (리터럴 타입)

// ❌ 나쁜 예: 일반 객체
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
};
// ROUTES.HOME의 타입: string (너무 넓은 타입)
```

### 2. 상수 그룹화

```typescript
// ✅ 좋은 예: 관련된 상수들을 객체로 그룹화
export const API_ENDPOINTS = {
  USERS: {
    /* ... */
  },
  PRODUCTS: {
    /* ... */
  },
} as const;

// ❌ 나쁜 예: 개별 상수로 흩어져 있음
export const USERS_LIST = '/users';
export const USERS_DETAIL = '/users/:id';
export const PRODUCTS_LIST = '/products';
```

### 3. 환경변수와 상수 분리

```typescript
// ✅ 환경변수는 .env에서 가져오기
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL,
  TIMEOUT: 5000, // 고정 상수
} as const;
```

### 4. 매직 넘버/문자열 제거

```typescript
// ❌ 나쁜 예: 하드코딩된 값
if (file.size > 5242880) {
  // 5MB
  alert('파일이 너무 큽니다');
}

// ✅ 좋은 예: 상수 사용
import { APP_CONFIG } from '@constants/config';

if (file.size > APP_CONFIG.UPLOAD.MAX_FILE_SIZE) {
  alert('파일이 너무 큽니다');
}
```

## 폴더 구조 예시

```
constants/
├── apiEndpoints.ts        # API 엔드포인트
├── routes.ts              # 라우트 경로
├── storageKeys.ts         # 스토리지 키
├── errorMessages.ts       # 에러 메시지
├── successMessages.ts     # 성공 메시지
├── config.ts              # 앱 설정
├── regex.ts               # 정규표현식
├── dateFormats.ts         # 날짜 포맷
└── ui.ts                  # UI 상수
```

## 주의사항

- ✅ 반복되는 하드코딩 값은 상수로 분리
- ✅ `as const`로 타입 안전성 확보
- ✅ 의미 있는 상수명 사용 (UPPER_SNAKE_CASE)
- ✅ 관련된 상수는 객체로 그룹화
- ❌ 한 번만 사용하는 값까지 상수로 만들지 않기
- ❌ 환경변수를 직접 하드코딩하지 않기
