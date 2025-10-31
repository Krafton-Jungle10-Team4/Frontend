# Types

이 폴더는 TypeScript 타입 정의 파일들을 포함합니다.

## 개념

**Types 폴더**는 프로젝트 전반에서 사용되는 **공통 타입, 인터페이스, Enum** 등을 정의하는 곳입니다.

## 네이밍 규칙

- **파일명**: `camelCase.ts` 또는 도메인별 그룹명 (예: `user.ts`, `product.ts`)
- **타입명**: `PascalCase` (interface, type, enum 모두)
- **접미사**:
  - DTO: `CreateUserDto`, `UpdateUserDto`
  - Response: `UserResponse`, `ApiResponse`
  - Props: `ButtonProps`, `ModalProps` (컴포넌트 Props는 해당 컴포넌트 파일에 정의 가능)

## 예시

### 1. User 타입

```typescript
// src/types/user.ts

/**
 * 사용자 기본 정보
 */
export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

/**
 * 사용자 역할
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}

/**
 * 사용자 생성 DTO
 */
export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
}

/**
 * 사용자 수정 DTO (모든 필드 선택적)
 */
export interface UpdateUserDto {
  email?: string;
  name?: string;
  password?: string;
}

/**
 * 사용자 프로필 (비밀번호 제외)
 */
export type UserProfile = Omit<User, 'password'>;
```

### 2. API Response 공통 타입

```typescript
// src/types/api.ts

/**
 * API 응답 공통 구조
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

/**
 * 페이지네이션 응답
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * API 에러 응답
 */
export interface ApiError {
  success: false;
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
```

**사용 예시**:
```typescript
import type { ApiResponse, PaginatedResponse } from '@types/api';
import type { User } from '@types/user';

// API 함수에서 사용
const getUsers = async (): Promise<ApiResponse<User[]>> => {
  // ...
};

const getUsersPaginated = async (): Promise<PaginatedResponse<User>> => {
  // ...
};
```

### 3. Product 타입

```typescript
// src/types/product.ts

/**
 * 상품 카테고리
 */
export enum ProductCategory {
  ELECTRONICS = 'electronics',
  CLOTHING = 'clothing',
  FOOD = 'food',
  BOOKS = 'books',
}

/**
 * 상품 정보
 */
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  stock: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 상품 필터 (검색/정렬용)
 */
export interface ProductFilter {
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * 상품 생성 DTO
 */
export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  stock: number;
  images?: File[];
}
```

### 4. Auth 타입

```typescript
// src/types/auth.ts

/**
 * 로그인 DTO
 */
export interface LoginDto {
  email: string;
  password: string;
}

/**
 * 회원가입 DTO
 */
export interface RegisterDto {
  email: string;
  name: string;
  password: string;
  passwordConfirm: string;
}

/**
 * 인증 응답
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

/**
 * JWT 토큰 페이로드
 */
export interface JwtPayload {
  sub: number; // user id
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}
```

### 5. 공통 유틸리티 타입

```typescript
// src/types/common.ts

/**
 * ID 타입 (숫자 또는 문자열)
 */
export type ID = number | string;

/**
 * 선택적 필드 (Partial의 반대)
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * 필수 필드 (Required의 특정 키만)
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * 날짜 문자열 (ISO 8601)
 */
export type DateString = string;

/**
 * 비어있지 않은 배열
 */
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * 값들의 Union 타입 추출
 */
export type ValueOf<T> = T[keyof T];
```

**사용 예시**:
```typescript
import type { Optional, RequiredFields } from '@types/common';

// email만 필수, 나머지는 선택적
type UserUpdate = Optional<User, 'name' | 'role'>;

// name과 email은 반드시 필수
type UserCreate = RequiredFields<User, 'name' | 'email'>;
```

### 6. Form 타입

```typescript
// src/types/form.ts

/**
 * 입력 필드 상태
 */
export interface FieldState<T> {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

/**
 * 폼 상태
 */
export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

/**
 * 입력 필드 Props
 */
export interface InputFieldProps {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}
```

### 7. 컴포넌트 공통 Props

```typescript
// src/types/component.ts

/**
 * 기본 컴포넌트 Props
 */
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * 버튼 변형
 */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

/**
 * 버튼 크기
 */
export type ButtonSize = 'small' | 'medium' | 'large';

/**
 * 모달 Props
 */
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  footer?: React.ReactNode;
}

/**
 * 테이블 컬럼 정의
 */
export interface TableColumn<T> {
  key: keyof T;
  title: string;
  width?: number;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  sortable?: boolean;
}
```

## 작성 가이드

### 1. Interface vs Type

```typescript
// ✅ Interface: 객체 형태, 확장 가능
export interface User {
  id: number;
  name: string;
}

export interface Admin extends User {
  permissions: string[];
}

// ✅ Type: Union, 유틸리티 타입, 복잡한 타입
export type UserRole = 'admin' | 'user' | 'guest';
export type UserOrNull = User | null;
export type PartialUser = Partial<User>;
```

### 2. Enum vs Union Type

```typescript
// ✅ Enum: 명확한 값 매핑, 런타임 존재
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

// ✅ Union Type: 타입 체킹만, 런타임 존재하지 않음 (더 가벼움)
export type UserRole = 'admin' | 'user';

// 💡 상황에 따라 선택:
// - Enum: API 응답 값과 매핑, 역방향 조회 필요시
// - Union: 단순 문자열 리터럴, 타입 체킹만 필요시
```

### 3. DTO 네이밍 컨벤션

```typescript
// ✅ 좋은 예: 명확한 네이밍
export interface CreateUserDto { /* ... */ }
export interface UpdateUserDto { /* ... */ }
export interface UserResponse { /* ... */ }

// ❌ 나쁜 예: 모호한 네이밍
export interface UserData { /* ... */ }
export interface UserInfo { /* ... */ }
```

### 4. 제네릭 활용

```typescript
// ✅ 재사용 가능한 제네릭 타입
export interface ApiResponse<T> {
  data: T;
  message: string;
}

// 사용
const userResponse: ApiResponse<User> = { /* ... */ };
const productResponse: ApiResponse<Product[]> = { /* ... */ };
```

### 5. JSDoc 주석 작성

```typescript
/**
 * 사용자 정보
 * @property {number} id - 사용자 ID
 * @property {string} email - 이메일 주소
 * @property {UserRole} role - 사용자 역할
 */
export interface User {
  id: number;
  email: string;
  role: UserRole;
}
```

## 폴더 구조 예시

```
types/
├── user.ts              # 사용자 관련 타입
├── product.ts           # 상품 관련 타입
├── auth.ts              # 인증 관련 타입
├── api.ts               # API 공통 타입
├── form.ts              # 폼 관련 타입
├── component.ts         # 컴포넌트 공통 타입
└── common.ts            # 공통 유틸리티 타입
```

## TypeScript 유틸리티 타입

```typescript
// 내장 유틸리티 타입 활용 예시

// Partial: 모든 필드를 선택적으로
type PartialUser = Partial<User>;

// Required: 모든 필드를 필수로
type RequiredUser = Required<User>;

// Pick: 특정 필드만 선택
type UserBasic = Pick<User, 'id' | 'name'>;

// Omit: 특정 필드 제외
type UserWithoutPassword = Omit<User, 'password'>;

// Record: 키-값 쌍 정의
type UserMap = Record<number, User>;

// Readonly: 읽기 전용
type ReadonlyUser = Readonly<User>;
```

## 주의사항

- ✅ 타입은 명확하고 구체적으로 정의
- ✅ 공통으로 사용되는 타입만 types 폴더에 정의
- ✅ 도메인별로 파일 분리
- ✅ JSDoc 주석으로 설명 추가
- ❌ `any` 타입 사용 지양 (`unknown` 사용 고려)
- ❌ 한 파일에 너무 많은 타입 정의 지양
- ❌ 컴포넌트 전용 Props는 해당 컴포넌트 파일에 정의 (types 폴더 X)
