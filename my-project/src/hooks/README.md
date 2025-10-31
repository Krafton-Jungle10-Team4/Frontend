# Hooks

이 폴더는 커스텀 React Hooks를 포함합니다.

## 개념

**Custom Hook**은 React의 기본 hooks(useState, useEffect 등)를 조합하여 **재사용 가능한 로직**을 만드는 함수입니다.

## 네이밍 규칙

- **파일명**: `use[HookName].ts` 또는 `use[HookName].tsx`
- **함수명**: `use`로 시작 (React 규칙)

## 예시

### 1. API 호출 Hook

```typescript
// src/hooks/useApi.ts
import { useState, useEffect } from 'react';

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export const useApi = <T>(url: string): UseApiResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};
```

**사용 예시**:
```typescript
import { useApi } from '@hooks/useApi';

const ProductList = () => {
  const { data, loading, error } = useApi<Product[]>('/api/products');

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error.message}</div>;

  return (
    <ul>
      {data?.map(product => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
};
```

### 2. LocalStorage Hook

```typescript
// src/hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  // LocalStorage에서 초기값 가져오기
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // 값 변경 시 LocalStorage 업데이트
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
};
```

**사용 예시**:
```typescript
import { useLocalStorage } from '@hooks/useLocalStorage';

const Settings = () => {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      현재 테마: {theme}
    </button>
  );
};
```

### 3. Form 관리 Hook

```typescript
// src/hooks/useForm.ts
import { useState, ChangeEvent, FormEvent } from 'react';

interface UseFormReturn<T> {
  values: T;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (onSubmit: (values: T) => void) => (e: FormEvent) => void;
  resetForm: () => void;
}

export const useForm = <T extends Record<string, any>>(
  initialValues: T
): UseFormReturn<T> => {
  const [values, setValues] = useState<T>(initialValues);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (onSubmit: (values: T) => void) => (e: FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  const resetForm = () => {
    setValues(initialValues);
  };

  return { values, handleChange, handleSubmit, resetForm };
};
```

**사용 예시**:
```typescript
import { useForm } from '@hooks/useForm';

const LoginForm = () => {
  const { values, handleChange, handleSubmit } = useForm({
    email: '',
    password: '',
  });

  const onSubmit = (data: typeof values) => {
    console.log('로그인 데이터:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        name="email"
        value={values.email}
        onChange={handleChange}
        placeholder="이메일"
      />
      <input
        name="password"
        type="password"
        value={values.password}
        onChange={handleChange}
        placeholder="비밀번호"
      />
      <button type="submit">로그인</button>
    </form>
  );
};
```

### 4. 윈도우 크기 감지 Hook

```typescript
// src/hooks/useWindowSize.ts
import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

export const useWindowSize = (): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    // cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};
```

**사용 예시**:
```typescript
import { useWindowSize } from '@hooks/useWindowSize';

const ResponsiveComponent = () => {
  const { width } = useWindowSize();

  return (
    <div>
      {width < 768 ? '모바일 뷰' : '데스크톱 뷰'}
    </div>
  );
};
```

## 작성 가이드

### 1. Hook 작성 규칙
- ✅ 함수명은 반드시 `use`로 시작
- ✅ React hooks 규칙 준수 (조건문 안에서 호출 금지 등)
- ✅ TypeScript 제네릭을 활용하여 재사용성 향상
- ✅ cleanup 함수 작성 (useEffect 정리)

### 2. Hook의 책임 범위
```typescript
// ✅ 좋은 예: 단일 책임
export const useAuth = () => {
  // 인증 관련 로직만 담당
};

// ❌ 나쁜 예: 여러 책임
export const useEverything = () => {
  // 인증, API 호출, 폼 관리 등 모든 것을 담당
};
```

### 3. 반환 타입 명시
```typescript
// ✅ 명확한 반환 타입
export const useCounter = (initialValue: number): [number, () => void, () => void] => {
  // ...
  return [count, increment, decrement];
};

// 또는 객체 반환 (추천)
export const useCounter = (initialValue: number) => {
  // ...
  return { count, increment, decrement };
};
```

## 폴더 구조 예시

```
hooks/
├── useApi.ts              # API 호출
├── useAuth.ts             # 인증
├── useForm.ts             # 폼 관리
├── useLocalStorage.ts     # LocalStorage
├── useWindowSize.ts       # 윈도우 크기
└── useDebounce.ts         # 디바운스
```

## 주의사항

- ✅ 재사용 가능한 로직만 Hook으로 분리
- ✅ 하나의 Hook은 하나의 책임만
- ✅ TypeScript 타입 명시로 안전성 확보
- ❌ 불필요한 Hook 생성 지양 (한 번만 쓰이는 로직은 컴포넌트 내부에)
- ❌ Hook 안에서 다른 Hook을 조건부로 호출하지 않기
