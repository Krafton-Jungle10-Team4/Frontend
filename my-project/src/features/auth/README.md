# Auth Feature

사용자 인증 및 권한 관리를 담당하는 Feature 모듈입니다. 로그인, 로그아웃, 인증 상태 관리 및 보호된 라우트 처리를 제공합니다.

## 📁 디렉토리 구조

```
auth/
├── __tests__/              # 단위 테스트
│   └── authStore.test.ts
├── api/                    # API 통신 레이어
│   └── authApi.ts
├── components/             # Auth 관련 컴포넌트
│   ├── LoginForm.tsx
│   ├── GoogleLoginButton.tsx
│   └── ProtectedRoute.tsx
├── hooks/                  # Custom hooks
│   ├── useAuth.ts
│   └── useLogin.ts
├── pages/                  # 페이지 컴포넌트
│   └── LoginPage.tsx
├── stores/                 # Zustand store
│   └── authStore.ts
├── types/                  # TypeScript 타입 정의
│   └── auth.types.ts
├── routes.tsx              # Auth Feature 라우트 정의
├── index.ts                # Public API
└── README.md
```

## 🎯 주요 기능

### 1. 인증 관리
- **로그인**: Google OAuth 및 이메일/비밀번호 로그인
- **로그아웃**: 세션 종료 및 상태 초기화
- **인증 상태 확인**: 로그인 여부 실시간 추적
- **토큰 관리**: Access Token 및 Refresh Token 관리

### 2. 라우트 보호
- **ProtectedRoute**: 인증된 사용자만 접근 가능한 라우트
- **자동 리다이렉트**: 미인증 시 로그인 페이지로 자동 이동
- **이전 경로 복원**: 로그인 후 원래 접근하려던 페이지로 복귀

### 3. 세션 관리
- **자동 로그인**: Local Storage를 활용한 세션 유지
- **자동 로그아웃**: 토큰 만료 시 자동 로그아웃
- **세션 갱신**: Refresh Token을 통한 세션 연장

## 📦 Public API

### Components
```typescript
import {
  LoginForm,           // 로그인 폼 컴포넌트
  GoogleLoginButton,   // Google OAuth 버튼
  ProtectedRoute       // 보호된 라우트 래퍼
} from '@/features/auth';
```

### Hooks
```typescript
import {
  useAuth,      // 인증 상태 및 액션
  useLogin      // 로그인 로직
} from '@/features/auth';
```

### Store
```typescript
import {
  useAuthStore  // Auth store hook
} from '@/features/auth';
```

### Types
```typescript
import type {
  User,         // 사용자 엔티티
  AuthState,    // Auth store 상태
  LoginDto,     // 로그인 요청 DTO
  LoginResponse // 로그인 응답 타입
} from '@/features/auth';
```

### Pages
```typescript
import {
  LoginPage     // 로그인 페이지
} from '@/features/auth';
```

## 🔗 라우트

Auth Feature는 다음 라우트를 제공합니다:

```typescript
/login         → LoginPage (로그인)
```

## 🪝 Custom Hooks 사용 예시

### useAuth
```typescript
function ProfileButton() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <Link to="/login">Login</Link>;
  }

  return (
    <div>
      <span>Hello, {user?.name}</span>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### useLogin
```typescript
function LoginComponent() {
  const { login, isLoading, error } = useLogin();

  const handleSubmit = async (email: string, password: string) => {
    try {
      await login({ email, password });
      // 로그인 성공 시 자동으로 리다이렉트
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 폼 필드 */}
      {error && <p>{error}</p>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

## 🏪 Store 사용 예시

### 기본 사용
```typescript
function AuthStatus() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Logged in as {user?.email}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <p>Not logged in</p>
      )}
    </div>
  );
}
```

### 로딩 및 에러 상태 처리
```typescript
function LoginStatus() {
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;

  return <LoginForm />;
}
```

## 🛡️ ProtectedRoute 사용

### 기본 사용법
```typescript
import { ProtectedRoute } from '@/features/auth';
import { DashboardLayout } from '@/widgets/layouts/DashboardLayout';

// Router 설정
{
  element: <ProtectedRoute />,
  children: [
    {
      path: '/dashboard',
      element: <DashboardLayout />,
    },
  ],
}
```

### 커스텀 리다이렉트
```typescript
<ProtectedRoute redirectTo="/custom-login">
  <PrivatePage />
</ProtectedRoute>
```

### 권한 기반 라우팅
```typescript
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>
```

## 🧪 테스트

### 테스트 실행
```bash
# Auth Feature 테스트만 실행
npm test -- auth

# Watch mode
npm test -- auth --watch

# Coverage
npm test -- auth --coverage
```

### 테스트 구조
- **authStore.test.ts**: Auth store의 모든 기능 테스트
  - 로그인/로그아웃
  - 인증 상태 관리
  - 에러 처리
  - 세션 유지

## 🔧 개발 가이드

### 새로운 인증 제공자 추가하기

1. **타입 정의** (`types/auth.types.ts`)
```typescript
export interface GithubLoginDto {
  code: string;
  redirectUri: string;
}
```

2. **API 함수 추가** (`api/authApi.ts`)
```typescript
export const authApi = {
  // ... 기존 함수들
  loginWithGithub: async (dto: GithubLoginDto): Promise<LoginResponse> => {
    const { data } = await apiClient.post('/auth/github', dto);
    return data;
  },
};
```

3. **Hook 추가** (`hooks/useGithubLogin.ts`)
```typescript
export function useGithubLogin() {
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);

  return useCallback(async (code: string) => {
    setLoading(true);
    try {
      const response = await authApi.loginWithGithub({
        code,
        redirectUri: window.location.origin,
      });
      setUser(response.user);
      localStorage.setItem('token', response.accessToken);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading]);
}
```

4. **컴포넌트 추가** (`components/GithubLoginButton.tsx`)
```typescript
export function GithubLoginButton() {
  const login = useGithubLogin();

  const handleLogin = () => {
    // Github OAuth 플로우 시작
    window.location.href = `https://github.com/login/oauth/authorize?...`;
  };

  return (
    <button onClick={handleLogin}>
      Login with Github
    </button>
  );
}
```

5. **Public API 노출** (`index.ts`)
```typescript
export { GithubLoginButton } from './components/GithubLoginButton';
export { useGithubLogin } from './hooks/useGithubLogin';
```

### 토큰 갱신 로직 구현

```typescript
// hooks/useTokenRefresh.ts
export function useTokenRefresh() {
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return;

    const interval = setInterval(async () => {
      try {
        const response = await authApi.refreshToken(refreshToken);
        setUser(response.user);
        localStorage.setItem('token', response.accessToken);
      } catch (error) {
        // Refresh 실패 시 로그아웃
        logout();
      }
    }, 14 * 60 * 1000); // 14분마다 갱신

    return () => clearInterval(interval);
  }, [setUser, logout]);
}
```

### 주의사항

⚠️ **보안**
- 토큰은 반드시 httpOnly 쿠키 또는 안전한 저장소에 보관
- 민감한 정보는 로그에 남기지 않기
- HTTPS 환경에서만 운영
- XSS/CSRF 공격 방어

⚠️ **에러 처리**
- 네트워크 에러와 인증 에러 구분
- 사용자 친화적인 에러 메시지 제공
- 재시도 로직 구현

⚠️ **세션 관리**
- 토큰 만료 시간 추적
- 자동 로그아웃 구현
- 탭 간 세션 동기화

## 🔐 보안 가이드

### Token 저장
```typescript
// ✅ 좋은 예
localStorage.setItem('token', accessToken);
// httpOnly 쿠키 사용 권장

// ❌ 나쁜 예
window.token = accessToken; // 전역 변수에 저장
```

### API 요청 인증
```typescript
// shared/api/client.ts
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 자동 로그아웃
```typescript
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## 📚 관련 문서

- [전체 아키텍처 문서](../../ARCHITECTURE.md)
- [API 명세](./api/README.md)
- [보안 가이드](../../SECURITY.md)
- [테스트 가이드](../../TESTING.md)

## 🤝 기여하기

1. Feature 브랜치 생성 (`feature/auth-new-feature`)
2. 변경사항 커밋
3. 테스트 작성 및 실행
4. Pull Request 생성

---

**Last Updated**: 2025-11-03
**Maintainer**: Frontend Team
