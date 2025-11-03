# Utils

이 폴더는 순수 유틸리티 함수들을 포함합니다.

## 개념

**Utility 함수**는 React에 종속되지 않은 **순수 함수**로, 프로젝트 전반에서 재사용 가능한 헬퍼 함수들입니다.

## 네이밍 규칙

- **파일명**: `camelCase.ts` 또는 기능별 그룹명
- **함수명**: `camelCase`

## 예시

### 1. 날짜 포맷 유틸리티

```typescript
// src/utils/dateFormat.ts

/**
 * Date 객체를 'YYYY-MM-DD' 형식의 문자열로 변환
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Date 객체를 'YYYY-MM-DD HH:mm:ss' 형식으로 변환
 */
export const formatDateTime = (date: Date): string => {
  const dateStr = formatDate(date);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${dateStr} ${hours}:${minutes}:${seconds}`;
};

/**
 * 상대 시간 표시 (예: '3분 전', '2시간 전')
 */
export const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}일 전`;
  if (hours > 0) return `${hours}시간 전`;
  if (minutes > 0) return `${minutes}분 전`;
  return '방금 전';
};
```

**사용 예시**:

```typescript
import { formatDate, getRelativeTime } from '@utils/dateFormat';

const now = new Date();
console.log(formatDate(now)); // "2024-03-15"
console.log(getRelativeTime(new Date(Date.now() - 300000))); // "5분 전"
```

### 2. 문자열 유틸리티

```typescript
// src/utils/stringUtils.ts

/**
 * 문자열 첫 글자를 대문자로 변환
 */
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * 문자열 잘라내기 (말줄임표 추가)
 */
export const truncate = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
};

/**
 * 전화번호 포맷팅 (010-1234-5678)
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return phone;
};

/**
 * 이메일 유효성 검증
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
```

**사용 예시**:

```typescript
import { truncate, formatPhoneNumber } from '@utils/stringUtils';

const title = truncate('긴 제목입니다', 5); // "긴 제목..."
const phone = formatPhoneNumber('01012345678'); // "010-1234-5678"
```

### 3. 숫자 포맷 유틸리티

```typescript
// src/utils/numberFormat.ts

/**
 * 숫자를 통화 형식으로 변환 (1000 → "1,000원")
 */
export const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString('ko-KR')}원`;
};

/**
 * 파일 크기를 읽기 쉬운 형식으로 변환 (1024 → "1 KB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * 퍼센트 계산
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};
```

**사용 예시**:

```typescript
import { formatCurrency, formatFileSize } from '@utils/numberFormat';

const price = formatCurrency(25000); // "25,000원"
const fileSize = formatFileSize(2048); // "2 KB"
```

### 4. 배열 유틸리티

```typescript
// src/utils/arrayUtils.ts

/**
 * 배열 중복 제거
 */
export const unique = <T>(array: T[]): T[] => {
  return Array.from(new Set(array));
};

/**
 * 배열을 특정 크기로 분할 (chunk)
 */
export const chunk = <T>(array: T[], size: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

/**
 * 배열 섞기 (shuffle)
 */
export const shuffle = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * 객체 배열을 특정 키로 그룹화
 */
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce(
    (result, item) => {
      const groupKey = String(item[key]);
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    },
    {} as Record<string, T[]>
  );
};
```

**사용 예시**:

```typescript
import { chunk, groupBy } from '@utils/arrayUtils';

const numbers = [1, 2, 3, 4, 5, 6];
const chunked = chunk(numbers, 2); // [[1, 2], [3, 4], [5, 6]]

const users = [
  { name: 'Alice', role: 'admin' },
  { name: 'Bob', role: 'user' },
  { name: 'Charlie', role: 'admin' },
];
const grouped = groupBy(users, 'role');
// { admin: [{...}, {...}], user: [{...}] }
```

### 5. 객체 유틸리티

```typescript
// src/utils/objectUtils.ts

/**
 * 깊은 복사 (Deep Clone)
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * 객체에서 빈 값 제거
 */
export const omitEmpty = <T extends Record<string, any>>(
  obj: T
): Partial<T> => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      acc[key] = value;
    }
    return acc;
  }, {} as any);
};

/**
 * 특정 키만 선택
 */
export const pick = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};
```

**사용 예시**:

```typescript
import { pick, omitEmpty } from '@utils/objectUtils';

const user = { id: 1, name: 'Alice', email: '', age: 25 };
const cleaned = omitEmpty(user); // { id: 1, name: 'Alice', age: 25 }
const basic = pick(user, ['id', 'name']); // { id: 1, name: 'Alice' }
```

### 6. 디바운스/스로틀

```typescript
// src/utils/timing.ts

/**
 * 디바운스: 마지막 호출 후 일정 시간이 지나면 실행
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * 스로틀: 일정 시간마다 최대 한 번만 실행
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
```

**사용 예시**:

```typescript
import { debounce } from '@utils/timing';

const handleSearch = debounce((query: string) => {
  console.log('검색:', query);
}, 300);

// 사용자가 타이핑을 멈춘 후 300ms 뒤에 실행
```

## 폴더 구조 예시

```
utils/
├── dateFormat.ts          # 날짜 관련
├── stringUtils.ts         # 문자열 관련
├── numberFormat.ts        # 숫자 관련
├── arrayUtils.ts          # 배열 관련
├── objectUtils.ts         # 객체 관련
├── timing.ts              # 디바운스/스로틀
└── validation.ts          # 유효성 검증
```

## 작성 가이드

### 1. 순수 함수로 작성

```typescript
// ✅ 좋은 예: 순수 함수 (입력이 같으면 출력도 같음)
export const add = (a: number, b: number): number => {
  return a + b;
};

// ❌ 나쁜 예: 외부 상태에 의존
let total = 0;
export const addToTotal = (value: number): number => {
  total += value; // 외부 상태 변경
  return total;
};
```

### 2. TypeScript 타입 활용

```typescript
// ✅ 제네릭으로 재사용성 향상
export const groupBy = <T>(array: T[], key: keyof T) => {
  // ...
};
```

### 3. JSDoc 주석 작성

```typescript
/**
 * 배열의 중복을 제거합니다
 * @param array - 입력 배열
 * @returns 중복이 제거된 새 배열
 * @example
 * unique([1, 2, 2, 3]); // [1, 2, 3]
 */
export const unique = <T>(array: T[]): T[] => {
  return Array.from(new Set(array));
};
```

## 주의사항

- ✅ React에 종속되지 않는 순수 함수만 작성
- ✅ 하나의 파일에는 관련된 함수들만 그룹화
- ✅ 테스트 가능한 작은 단위로 분리
- ✅ 부수 효과(side effect) 없는 순수 함수 지향
- ❌ React hooks 사용 금지 (hooks 폴더로 이동)
- ❌ DOM 조작 최소화 (필요시 명확히 문서화)
