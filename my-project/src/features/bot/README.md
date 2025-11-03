# Bot Feature

Bot 관리 기능을 담당하는 Feature 모듈입니다. Bot 생성, 조회, 수정, 삭제(CRUD) 및 Bot 미리보기 기능을 제공합니다.

## 📁 디렉토리 구조

```
bot/
├── __tests__/              # 단위 테스트
│   └── botStore.test.ts
├── api/                    # API 통신 레이어
│   └── botApi.ts
├── components/             # Bot 관련 컴포넌트
│   ├── BotCard/
│   ├── BotList/
│   ├── BotSetup/
│   ├── BotPreview.tsx
│   ├── EmptyState.tsx
│   └── SetupComplete.tsx
├── hooks/                  # Custom hooks
│   ├── useBots.ts
│   ├── useBotActions.ts
│   ├── useFilteredBots.ts
│   └── useCreateBot.ts
├── pages/                  # 페이지 컴포넌트
│   ├── HomePage.tsx
│   ├── BotSetupPage.tsx
│   ├── BotPreviewPage.tsx
│   └── SetupCompletePage.tsx
├── stores/                 # Zustand store
│   └── botStore.ts
├── types/                  # TypeScript 타입 정의
│   └── bot.types.ts
├── routes.tsx              # Bot Feature 라우트 정의
├── index.ts                # Public API
└── README.md
```

## 🎯 주요 기능

### 1. Bot 관리

- **Bot 목록 조회**: 사용자가 생성한 모든 Bot 목록 표시
- **Bot 생성**: 단계별 마법사 형식의 Bot 생성 프로세스
- **Bot 삭제**: Bot 삭제 및 활동 로그 기록
- **Bot 미리보기**: 생성된 Bot의 미리보기 화면

### 2. 검색 및 필터링

- 검색어 기반 Bot 필터링
- 활성/비활성 상태별 필터링
- 실시간 검색 결과 업데이트

### 3. 상태 관리

- Zustand를 활용한 전역 상태 관리
- Bot 목록, 선택된 Bot, 로딩 상태 관리
- 낙관적 업데이트(Optimistic Update) 지원

## 📦 Public API

### Components

```typescript
import {
  BotCard,
  BotList,
  EmptyState,
  SetupComplete,
  BotPreview,
  BotSetup,
} from '@/features/bot';
```

### Hooks

```typescript
import {
  useBots, // Bot 목록 조회 및 관리
  useBotActions, // Bot 액션 (생성, 삭제)
  useFilteredBots, // 검색 필터링된 Bot 목록
  useCreateBot, // Bot 생성 로직
} from '@/features/bot';
```

### Store

```typescript
import {
  useBotStore, // Bot store hook
  selectBots, // Bot 목록 selector
  selectSelectedBot, // 선택된 Bot selector
  selectBotsCount, // Bot 개수 selector
  selectActiveBots, // 활성 Bot 목록 selector
} from '@/features/bot';
```

### Types

```typescript
import type {
  Bot, // Bot 엔티티
  CreateBotDto, // Bot 생성 DTO
  UpdateBotDto, // Bot 업데이트 DTO
  BotSetupFormData, // Bot 설정 폼 데이터
  BotState, // Bot store 상태
  BotFilterOptions, // 필터링 옵션
} from '@/features/bot';
```

### Pages

```typescript
import {
  HomePage, // Bot 목록 페이지
  BotSetupPage, // Bot 생성 페이지
  BotPreviewPage, // Bot 미리보기 페이지
  SetupCompletePage, // Bot 생성 완료 페이지
} from '@/features/bot';
```

## 🔗 라우트

Bot Feature는 다음 라우트를 제공합니다:

```typescript
/ (index)              → HomePage (Bot 목록)
/setup                 → BotSetupPage (Bot 생성)
/setup/complete        → SetupCompletePage (생성 완료)
/preview               → BotPreviewPage (Bot 미리보기)
```

## 🪝 Custom Hooks 사용 예시

### useBots

```typescript
function MyComponent() {
  const { bots, loading, error } = useBots({
    searchQuery: 'test',
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <BotList bots={bots} />;
}
```

### useBotActions

```typescript
function BotActionButtons() {
  const { handleCreateBot, handleDeleteBot } = useBotActions();

  return (
    <div>
      <button onClick={handleCreateBot}>
        Create New Bot
      </button>
      <button onClick={() => handleDeleteBot('bot-id', 'Bot Name')}>
        Delete Bot
      </button>
    </div>
  );
}
```

### useFilteredBots

```typescript
function FilteredBotList() {
  const searchQuery = useUIStore((state) => state.searchQuery);
  const {
    bots,
    totalCount,
    isEmpty,
    hasResults
  } = useFilteredBots({ searchQuery });

  if (isEmpty) return <EmptyState />;
  if (!hasResults) return <NoSearchResults />;

  return <BotList bots={bots} totalCount={totalCount} />;
}
```

## 🏪 Store 사용 예시

### 기본 사용

```typescript
function BotManager() {
  // Store에서 필요한 상태와 액션만 선택
  const bots = useBotStore((state) => state.bots);
  const addBot = useBotStore((state) => state.addBot);
  const deleteBot = useBotStore((state) => state.deleteBot);

  const handleAdd = () => {
    const newBot: Bot = {
      id: 'new-bot',
      name: 'My Bot',
      description: 'Test bot',
      status: 'active',
      messagesCount: 0,
      errorsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addBot(newBot);
  };

  return (
    <div>
      <button onClick={handleAdd}>Add Bot</button>
      {bots.map((bot) => (
        <div key={bot.id}>
          {bot.name}
          <button onClick={() => deleteBot(bot.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

### Selector 사용

```typescript
function BotStats() {
  // Selector를 사용하여 파생 상태 조회
  const totalCount = useBotStore(selectBotsCount);
  const activeBots = useBotStore(selectActiveBots);

  return (
    <div>
      <p>Total Bots: {totalCount}</p>
      <p>Active Bots: {activeBots.length}</p>
    </div>
  );
}
```

## 🧪 테스트

### 테스트 실행

```bash
# Bot Feature 테스트만 실행
npm test -- bot

# Watch mode
npm test -- bot --watch

# Coverage
npm test -- bot --coverage
```

### 테스트 구조

- **botStore.test.ts**: Bot store의 모든 기능 테스트
  - Bot 추가/삭제/업데이트
  - Selector 동작 확인
  - 상태 변경 검증

## 🔧 개발 가이드

### 새로운 Bot 액션 추가하기

1. **타입 정의** (`types/bot.types.ts`)

```typescript
export interface ArchiveBotDto {
  id: string;
  reason?: string;
}
```

2. **API 함수 추가** (`api/botApi.ts`)

```typescript
export const botApi = {
  // ... 기존 함수들
  archive: async (dto: ArchiveBotDto): Promise<Bot> => {
    const { data } = await apiClient.post('/bots/archive', dto);
    return data;
  },
};
```

3. **Store 액션 추가** (`stores/botStore.ts`)

```typescript
interface BotState {
  // ... 기존 상태
  archiveBot: (id: string) => void;
}

export const useBotStore = create<BotState>((set) => ({
  // ... 기존 액션들
  archiveBot: (id) =>
    set((state) => ({
      bots: state.bots.map((bot) =>
        bot.id === id ? { ...bot, status: 'archived' } : bot
      ),
    })),
}));
```

4. **Hook 추가** (`hooks/useArchiveBot.ts`)

```typescript
export function useArchiveBot() {
  const archiveBot = useBotStore((state) => state.archiveBot);

  return useCallback(
    async (id: string) => {
      await botApi.archive({ id });
      archiveBot(id);
    },
    [archiveBot]
  );
}
```

5. **Public API 노출** (`index.ts`)

```typescript
export { useArchiveBot } from './hooks/useArchiveBot';
```

### 컴포넌트 추가 가이드

1. `components/` 디렉토리에 컴포넌트 생성
2. 컴포넌트는 Feature 내부 타입만 import
3. 외부 Feature 의존성은 props로 전달
4. `index.ts`에서 export하여 공개 API 제공

### 주의사항

⚠️ **Import 규칙**

- Feature 내부에서는 상대 경로 사용
- 외부 Feature는 `@/features/[feature-name]`으로 import
- Shared 리소스는 `@/shared/`로 import
- Widgets는 `@/widgets/`로 import

⚠️ **순환 의존성 방지**

- Bot Feature는 다른 Feature의 store를 직접 import하지 않음
- Activity 로깅은 props 또는 callback으로 전달

⚠️ **타입 안정성**

- 모든 함수와 컴포넌트에 명시적 타입 지정
- `any` 타입 사용 금지
- DTO는 반드시 별도 타입으로 정의

## 📚 관련 문서

- [전체 아키텍처 문서](../../ARCHITECTURE.md)
- [API 명세](./api/README.md)
- [컴포넌트 가이드](./components/README.md)
- [테스트 가이드](../../TESTING.md)

## 🤝 기여하기

1. Feature 브랜치 생성 (`feature/bot-new-feature`)
2. 변경사항 커밋
3. 테스트 작성 및 실행
4. Pull Request 생성

---

**Last Updated**: 2025-11-03
**Maintainer**: Frontend Team
