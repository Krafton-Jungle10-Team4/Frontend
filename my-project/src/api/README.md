# API

이 폴더는 백엔드 API 통신 로직을 포함합니다.

## 개념

API 폴더는 **서버와의 데이터 통신을 담당**하며, HTTP 요청을 추상화하여 재사용 가능한 함수로 제공합니다.

## 네이밍 규칙

- **파일명**: `camelCase.ts` 또는 도메인별 그룹명 (예: `userApi.ts`, `productApi.ts`)
- **함수명**: HTTP 메서드 기반 (예: `getUsers`, `createProduct`, `updateProfile`)

## 디렉토리 구조 예시

```
api/
├── client.ts              # Axios/Fetch 클라이언트 설정
├── userApi.ts             # 사용자 관련 API
├── productApi.ts          # 상품 관련 API
├── authApi.ts             # 인증 관련 API
└── interceptors.ts        # 요청/응답 인터셉터
```

## 예시

### 1. API 클라이언트 설정

```typescript
// src/api/client.ts
import axios from 'axios';

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 인증 에러: 로그인 페이지로 리다이렉트
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 2. User API

```typescript
// src/api/userApi.ts
import { apiClient } from './client';
import type { User, CreateUserDto, UpdateUserDto } from '@types/user';

/**
 * 사용자 목록 조회
 */
export const getUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<User[]>('/users');
  return response.data;
};

/**
 * 특정 사용자 조회
 */
export const getUserById = async (id: number): Promise<User> => {
  const response = await apiClient.get<User>(`/users/${id}`);
  return response.data;
};

/**
 * 사용자 생성
 */
export const createUser = async (data: CreateUserDto): Promise<User> => {
  const response = await apiClient.post<User>('/users', data);
  return response.data;
};

/**
 * 사용자 수정
 */
export const updateUser = async (id: number, data: UpdateUserDto): Promise<User> => {
  const response = await apiClient.put<User>(`/users/${id}`, data);
  return response.data;
};

/**
 * 사용자 삭제
 */
export const deleteUser = async (id: number): Promise<void> => {
  await apiClient.delete(`/users/${id}`);
};
```

**사용 예시**:
```typescript
import { getUsers, createUser } from '@api/userApi';

// 컴포넌트 또는 Hook에서 사용
const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    getUsers().then(setUsers).catch(console.error);
  }, []);

  const handleCreate = async (data: CreateUserDto) => {
    try {
      const newUser = await createUser(data);
      setUsers([...users, newUser]);
    } catch (error) {
      console.error('사용자 생성 실패:', error);
    }
  };

  return <div>{/* UI */}</div>;
};
```

### 3. Auth API

```typescript
// src/api/authApi.ts
import { apiClient } from './client';
import type { LoginDto, AuthResponse, RegisterDto } from '@types/auth';

/**
 * 로그인
 */
export const login = async (credentials: LoginDto): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);

  // 토큰 저장
  if (response.data.accessToken) {
    localStorage.setItem('accessToken', response.data.accessToken);
  }

  return response.data;
};

/**
 * 회원가입
 */
export const register = async (userData: RegisterDto): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', userData);
  return response.data;
};

/**
 * 로그아웃
 */
export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
  localStorage.removeItem('accessToken');
};

/**
 * 현재 로그인한 사용자 정보 조회
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
};
```

### 4. Product API (쿼리 파라미터 예시)

```typescript
// src/api/productApi.ts
import { apiClient } from './client';
import type { Product, ProductListResponse, ProductFilter } from '@types/product';

/**
 * 상품 목록 조회 (페이지네이션 + 필터)
 */
export const getProducts = async (
  filter?: ProductFilter
): Promise<ProductListResponse> => {
  const params = new URLSearchParams();

  if (filter?.page) params.append('page', filter.page.toString());
  if (filter?.limit) params.append('limit', filter.limit.toString());
  if (filter?.category) params.append('category', filter.category);
  if (filter?.search) params.append('search', filter.search);

  const response = await apiClient.get<ProductListResponse>(
    `/products?${params.toString()}`
  );
  return response.data;
};

/**
 * 상품 상세 조회
 */
export const getProductById = async (id: number): Promise<Product> => {
  const response = await apiClient.get<Product>(`/products/${id}`);
  return response.data;
};

/**
 * 상품 생성 (FormData 예시)
 */
export const createProduct = async (formData: FormData): Promise<Product> => {
  const response = await apiClient.post<Product>('/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
```

**사용 예시**:
```typescript
import { getProducts } from '@api/productApi';

const ProductPage = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts({
      page: 1,
      limit: 10,
      category: 'electronics',
      search: 'laptop',
    }).then(response => {
      setProducts(response.data);
    });
  }, []);

  return <div>{/* UI */}</div>;
};
```

### 5. 에러 처리 래퍼

```typescript
// src/api/errorHandler.ts
import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

/**
 * API 에러를 일관된 형식으로 변환
 */
export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    return {
      message: error.response?.data?.message || '서버 오류가 발생했습니다',
      statusCode: error.response?.status,
      errors: error.response?.data?.errors,
    };
  }

  return {
    message: '알 수 없는 오류가 발생했습니다',
  };
};
```

**사용 예시**:
```typescript
import { getUsers } from '@api/userApi';
import { handleApiError } from '@api/errorHandler';

try {
  const users = await getUsers();
} catch (error) {
  const apiError = handleApiError(error);
  console.error(apiError.message); // "서버 오류가 발생했습니다"
}
```

## 작성 가이드

### 1. HTTP 메서드별 네이밍 컨벤션

| HTTP 메서드 | 함수명 예시 | 설명 |
|------------|------------|------|
| GET | `getUsers`, `getUserById` | 조회 |
| POST | `createUser`, `login` | 생성 |
| PUT | `updateUser` | 전체 수정 |
| PATCH | `patchUser` | 부분 수정 |
| DELETE | `deleteUser` | 삭제 |

### 2. 응답 타입 명시
```typescript
// ✅ 좋은 예: 응답 타입 명시
export const getUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<User[]>('/users');
  return response.data;
};

// ❌ 나쁜 예: any 타입 사용
export const getUsers = async (): Promise<any> => {
  // ...
};
```

### 3. 도메인별 파일 분리
```typescript
// ✅ 좋은 예: 도메인별로 분리
// userApi.ts - 사용자 관련
// productApi.ts - 상품 관련
// authApi.ts - 인증 관련

// ❌ 나쁜 예: 모든 API를 하나의 파일에
// api.ts - 모든 API 함수
```

### 4. 에러 처리
```typescript
// API 함수에서는 에러를 던지고, 호출하는 쪽에서 처리
export const getUsers = async (): Promise<User[]> => {
  // try-catch를 여기서 하지 않음
  const response = await apiClient.get<User[]>('/users');
  return response.data;
};

// 사용하는 쪽에서 에러 처리
try {
  const users = await getUsers();
} catch (error) {
  // 에러 처리
}
```

## React Query 사용 예시 (선택사항)

```typescript
// src/api/queries/useUsers.ts
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '@api/userApi';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });
};
```

**사용 예시**:
```typescript
import { useUsers } from '@api/queries/useUsers';

const UserList = () => {
  const { data: users, isLoading, error } = useUsers();

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러 발생</div>;

  return (
    <ul>
      {users?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
};
```

## 주의사항

- ✅ 모든 API 함수는 비동기 함수 (async/await)
- ✅ 응답 타입을 명확히 정의 (TypeScript 활용)
- ✅ 에러는 호출하는 쪽에서 처리 (API 함수는 에러를 던짐)
- ✅ 환경변수로 API URL 관리 (.env 파일)
- ❌ 컴포넌트에서 직접 axios/fetch 호출 지양
- ❌ API 함수에 비즈니스 로직 포함 지양 (단순 통신만)
