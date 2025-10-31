# Components

이 폴더는 재사용 가능한 컴포넌트들을 포함합니다.

## 구조

- `common/`: 프로젝트 전체에서 사용되는 공통 컴포넌트
  - Button, Input, Modal 등
- `features/`: 특정 기능에 종속된 컴포넌트
  - 인증(auth), 프로필(profile) 등

## 네이밍 규칙

- **파일명**: `PascalCase.tsx`
- **폴더명**: `PascalCase/`
- **CSS 모듈**: `ComponentName.module.css`

## 예시

### common 컴포넌트

```typescript
// src/components/common/Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

export const Button = ({ children, variant = 'primary', onClick }: ButtonProps) => {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
};
```

**사용 예시**:
```typescript
import { Button } from '@components/common/Button';

<Button variant="primary" onClick={handleClick}>
  클릭하세요
</Button>
```

### features 컴포넌트

```typescript
// src/components/features/auth/LoginForm.tsx
import { Button } from '@components/common/Button';

export const LoginForm = () => {
  return (
    <form>
      <input type="email" placeholder="이메일" />
      <input type="password" placeholder="비밀번호" />
      <Button type="submit">로그인</Button>
    </form>
  );
};
```

**사용 예시**:
```typescript
import { LoginForm } from '@components/features/auth/LoginForm';

<LoginForm />
```

## 작성 가이드

### 1. Props 타입 정의
모든 컴포넌트는 명확한 Props 타입을 정의해야 합니다.

```typescript
interface ComponentProps {
  // 필수 props
  title: string;
  // 선택적 props
  description?: string;
  // 함수 props
  onSubmit?: (data: FormData) => void;
}
```

### 2. 기본 export vs named export
- **common**: named export 사용 (여러 컴포넌트를 한 파일에서 import 가능)
- **features**: default export 또는 named export 모두 가능

### 3. 컴포넌트 구조
```typescript
// 1. import 구문
import React from 'react';
import { useCustomHook } from '@hooks/useCustomHook';

// 2. 타입 정의
interface Props {
  // ...
}

// 3. 컴포넌트 정의
export const Component = ({ prop1, prop2 }: Props) => {
  // 4. hooks
  const [state, setState] = useState();

  // 5. 함수 정의
  const handleClick = () => {
    // ...
  };

  // 6. JSX 반환
  return (
    <div>
      {/* ... */}
    </div>
  );
};
```

## 주의사항

- ✅ 단일 책임 원칙: 컴포넌트는 하나의 역할만 수행해야 합니다
- ✅ 재사용성: common 컴포넌트는 특정 기능에 종속되지 않아야 합니다
- ✅ Props drilling 방지: 너무 깊은 props 전달은 Context나 상태관리 라이브러리 사용 고려
- ❌ 비즈니스 로직 포함 지양: 컴포넌트는 UI 렌더링에 집중하고, 로직은 hooks나 utils로 분리
