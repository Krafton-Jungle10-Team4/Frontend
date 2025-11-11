# MCP 통합 API 명세서

## 목차

1. [개요](#개요)
2. [인증 방식](#인증-방식)
3. [데이터 모델](#데이터-모델)
4. [API 엔드포인트](#api-엔드포인트)
5. [워크플로우 통합](#워크플로우-통합)
6. [프론트엔드 구현 가이드](#프론트엔드-구현-가이드)
7. [에러 처리](#에러-처리)
8. [전체 시나리오](#전체-시나리오)

---

## 개요

### 목적

MCP (Model Context Protocol) 통합 기능을 통해 워크플로우에서 외부 서비스(유튜브 요약, Slack 등)를 노드로 사용할 수 있도록 합니다.

### 주요 기능

- **MCP 제공자 관리**: 지원되는 MCP 서비스 목록 조회
- **MCP 키 관리**: 사용자별 API 키 등록, 조회, 삭제 (봇 레벨 스코핑 선택 가능)
- **MCP 노드**: 워크플로우 빌더에서 MCP를 노드로 추가 및 실행
- **보안**: AES-256-GCM 암호화, 사용자별 격리, JWT 인증

### 지원 MCP 제공자

| Provider ID       | 이름              | 설명                    | 필수 키         |
| ----------------- | ----------------- | ----------------------- | --------------- |
| `youtube-summary` | YouTube Summary   | YouTube 영상 요약 생성  | YouTube API Key |
| `slack`           | Slack Integration | Slack 메시지 전송/조회  | Slack Bot Token |
| `notion` (향후)   | Notion            | Notion 페이지 조회/생성 | Notion API Key  |

---

## 인증 방식

### JWT Bearer Token

모든 MCP 관련 API는 JWT 인증이 필요합니다.

```http
Authorization: Bearer {access_token}
```

### 권한

- **MCP 제공자 조회**: 모든 인증된 사용자
- **MCP 키 등록/삭제**: 사용자 본인 (자신의 키만 관리)
- **MCP 키 조회**: 사용자 본인 (자신의 키만 조회)
- **봇 레벨 키**: 특정 봇에만 사용되도록 제한 가능 (선택사항)

---

## 데이터 모델

### MCPProvider (백엔드 DB 모델)

```python
class MCPProvider(Base):
    """MCP 제공자 정의"""
    __tablename__ = "mcp_providers"

    id: int                        # Primary Key
    provider_id: str               # 고유 식별자 (예: "youtube-summary")
    name: str                      # 표시 이름 (예: "YouTube Summary")
    description: str               # 설명
    icon: str                      # 아이콘 (URL 또는 이모지)

    # 지원 액션
    supported_actions: JSON        # List[Dict] 형태

    # 필수 키 정보
    required_keys: JSON            # List[Dict] 형태

    # 노드 설정 스키마
    config_schema: JSON            # Dict 형태

    is_active: bool = True
    created_at: DateTime
    updated_at: DateTime
```

#### supported_actions 예시

```json
[
  {
    "action_id": "summarize",
    "name": "Summarize Video",
    "description": "Generate summary of YouTube video",
    "parameters": [
      {
        "name": "video_url",
        "type": "string",
        "required": true,
        "description": "YouTube video URL"
      },
      {
        "name": "language",
        "type": "string",
        "required": false,
        "default": "ko",
        "options": ["ko", "en", "ja"]
      }
    ]
  }
]
```

#### required_keys 예시

```json
[
  {
    "key_name": "api_key",
    "display_name": "YouTube API Key",
    "description": "Google Cloud Console에서 발급받은 YouTube Data API v3 키",
    "is_secret": true,
    "validation_pattern": "^AIza[0-9A-Za-z-_]{35}$"
  }
]
```

### MCPKey (백엔드 DB 모델)

```python
class MCPKey(Base):
    """사용자별 MCP API 키 (봇 레벨 스코핑 선택 가능)"""
    __tablename__ = "mcp_keys"

    id: int                        # Primary Key
    key_id: str                    # 외부 노출용 ID (예: "mcp_key_1234567890_abc")

    # 소유권 및 스코핑 (사용자 기반)
    user_id: int                   # Foreign Key (users.id) - 소유자
    bot_id: str | None             # Foreign Key (bots.bot_id) - 선택사항, 특정 봇에만 제한
    provider_id: str               # MCP 제공자 ID (예: "youtube-summary")

    # 암호화된 키 값 (AES-256-GCM)
    encrypted_blob: str            # Base64 인코딩된 암호화 데이터 (JSON → AES-GCM)
                                   # 복호화 시: {"api_key": "AIza...", "bot_token": "xoxb-..."}

    # 메타데이터
    display_name: str              # 사용자 지정 이름 (예: "프로덕션 YouTube 키")
    description: str | None        # 설명

    # 상태
    is_active: bool = True
    last_used_at: DateTime | None

    created_at: DateTime
    updated_at: DateTime

    # 인덱스 및 제약 조건
    # - idx_user_provider: (user_id, provider_id)
    # - idx_user_provider_display: (user_id, provider_id, display_name) UNIQUE
```

#### 키 조회 우선순위 (워크플로 실행 시)

1. **봇 레벨 키 우선**: `user_id` + `provider_id` + `bot_id` 조건으로 조회
2. **사용자 레벨 키 폴백**: 봇 레벨 키가 없으면 `user_id` + `provider_id` + `bot_id IS NULL` 조건으로 조회
3. **암호화 방식**: AES-256-GCM (Cryptography 라이브러리)
   - 마스터 키: 환경 변수 `MCP_ENCRYPTION_KEY` (Base64 인코딩된 32바이트)
   - Nonce: 96비트 랜덤 생성
   - 저장 형식: `Base64(nonce + ciphertext + tag)`
```

---

## API 엔드포인트

### 1. MCP 제공자 목록 조회

#### 요청

```http
GET /api/v1/mcp/providers
Authorization: Bearer {access_token}
```

#### 응답 (200 OK)

```json
[
  {
    "provider_id": "youtube-summary",
      "name": "YouTube Summary",
      "description": "YouTube 영상 요약 생성 서비스",
      "icon": "🎥",
      "supported_actions": [
        {
          "action_id": "summarize",
          "name": "Summarize Video",
          "description": "YouTube 영상을 분석하여 요약 생성",
          "parameters": [
            {
              "name": "video_url",
              "type": "string",
              "required": true,
              "description": "YouTube 영상 URL (예: https://youtube.com/watch?v=...)"
            },
            {
              "name": "language",
              "type": "string",
              "required": false,
              "default": "ko",
              "options": ["ko", "en", "ja"],
              "description": "요약 언어"
            },
            {
              "name": "summary_length",
              "type": "string",
              "required": false,
              "default": "medium",
              "options": ["short", "medium", "long"],
              "description": "요약 길이"
            }
          ]
        }
      ],
      "required_keys": [
        {
          "key_name": "api_key",
          "display_name": "YouTube API Key",
          "description": "Google Cloud Console에서 발급받은 YouTube Data API v3 키",
          "is_secret": true,
          "validation_pattern": "^AIza[0-9A-Za-z-_]{35}$"
        }
      ],
      "config_schema": {
        "type": "object",
        "properties": {
          "action": {
            "type": "string",
            "enum": ["summarize"],
            "description": "실행할 액션"
          },
          "parameters": {
            "type": "object",
            "description": "액션별 파라미터"
          }
        },
        "required": ["action"]
      },
      "is_active": true
    },
    {
      "provider_id": "slack",
      "name": "Slack Integration",
      "description": "Slack 메시지 전송 및 채널 관리",
      "icon": "💬",
      "supported_actions": [
        {
          "action_id": "send_message",
          "name": "Send Message",
          "description": "Slack 채널에 메시지 전송",
          "parameters": [
            {
              "name": "channel",
              "type": "string",
              "required": true,
              "description": "채널 ID 또는 이름 (예: #general)"
            },
            {
              "name": "message",
              "type": "string",
              "required": true,
              "description": "전송할 메시지 내용"
            },
            {
              "name": "thread_ts",
              "type": "string",
              "required": false,
              "description": "스레드로 답장할 메시지의 timestamp"
            }
          ]
        },
        {
          "action_id": "get_channel_history",
          "name": "Get Channel History",
          "description": "채널의 최근 메시지 조회",
          "parameters": [
            {
              "name": "channel",
              "type": "string",
              "required": true,
              "description": "채널 ID"
            },
            {
              "name": "limit",
              "type": "number",
              "required": false,
              "default": 10,
              "description": "조회할 메시지 개수"
            }
          ]
        }
      ],
      "required_keys": [
        {
          "key_name": "bot_token",
          "display_name": "Slack Bot Token",
          "description": "Slack App에서 발급받은 Bot User OAuth Token (xoxb-로 시작)",
          "is_secret": true,
          "validation_pattern": "^xoxb-[0-9]+-[0-9]+-[a-zA-Z0-9]+$"
        }
      ],
      "config_schema": {
        "type": "object",
        "properties": {
          "action": {
            "type": "string",
            "enum": ["send_message", "get_channel_history"]
          },
          "parameters": {
            "type": "object"
          }
        },
        "required": ["action"]
      },
      "is_active": true
    }
]
```

#### 프론트엔드 사용 시나리오

1. **워크플로우 빌더 초기화 시** 호출
2. 사이드바에 MCP 노드 목록 표시
3. 각 MCP 제공자의 아이콘, 이름, 설명 표시
4. 사용자가 노드를 드래그하여 캔버스에 추가

#### 프론트엔드 상태 관리

```typescript
// features/workflow/stores/mcpStore.ts
interface MCPProvider {
  provider_id: string;
  name: string;
  description: string;
  icon: string;
  supported_actions: MCPAction[];
  required_keys: MCPKeyRequirement[];
  config_schema: object;
  is_active: boolean;
}

// Zustand 스토어
const useMCPStore = create((set) => ({
  providers: [] as MCPProvider[],
  loadProviders: async () => {
    const data = await mcpApi.getProviders();
    set({ providers: data });
  },
}));
```

---

### 2. MCP 키 등록

#### 요청

```http
POST /api/v1/mcp/keys
Authorization: Bearer {access_token}
Content-Type: application/json
```

```json
{
  "provider_id": "youtube-summary",
  "display_name": "프로덕션 YouTube 키",
  "description": "메인 서비스용 YouTube API 키",
  "bot_id": null,
  "keys": {
    "api_key": "AIzaSyD1234567890abcdefghijklmnopqrstuvwxyz"
  }
}
```

#### 요청 필드 설명

| 필드           | 타입   | 필수 | 설명                                                                 |
| -------------- | ------ | ---- | -------------------------------------------------------------------- |
| `provider_id`  | string | ✅   | MCP 제공자 ID (예: "youtube-summary")                                |
| `display_name` | string | ✅   | 사용자 지정 키 이름 (1-100자)                                        |
| `description`  | string | ❌   | 키 설명 (최대 500자)                                                 |
| `bot_id`       | string | ❌   | 봇 레벨 스코핑 (null 또는 미지정 시 사용자 레벨 키, 봇 ID 지정 시 해당 봇 전용) |
| `keys`         | object | ✅   | 키 값들 (제공자의 required_keys에 정의된 키들)                       |

#### keys 객체 구조

```typescript
{
  [key_name: string]: string  // 제공자별로 다름
}
```

**예시:**

- **youtube-summary**: `{ "api_key": "AIza..." }`
- **slack**: `{ "bot_token": "xoxb-..." }`
- **notion**: `{ "api_key": "secret_...", "integration_id": "..." }` (향후)

#### 응답 (201 Created)

```json
{
  "key_id": "mcp_key_1730718000_a8b9c3d4e",
  "user_id": 123,
  "bot_id": null,
  "provider_id": "youtube-summary",
  "provider_name": "YouTube Summary",
  "display_name": "프로덕션 YouTube 키",
  "description": "메인 서비스용 YouTube API 키",
  "is_active": true,
  "keys_registered": ["api_key"],
  "last_used_at": null,
  "created_at": "2025-11-10T12:00:00Z",
  "user_email": "user@example.com"
}
```

#### 응답 필드 설명

| 필드              | 타입         | 설명                                      |
| ----------------- | ------------ | ----------------------------------------- |
| `key_id`          | string       | 생성된 키 ID (수정/삭제 시 사용)          |
| `user_id`         | integer      | 소유자 사용자 ID                          |
| `bot_id`          | string\|null | 봇 레벨 스코핑 (null이면 사용자 레벨 키) |
| `provider_id`     | string       | MCP 제공자 ID                             |
| `provider_name`   | string       | 제공자 표시 이름                          |
| `display_name`    | string       | 사용자 지정 키 이름                       |
| `description`     | string       | 키 설명                                   |
| `is_active`       | boolean      | 활성화 상태                               |
| `keys_registered` | string[]     | 등록된 키 이름 목록                       |
| `last_used_at`    | string\|null | 마지막 사용 시간 (ISO 8601)               |
| `created_at`      | string       | 생성 시간 (ISO 8601)                      |
| `user_email`      | string       | 소유자 이메일                             |

#### 에러 응답

**400 Bad Request - 유효성 검증 실패**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "키 형식이 올바르지 않습니다",
    "details": {
      "api_key": "YouTube API 키는 'AIza'로 시작하고 39자여야 합니다"
    }
  }
}
```

**403 Forbidden - 권한 없음**

```json
{
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "MCP 키 등록 권한이 없습니다. 본인 소유의 키만 관리할 수 있습니다."
  }
}
```

**404 Not Found - 제공자 없음**

```json
{
  "error": {
    "code": "PROVIDER_NOT_FOUND",
    "message": "MCP 제공자를 찾을 수 없습니다: invalid-provider"
  }
}
```

**409 Conflict - 중복 키**

```json
{
  "error": {
    "code": "DUPLICATE_KEY",
    "message": "이미 등록된 키입니다. 기존 키를 삭제하거나 다른 이름을 사용하세요.",
    "existing_key_id": "mcp_key_1730718000_xyz"
  }
}
```

#### 프론트엔드 사용 시나리오

**1. 사용자 설정 페이지에서 키 등록**

```typescript
// features/settings/pages/UserSettingsPage.tsx 또는 features/mcp/pages/MCPKeysPage.tsx

const handleRegisterKey = async (formData: MCPKeyForm) => {
  try {
    // 1. 유효성 검증
    validateKeyFormat(formData.provider_id, formData.keys);

    // 2. API 호출
    const newKey = await mcpApi.registerKey(formData);

    // 3. 성공 메시지 표시
    toast.success("MCP 키가 성공적으로 등록되었습니다.");

    // 4. 키 목록 갱신
    await refreshKeyList();

    // 5. 폼 초기화
    resetForm();
  } catch (error) {
    if (error.code === "VALIDATION_ERROR") {
      // 폼 필드 에러 표시
      setFieldErrors(error.details);
    } else {
      toast.error(error.message);
    }
  }
};
```

**2. 워크플로우 빌더에서 노드 설정 시**

```typescript
// features/workflow/components/NodeConfigPanel/MCPNodeConfig.tsx

// MCP 노드를 캔버스에 추가했을 때
const MCPNodeConfig = ({ nodeId, data }: NodeConfigProps) => {
  const { provider_id } = data;
  const { userKeys } = useMCPStore();  // 사용자 키 관리

  // 해당 제공자의 키가 등록되어 있는지 확인
  const hasKey = userKeys.some(
    (k) => k.provider_id === provider_id && k.is_active
  );

  if (!hasKey) {
    return (
      <Alert severity="warning">
        <AlertTitle>API 키 필요</AlertTitle>
        <Typography>
          {data.provider_name} 노드를 사용하려면 API 키가 필요합니다.
        </Typography>
        <Button onClick={() => navigate("/settings/mcp")}>
          키 등록하러 가기
        </Button>
      </Alert>
    );
  }

  // 키가 있으면 액션 및 파라미터 설정 UI 표시
  return <MCPActionConfig nodeId={nodeId} data={data} />;
};
```

---

### 3. MCP 키 목록 조회

#### 요청

```http
GET /api/v1/mcp/keys
Authorization: Bearer {access_token}
```

#### 쿼리 파라미터

| 파라미터      | 타입    | 필수 | 기본값 | 설명                                         |
| ------------- | ------- | ---- | ------ | -------------------------------------------- |
| `provider_id` | string  | ❌   | -      | 특정 제공자의 키만 필터링                    |
| `bot_id`      | string  | ❌   | -      | 특정 봇의 키만 필터링 (봇 레벨 스코핑 지원) |
| `is_active`   | boolean | ❌   | -      | 활성화 상태 필터링                           |

**예시:**

```http
GET /api/v1/mcp/keys?provider_id=youtube-summary&is_active=true
GET /api/v1/mcp/keys?bot_id=bot_abc123
```

#### 응답 (200 OK)

```json
{
  "total": 2,
  "keys": [
    {
      "key_id": "mcp_key_1730718000_a8b9c3d4e",
      "user_id": 123,
      "bot_id": null,
      "provider_id": "youtube-summary",
      "provider_name": "YouTube Summary",
      "display_name": "프로덕션 YouTube 키",
      "description": "메인 서비스용 YouTube API 키",
      "is_active": true,
      "keys_registered": ["api_key"],
      "last_used_at": "2025-11-10T15:30:00Z",
      "created_at": "2025-11-10T12:00:00Z",
      "user_email": "user@example.com"
    },
    {
      "key_id": "mcp_key_1730720000_xyz123",
      "user_id": 123,
      "bot_id": "bot_abc123",
      "provider_id": "slack",
      "provider_name": "Slack Integration",
      "display_name": "프로덕션 Slack Bot",
      "description": "프로덕션 환경용 Slack 봇",
      "is_active": true,
      "keys_registered": ["bot_token"],
      "last_used_at": null,
      "created_at": "2025-11-10T13:00:00Z",
      "user_email": "user@example.com"
    }
  ]
}
```

#### 프론트엔드 사용 시나리오

**1. 사용자 설정 페이지 - MCP 키 관리 탭**

```typescript
// features/settings/components/MCPKeysTab.tsx 또는 features/mcp/components/MCPKeysList.tsx

const MCPKeysTab = () => {
  const [keys, setKeys] = useState<MCPKey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    try {
      const keysResponse = await mcpApi.getKeys();
      setKeys(keysResponse.keys);
    } catch (error) {
      toast.error("키 목록을 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6">등록된 MCP 키</Typography>

      {keys.length === 0 ? (
        <EmptyState
          icon={<KeyIcon />}
          title="등록된 키가 없습니다"
          description="MCP 서비스를 사용하려면 API 키를 등록하세요"
          action={<Button onClick={openRegisterDialog}>키 등록하기</Button>}
        />
      ) : (
        <List>
          {keys.map((key) => (
            <MCPKeyListItem
              key={key.key_id}
              keyData={key}
              onDelete={() => handleDeleteKey(key.key_id)}
            />
          ))}
        </List>
      )}
    </Box>
  );
};
```

**2. 워크플로우 빌더 - 노드 설정 패널**

```typescript
// features/mcp/stores/mcpStore.ts 또는 features/workflow/stores/mcpStore.ts

const useMCPStore = create((set, get) => ({
  userKeys: [] as MCPKey[],  // 사용자 키 관리

  loadUserKeys: async () => {
    const keysResponse = await mcpApi.getKeys();
    set({ userKeys: keysResponse.keys });
  },

  // 특정 제공자의 키가 있는지 확인
  hasKeyForProvider: (provider_id: string) => {
    const { userKeys } = get();
    return userKeys.some((k) => k.provider_id === provider_id && k.is_active);
  },

  // 특정 제공자의 키 목록 가져오기
  getKeysForProvider: (provider_id: string) => {
    const { userKeys } = get();
    return userKeys.filter((k) => k.provider_id === provider_id && k.is_active);
  },
}));
```

---

### 4. MCP 키 삭제

#### 요청

```http
DELETE /api/v1/mcp/keys/{key_id}
Authorization: Bearer {access_token}
```

#### 경로 파라미터

| 파라미터 | 타입   | 설명                                              |
| -------- | ------ | ------------------------------------------------- |
| `key_id` | string | 삭제할 키 ID (예: "mcp_key_1730718000_a8b9c3d4e") |

#### 응답 (204 No Content)

응답 본문 없음

#### 에러 응답

**403 Forbidden - 권한 없음**

```json
{
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "MCP 키 삭제 권한이 없습니다"
  }
}
```

**404 Not Found - 키 없음**

```json
{
  "error": {
    "code": "KEY_NOT_FOUND",
    "message": "MCP 키를 찾을 수 없습니다: mcp_key_invalid"
  }
}
```

**409 Conflict - 사용 중인 키**

```json
{
  "error": {
    "code": "KEY_IN_USE",
    "message": "이 키를 사용하는 워크플로우가 있어 삭제할 수 없습니다",
    "details": {
      "workflows": [
        {
          "bot_id": "bot_123",
          "bot_name": "고객 지원 봇",
          "node_count": 2
        }
      ]
    }
  }
}
```

#### 프론트엔드 사용 시나리오

```typescript
// features/mcp/components/MCPKeyListItem.tsx 또는 features/settings/components/MCPKeyListItem.tsx

const handleDeleteKey = async (keyId: string, keyName: string) => {
  // 1. 확인 다이얼로그
  const confirmed = await showConfirmDialog({
    title: "키 삭제",
    message: `"${keyName}" 키를 삭제하시겠습니까? 이 키를 사용하는 워크플로우가 있으면 삭제할 수 없습니다.`,
    confirmText: "삭제",
    confirmColor: "error",
  });

  if (!confirmed) return;

  try {
    // 2. API 호출
    await mcpApi.deleteKey(keyId);

    // 3. 성공 메시지
    toast.success("키가 삭제되었습니다");

    // 4. 목록 갱신
    await refreshKeyList();
  } catch (error) {
    if (error.code === "KEY_IN_USE") {
      // 사용 중인 워크플로우 목록 표시
      showWarningDialog({
        title: "키를 삭제할 수 없습니다",
        message: "이 키를 사용하는 워크플로우가 있습니다",
        details: error.details.workflows,
      });
    } else {
      toast.error(error.message);
    }
  }
};
```

---

### 5. 워크플로우 노드 타입 목록 조회 (MCP 포함)

기존 API를 확장하여 MCP 노드 타입을 포함합니다.

#### 요청

```http
GET /api/v1/workflows/node-types
Authorization: Bearer {access_token}
```

#### 응답 (200 OK)

```json
{
  "node_types": [
    {
      "type": "start",
      "label": "Start",
      "icon": "play_arrow",
      "max_instances": 1,
      "configurable": false,
      "config_schema": null
    },
    {
      "type": "knowledge-retrieval",
      "label": "Knowledge Retrieval",
      "icon": "search",
      "max_instances": -1,
      "configurable": true,
      "config_schema": {
        /* ... */
      }
    },
    {
      "type": "llm",
      "label": "LLM",
      "icon": "smart_toy",
      "max_instances": -1,
      "configurable": true,
      "config_schema": {
        /* ... */
      }
    },
    {
      "type": "mcp",
      "label": "MCP Service",
      "icon": "extension",
      "max_instances": -1,
      "configurable": true,
      "config_schema": {
        "type": "object",
        "properties": {
          "provider_id": {
            "type": "string",
            "description": "MCP 제공자 ID",
            "required": true
          },
          "action": {
            "type": "string",
            "description": "실행할 액션",
            "required": true
          },
          "parameters": {
            "type": "object",
            "description": "액션별 파라미터"
          }
        }
      }
    },
    {
      "type": "end",
      "label": "End",
      "icon": "check_circle",
      "max_instances": 1,
      "configurable": false,
      "config_schema": null
    }
  ]
}
```

#### 프론트엔드 사용 시나리오

```typescript
// features/workflow/components/sidebar/WorkflowSlimSidebar.tsx

const WorkflowSlimSidebar = () => {
  const nodeTypes = useNodeTypes();
  const mcpProviders = useMCPProviders();

  return (
    <Sidebar>
      <NodeSection title="기본 노드">
        {nodeTypes
          .filter((t) => ["start", "end"].includes(t.type))
          .map((type) => (
            <DraggableNode key={type.type} nodeType={type} />
          ))}
      </NodeSection>

      <NodeSection title="AI 노드">
        {nodeTypes
          .filter((t) => ["llm", "knowledge-retrieval"].includes(t.type))
          .map((type) => (
            <DraggableNode key={type.type} nodeType={type} />
          ))}
      </NodeSection>

      <NodeSection title="MCP 서비스">
        {mcpProviders.map((provider) => (
          <DraggableNode
            key={provider.provider_id}
            nodeType={{
              type: "mcp",
              label: provider.name,
              icon: provider.icon,
            }}
            data={{ provider_id: provider.provider_id }}
          />
        ))}
      </NodeSection>
    </Sidebar>
  );
};
```

---

## 워크플로우 통합

### MCP 노드 데이터 구조

프론트엔드에서 백엔드로 전송되는 MCP 노드 데이터 형식:

```json
{
  "id": "mcp-youtube-1",
  "type": "mcp",
  "position": { "x": 300, "y": 200 },
  "data": {
    "title": "YouTube Summary",
    "desc": "YouTube 영상 요약",
    "type": "mcp",
    "provider_id": "youtube-summary",
    "action": "summarize",
    "parameters": {
      "video_url": "https://youtube.com/watch?v=dQw4w9WgXcQ",
      "language": "ko",
      "summary_length": "medium"
    }
  }
}
```

### 워크플로우 저장 예시

#### 요청

```http
PUT /api/v1/workflows/bots/{bot_id}/workflow
Authorization: Bearer {access_token}
Content-Type: application/json
```

```json
{
  "nodes": [
    {
      "id": "start-1",
      "type": "start",
      "position": { "x": 100, "y": 200 },
      "data": {
        "title": "Start",
        "desc": "시작 노드",
        "type": "start"
      }
    },
    {
      "id": "mcp-youtube-1",
      "type": "mcp",
      "position": { "x": 300, "y": 200 },
      "data": {
        "title": "YouTube Summary",
        "desc": "YouTube 영상 요약",
        "type": "mcp",
        "provider_id": "youtube-summary",
        "action": "summarize",
        "parameters": {
          "video_url": "{user_input.video_url}",
          "language": "ko",
          "summary_length": "medium"
        }
      }
    },
    {
      "id": "llm-1",
      "type": "llm",
      "position": { "x": 500, "y": 200 },
      "data": {
        "title": "LLM",
        "desc": "요약 재구성",
        "type": "llm",
        "model": "claude-sonnet-4-5-20250929",
        "prompt": "다음 영상 요약을 한국어로 재구성해주세요:\n\n{mcp-youtube-1.output}",
        "temperature": 0.7,
        "max_tokens": 1000
      }
    },
    {
      "id": "end-1",
      "type": "end",
      "position": { "x": 700, "y": 200 },
      "data": {
        "title": "End",
        "desc": "종료 노드",
        "type": "end"
      }
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "start-1",
      "target": "mcp-youtube-1",
      "type": "custom",
      "data": {
        "source_type": "start",
        "target_type": "mcp"
      }
    },
    {
      "id": "e2",
      "source": "mcp-youtube-1",
      "target": "llm-1",
      "type": "custom",
      "data": {
        "source_type": "mcp",
        "target_type": "llm"
      }
    },
    {
      "id": "e3",
      "source": "llm-1",
      "target": "end-1",
      "type": "custom",
      "data": {
        "source_type": "llm",
        "target_type": "end"
      }
    }
  ]
}
```

#### 백엔드 검증 로직

1. MCP 노드 발견 시 `provider_id` 확인
2. 사용자의 활성화된 키가 있는지 확인 (봇 레벨 키 우선, 사용자 레벨 키 폴백)
3. 없으면 422 Unprocessable Entity 반환

```json
{
  "error": {
    "code": "MCP_KEY_REQUIRED",
    "message": "MCP 노드를 사용하려면 API 키가 필요합니다",
    "details": {
      "node_id": "mcp-youtube-1",
      "provider_id": "youtube-summary",
      "provider_name": "YouTube Summary",
      "required_keys": ["api_key"]
    }
  }
}
```

### 워크플로우 실행 (채팅 API)

MCP 노드가 포함된 워크플로우 실행 시:

#### 요청

```http
POST /api/v1/chat
Authorization: Bearer {access_token}
Content-Type: application/json
```

```json
{
  "bot_id": "bot_1730718000_a8b9c3d4e",
  "message": "https://youtube.com/watch?v=dQw4w9WgXcQ 이 영상 요약해줘",
  "context": {
    "video_url": "https://youtube.com/watch?v=dQw4w9WgXcQ"
  }
}
```

#### 백엔드 실행 흐름

1. 워크플로우 로드
2. MCP 노드 발견
3. 사용자의 MCP 키 조회 (봇 레벨 키 우선, 사용자 레벨 키 폴백)
   - bot_id를 통해 user_id 조회
   - `get_decrypted_keys(user_id, provider_id, bot_id)` 호출
4. MCP 서비스 호출
   ```python
   # app/core/mcp/client.py
   mcp_client = MCPClient(provider_id="youtube-summary", api_keys=decrypted_keys)
   result = await mcp_client.execute(
       action="summarize",
       parameters={
           "video_url": "https://youtube.com/watch?v=dQw4w9WgXcQ",
           "language": "ko",
           "summary_length": "medium"
       }
   )
   ```
5. 결과를 다음 노드로 전달
6. LLM 노드에서 요약 재구성
7. 최종 응답 반환

#### 응답 (200 OK)

```json
{
  "response": "이 영상은 Rick Astley의 'Never Gonna Give You Up' 뮤직비디오입니다...",
  "sources": [
    {
      "type": "mcp",
      "provider": "YouTube Summary",
      "action": "summarize",
      "metadata": {
        "video_id": "dQw4w9WgXcQ",
        "video_title": "Rick Astley - Never Gonna Give You Up",
        "duration": "3:33"
      }
    }
  ],
  "metadata": {
    "workflow_executed": true,
    "nodes_executed": ["start-1", "mcp-youtube-1", "llm-1", "end-1"],
    "execution_time_ms": 5420
  }
}
```

---

## 프론트엔드 구현 가이드

### 1. API 클라이언트 추가

```typescript
// features/mcp/api/mcpApi.ts

import { apiClient } from "@/shared/api/client";
import { API_ENDPOINTS } from "@/shared/constants/apiEndpoints";

export const mcpApi = {
  /**
   * MCP 제공자 목록 조회
   */
  getProviders: async () => {
    const { data } = await apiClient.get(API_ENDPOINTS.MCP.PROVIDERS);
    return data;
  },

  /**
   * MCP 키 등록
   */
  registerKey: async (request: RegisterMCPKeyRequest) => {
    const { data } = await apiClient.post(API_ENDPOINTS.MCP.KEYS, request);
    return data;
  },

  /**
   * MCP 키 목록 조회
   */
  getKeys: async (params?: { provider_id?: string; bot_id?: string; is_active?: boolean }) => {
    const { data } = await apiClient.get(API_ENDPOINTS.MCP.KEYS, { params });
    return data;
  },

  /**
   * MCP 키 삭제
   */
  deleteKey: async (keyId: string) => {
    await apiClient.delete(API_ENDPOINTS.MCP.KEY_DELETE(keyId));
  },
};
```

### 2. API 엔드포인트 상수 추가

```typescript
// shared/constants/apiEndpoints.ts

export const API_ENDPOINTS = {
  // ... 기존 엔드포인트

  // MCP 관리
  MCP: {
    PROVIDERS: "/api/v1/mcp/providers",
    KEYS: "/api/v1/mcp/keys",
    KEY_DELETE: (keyId: string) => `/api/v1/mcp/keys/${keyId}`,
  },
};
```

### 3. 타입 정의

```typescript
// features/mcp/types/mcp.types.ts

export interface MCPProvider {
  provider_id: string;
  name: string;
  description: string;
  icon: string;
  supported_actions: MCPAction[];
  required_keys: MCPKeyRequirement[];
  config_schema: object;
  is_active: boolean;
}

export interface MCPAction {
  action_id: string;
  name: string;
  description: string;
  parameters: MCPParameter[];
}

export interface MCPParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  default?: any;
  options?: any[];
}

export interface MCPKeyRequirement {
  key_name: string;
  display_name: string;
  description: string;
  is_secret: boolean;
  validation_pattern?: string;
}

export interface MCPKey {
  key_id: string;
  user_id: number;
  bot_id?: string | null;
  provider_id: string;
  provider_name: string;
  display_name: string;
  description?: string;
  is_active: boolean;
  keys_registered: string[];
  last_used_at?: string;
  created_at: string;
  user_email: string;
}

export interface RegisterMCPKeyRequest {
  provider_id: string;
  display_name: string;
  description?: string;
  bot_id?: string | null;
  keys: Record<string, string>;
}
```

### 4. Zustand 스토어

```typescript
// features/mcp/stores/mcpStore.ts

import { create } from "zustand";
import { mcpApi } from "../api/mcpApi";
import type { MCPProvider, MCPKey } from "../types/mcp.types";

interface MCPStore {
  // 상태
  providers: MCPProvider[];
  userKeys: MCPKey[];  // 사용자 키 관리
  loading: boolean;

  // 액션
  loadProviders: () => Promise<void>;
  loadUserKeys: () => Promise<void>;
  registerKey: (request: RegisterMCPKeyRequest) => Promise<MCPKey>;
  deleteKey: (keyId: string) => Promise<void>;

  // 헬퍼
  hasKeyForProvider: (provider_id: string) => boolean;
  getKeysForProvider: (provider_id: string) => MCPKey[];
  getProvider: (provider_id: string) => MCPProvider | undefined;
}

export const useMCPStore = create<MCPStore>((set, get) => ({
  providers: [],
  userKeys: [],  // 사용자 키 관리
  loading: false,

  loadProviders: async () => {
    set({ loading: true });
    try {
      const providers = await mcpApi.getProviders();
      set({ providers });
    } finally {
      set({ loading: false });
    }
  },

  loadUserKeys: async () => {
    set({ loading: true });
    try {
      const keysResponse = await mcpApi.getKeys();
      set({ userKeys: keysResponse.keys });
    } finally {
      set({ loading: false });
    }
  },

  registerKey: async (request) => {
    const newKey = await mcpApi.registerKey(request);

    // 목록 갱신
    await get().loadUserKeys();

    return newKey;
  },

  deleteKey: async (keyId) => {
    await mcpApi.deleteKey(keyId);

    // 목록 갱신
    await get().loadUserKeys();
  },

  hasKeyForProvider: (provider_id) => {
    const { userKeys } = get();
    return userKeys.some((k) => k.provider_id === provider_id && k.is_active);
  },

  getKeysForProvider: (provider_id) => {
    const { userKeys } = get();
    return userKeys.filter((k) => k.provider_id === provider_id && k.is_active);
  },

  getProvider: (provider_id) => {
    const { providers } = get();
    return providers.find((p) => p.provider_id === provider_id);
  },
}));
```

### 5. 워크플로우 노드 타입 확장

```typescript
// shared/types/workflow.types.ts

export enum BlockEnum {
  Start = "start",
  LLM = "llm",
  End = "end",
  KnowledgeRetrieval = "knowledge-retrieval",
  MCP = "mcp", // 추가
}

// MCP 노드 타입 추가
export type MCPNodeType = CommonNodeType<{
  type: BlockEnum.MCP;
  provider_id: string;
  provider_name?: string;
  action: string;
  parameters: Record<string, any>;
}>;
```

### 6. MCP 노드 컴포넌트

```typescript
// features/workflow/components/nodes/mcp/node.tsx

import React from "react";
import { NodeProps } from "@/shared/types/workflow.types";
import { BaseNode } from "../_base/node";
import { useMCPStore } from "@/features/mcp/stores/mcpStore";

export const MCPNode: React.FC<NodeProps<MCPNodeType>> = ({ id, data }) => {
  const provider = useMCPStore((state) => state.getProvider(data.provider_id));

  const hasKey = useMCPStore((state) =>
    state.hasKeyForProvider(data.provider_id)
  );

  return (
    <BaseNode
      id={id}
      data={data}
      icon={provider?.icon || "🔌"}
      color={hasKey ? "#10b981" : "#f59e0b"}
      title={data.title || provider?.name || "MCP Service"}
      subtitle={data.action ? `Action: ${data.action}` : undefined}
      warning={!hasKey ? "API 키 필요" : undefined}
    />
  );
};
```

---

## 에러 처리

### 에러 코드 정리

| 코드                 | HTTP | 설명                         |
| -------------------- | ---- | ---------------------------- |
| `VALIDATION_ERROR`   | 400  | 요청 데이터 유효성 검증 실패 |
| `PERMISSION_DENIED`  | 403  | 권한 없음 (본인 소유 키만 관리 가능) |
| `PROVIDER_NOT_FOUND` | 404  | MCP 제공자 없음              |
| `KEY_NOT_FOUND`      | 404  | MCP 키 없음                  |
| `DUPLICATE_KEY`      | 409  | 중복 키                      |
| `KEY_IN_USE`         | 409  | 워크플로우에서 사용 중인 키  |
| `MCP_KEY_REQUIRED`   | 422  | 워크플로우에 MCP 키 필요     |
| `MCP_SERVICE_ERROR`  | 502  | MCP 외부 서비스 호출 실패    |
| `MCP_TIMEOUT`        | 504  | MCP 외부 서비스 타임아웃     |

### 에러 핸들링 예시

```typescript
// shared/api/errorHandler.ts

export const handleMCPError = (error: ApiError) => {
  switch (error.code) {
    case "VALIDATION_ERROR":
      // 폼 필드 에러 표시
      return {
        type: "form",
        fields: error.details,
      };

    case "PERMISSION_DENIED":
      // 권한 없음 알림
      toast.error("권한이 없습니다. 본인 소유의 키만 관리할 수 있습니다.");
      return { type: "toast" };

    case "MCP_KEY_REQUIRED":
      // 키 등록 유도
      return {
        type: "dialog",
        title: "API 키 필요",
        message: error.message,
        action: {
          label: "키 등록하러 가기",
          href: "/settings/mcp",
        },
      };

    case "KEY_IN_USE":
      // 사용 중인 워크플로우 목록 표시
      return {
        type: "dialog",
        title: "키를 삭제할 수 없습니다",
        content: <KeyInUseWarning workflows={error.details.workflows} />,
      };

    case "MCP_SERVICE_ERROR":
      // 외부 서비스 오류
      toast.error("외부 서비스와 통신 중 오류가 발생했습니다");
      return { type: "toast" };

    default:
      toast.error("알 수 없는 오류가 발생했습니다");
      return { type: "toast" };
  }
};
```

---

## 전체 시나리오

### 시나리오 1: 사용자가 YouTube Summary 키 등록

**1단계: 사용자 설정 페이지 접속**

- URL: `/settings/mcp` 또는 `/mcp/keys`
- 사용자: 로그인한 사용자 (본인 키 관리)

**2단계: MCP 제공자 목록 조회**

```http
GET /api/v1/mcp/providers
Authorization: Bearer {jwt_token}
```

응답: YouTube Summary, Slack 등 제공자 목록

**3단계: YouTube API 키 등록**

- 사용자가 "키 추가" 버튼 클릭
- 제공자 선택: YouTube Summary
- 키 입력 폼 표시 (required_keys 기반)
- 사용자가 API 키 입력

```http
POST /api/v1/mcp/keys
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "provider_id": "youtube-summary",
  "display_name": "프로덕션 YouTube 키",
  "description": "메인 서비스용 YouTube API 키",
  "keys": {
    "api_key": "AIzaSyD1234567890abcdefghijklmnopqrstuvwxyz"
  }
}
```

**4단계: 키 등록 완료**

```json
{
  "key_id": "mcp_key_1730718000_a8b9c3d4e",
  "user_id": 123,
  "bot_id": null,
  "provider_id": "youtube-summary",
  "provider_name": "YouTube Summary",
  "display_name": "프로덕션 YouTube 키",
  "description": "메인 서비스용 YouTube API 키",
  "is_active": true,
  "keys_registered": ["api_key"],
  "last_used_at": null,
  "created_at": "2025-11-10T12:00:00Z",
  "user_email": "user@example.com"
}
```

**5단계: 프론트엔드 상태 업데이트**

- 키 목록 갱신
- 성공 토스트 표시
- 워크플로우 빌더에서 해당 노드 사용 가능

---

### 시나리오 2: 개발자가 YouTube 요약 워크플로우 생성

**1단계: 봇 생성 페이지에서 워크플로우 빌더 접속**

- URL: `/bots/new` 또는 `/bots/{bot_id}/edit`

**2단계: 워크플로우 빌더 초기화**

```typescript
// 페이지 로드 시
useEffect(() => {
  // 노드 타입 목록 조회
  workflowApi.getNodeTypes();

  // MCP 제공자 목록 조회
  mcpStore.loadProviders();

  // 사용자의 MCP 키 목록 조회
  mcpStore.loadTeamKeys();
}, []);
```

**3단계: 사이드바에서 YouTube Summary 노드 드래그**

- 사용자가 "YouTube Summary" 노드를 캔버스에 드롭
- 노드 ID: `mcp-youtube-1`
- 노드 데이터:
  ```json
  {
    "type": "mcp",
    "provider_id": "youtube-summary",
    "title": "YouTube Summary",
    "desc": ""
  }
  ```

**4단계: 노드 설정 패널 열림**

- 자동으로 노드 설정 패널 표시
- API 키 확인 (이미 등록됨)
- 액션 선택 드롭다운: "Summarize Video" 선택
- 파라미터 입력 폼 표시:
  - `video_url`: 텍스트 입력 또는 `{user_input.video_url}` 변수
  - `language`: 드롭다운 (ko, en, ja)
  - `summary_length`: 드롭다운 (short, medium, long)

**5단계: 파라미터 설정**

```json
{
  "action": "summarize",
  "parameters": {
    "video_url": "{user_input.video_url}",
    "language": "ko",
    "summary_length": "medium"
  }
}
```

**6단계: 나머지 노드 추가 및 연결**

- Start → MCP (YouTube) → LLM → End
- LLM 노드의 프롬프트: `{mcp-youtube-1.output}을 요약해주세요`

**7단계: 워크플로우 저장**

```http
PUT /api/v1/workflows/bots/{bot_id}/workflow
Authorization: Bearer {jwt_token}

{
  "nodes": [
    { "id": "start-1", "type": "start", ... },
    { "id": "mcp-youtube-1", "type": "mcp", "data": { ... } },
    { "id": "llm-1", "type": "llm", ... },
    { "id": "end-1", "type": "end", ... }
  ],
  "edges": [ ... ]
}
```

**8단계: 백엔드 검증**

- MCP 노드 감지
- `youtube-summary` 제공자의 키가 사용자(또는 봇 레벨)에 등록되어 있는지 확인
- 검증 성공 → 200 OK
- 검증 실패 → 422 Unprocessable Entity (키 필요)

---

### 시나리오 3: 사용자가 챗봇으로 YouTube 영상 요약 요청

**1단계: 채팅 페이지에서 메시지 전송**

```http
POST /api/v1/chat
Authorization: Bearer {jwt_token}

{
  "bot_id": "bot_1730718000_a8b9c3d4e",
  "message": "https://youtube.com/watch?v=dQw4w9WgXcQ 이 영상 요약해줘",
  "context": {
    "video_url": "https://youtube.com/watch?v=dQw4w9WgXcQ"
  }
}
```

**2단계: 백엔드 워크플로우 실행**

```python
# app/services/workflow_executor.py

async def execute_workflow(bot_id, user_message, context):
    # 1. 워크플로우 로드
    workflow = await get_bot_workflow(bot_id)

    # 2. 실행 컨텍스트 초기화
    execution_context = {
        "user_message": user_message,
        "user_input": context,
        "node_outputs": {}
    }

    # 3. 노드 순차 실행
    for node in workflow.nodes:
        if node.type == "start":
            # 시작 노드
            result = await execute_start_node(node, execution_context)

        elif node.type == "mcp":
            # MCP 노드
            # 3-1. 사용자의 MCP 키 조회 (봇 레벨 → 사용자 레벨 폴백)
            mcp_key = await get_user_mcp_key(
                user_id=bot.user_id,
                bot_id=bot.bot_id,
                provider_id=node.data.provider_id
            )

            if not mcp_key or not mcp_key.is_active:
                raise MCPKeyRequiredError(
                    f"MCP key required for {node.data.provider_id}"
                )

            # 3-2. 파라미터 변수 치환
            parameters = resolve_variables(
                node.data.parameters,
                execution_context
            )
            # {user_input.video_url} → https://youtube.com/watch?v=...

            # 3-3. MCP 서비스 호출
            mcp_client = MCPClient(
                provider_id=node.data.provider_id,
                api_key=decrypt(mcp_key.encrypted_value)
            )

            result = await mcp_client.execute(
                action=node.data.action,
                parameters=parameters
            )

            # 3-4. 결과를 컨텍스트에 저장
            execution_context["node_outputs"][node.id] = {
                "output": result,
                "metadata": {
                    "provider": node.data.provider_id,
                    "action": node.data.action
                }
            }

            # 3-5. last_used_at 업데이트
            await update_mcp_key_last_used(mcp_key.id)

        elif node.type == "llm":
            # LLM 노드
            result = await execute_llm_node(node, execution_context)

        elif node.type == "end":
            # 종료 노드
            result = await execute_end_node(node, execution_context)

    # 4. 최종 응답 반환
    return {
        "response": execution_context["node_outputs"]["llm-1"]["output"],
        "sources": [...],
        "metadata": {
            "workflow_executed": True,
            "nodes_executed": [n.id for n in workflow.nodes]
        }
    }
```

**3단계: 응답 반환**

```json
{
  "response": "이 영상은 Rick Astley의 'Never Gonna Give You Up' 뮤직비디오입니다. 1987년에 발매된 이 노래는...",
  "sources": [
    {
      "type": "mcp",
      "provider": "YouTube Summary",
      "action": "summarize",
      "metadata": {
        "video_id": "dQw4w9WgXcQ",
        "video_title": "Rick Astley - Never Gonna Give You Up",
        "duration": "3:33"
      }
    }
  ],
  "metadata": {
    "workflow_executed": true,
    "nodes_executed": ["start-1", "mcp-youtube-1", "llm-1", "end-1"],
    "execution_time_ms": 5420
  }
}
```

**4단계: 프론트엔드에서 응답 표시**

- 메시지 버블에 응답 텍스트 표시
- Sources 섹션에 "YouTube Summary" 배지 표시
- 메타데이터는 개발자 모드에서만 표시 (옵션)

---

### 시나리오 4: 관리자가 사용 중인 MCP 키 삭제 시도

**1단계: 키 삭제 시도**

```http
DELETE /api/v1/mcp/keys/mcp_key_1730718000_a8b9c3d4e
Authorization: Bearer {jwt_token}
```

**2단계: 백엔드 검증**

```python
# app/services/mcp_service.py

async def delete_mcp_key(key_id: str, user_id: int):
    # 1. 키 조회
    key = await get_mcp_key(key_id)

    # 2. 사용 중인 워크플로우 확인
    workflows = await find_workflows_using_mcp_provider(
        user_id=key.user_id,
        provider_id=key.provider_id
    )

    if workflows:
        raise KeyInUseError(
            message="이 키를 사용하는 워크플로우가 있어 삭제할 수 없습니다",
            workflows=[
                {
                    "bot_id": w.bot_id,
                    "bot_name": w.name,
                    "node_count": count_mcp_nodes(w, key.provider_id)
                }
                for w in workflows
            ]
        )

    # 3. 삭제
    await db.delete(key)
    await db.commit()
```

**3단계: 에러 응답**

```json
{
  "error": {
    "code": "KEY_IN_USE",
    "message": "이 키를 사용하는 워크플로우가 있어 삭제할 수 없습니다",
    "details": {
      "workflows": [
        {
          "bot_id": "bot_123",
          "bot_name": "고객 지원 봇",
          "node_count": 2
        },
        {
          "bot_id": "bot_456",
          "bot_name": "YouTube 요약 봇",
          "node_count": 1
        }
      ]
    }
  }
}
```

**4단계: 프론트엔드 경고 다이얼로그**

```typescript
// 사용 중인 워크플로우 목록 표시
showWarningDialog({
  title: "키를 삭제할 수 없습니다",
  message: "이 키를 사용하는 워크플로우가 있습니다",
  content: (
    <List>
      {error.details.workflows.map((w) => (
        <ListItem key={w.bot_id}>
          <ListItemText
            primary={w.bot_name}
            secondary={`MCP 노드 ${w.node_count}개 사용 중`}
          />
          <Button onClick={() => navigate(`/bots/${w.bot_id}/edit`)}>
            수정
          </Button>
        </ListItem>
      ))}
    </List>
  ),
  actions: [
    {
      label: "확인",
      onClick: closeDialog,
    },
  ],
});
```

---

## 백엔드 구현 상세

### 데이터베이스 마이그레이션

```python
# alembic/versions/xxx_add_mcp_tables.py

def upgrade():
    # MCP 제공자 테이블
    op.create_table(
        'mcp_providers',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('provider_id', sa.String(50), unique=True, nullable=False, index=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('icon', sa.String(500)),  # 이모지 또는 URL
        sa.Column('supported_actions', sa.Text(), nullable=False),  # JSON 문자열
        sa.Column('required_keys', sa.Text(), nullable=False),  # JSON 문자열
        sa.Column('config_schema', sa.Text()),  # JSON 문자열
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now())
    )

    # MCP 키 테이블
    op.create_table(
        'mcp_keys',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('key_id', sa.String(50), unique=True, nullable=False, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('bot_id', sa.String(50), sa.ForeignKey('bots.bot_id', ondelete='CASCADE'), nullable=True, index=True),
        sa.Column('provider_id', sa.String(50), sa.ForeignKey('mcp_providers.provider_id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('encrypted_blob', sa.Text(), nullable=False),  # AES-256-GCM 암호화된 키 값들 (JSON)
        sa.Column('display_name', sa.String(200), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('last_used_at', sa.DateTime(timezone=True)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now())
    )

    # 인덱스 생성
    op.create_index('idx_user_provider', 'mcp_keys', ['user_id', 'provider_id'])
    op.create_index('idx_user_provider_display', 'mcp_keys', ['user_id', 'provider_id', 'display_name'], unique=True)
```

### MCP 제공자 시드 데이터

```python
# app/core/mcp/seed_providers.py

async def seed_mcp_providers(db: AsyncSession):
    """초기 MCP 제공자 데이터 생성"""

    providers = [
        {
            "provider_id": "youtube-summary",
            "name": "YouTube Summary",
            "description": "YouTube 영상 요약 생성 서비스",
            "icon": "🎥",
            "supported_actions": json.dumps([
                {
                    "action_id": "summarize",
                    "name": "Summarize Video",
                    "description": "YouTube 영상을 분석하여 요약 생성",
                    "parameters": [
                        {
                            "name": "video_url",
                            "type": "string",
                            "required": True,
                            "description": "YouTube 영상 URL"
                        },
                        {
                            "name": "language",
                            "type": "string",
                            "required": False,
                            "default": "ko",
                            "options": ["ko", "en", "ja"]
                        }
                    ]
                }
            ]),
            "required_keys": json.dumps([
                {
                    "key_name": "api_key",
                    "display_name": "YouTube API Key",
                    "description": "Google Cloud Console에서 발급받은 YouTube Data API v3 키",
                    "is_secret": True,
                    "validation_pattern": "^AIza[0-9A-Za-z-_]{35}$"
                }
            ]),
            "config_schema": json.dumps({
                "type": "object",
                "properties": {
                    "action": {
                        "type": "string",
                        "enum": ["summarize"]
                    },
                    "parameters": {
                        "type": "object"
                    }
                },
                "required": ["action"]
            }),
            "is_active": True
        },
        {
            "provider_id": "slack",
            "name": "Slack Integration",
            "description": "Slack 메시지 전송 및 채널 관리",
            "icon": "💬",
            "supported_actions": json.dumps([
                {
                    "action_id": "send_message",
                    "name": "Send Message",
                    "description": "Slack 채널에 메시지 전송",
                    "parameters": [
                        {
                            "name": "channel",
                            "type": "string",
                            "required": True
                        },
                        {
                            "name": "message",
                            "type": "string",
                            "required": True
                        }
                    ]
                }
            ]),
            "required_keys": json.dumps([
                {
                    "key_name": "bot_token",
                    "display_name": "Slack Bot Token",
                    "description": "Slack App Bot User OAuth Token",
                    "is_secret": True,
                    "validation_pattern": "^xoxb-[0-9]+-[0-9]+-[a-zA-Z0-9]+$"
                }
            ]),
            "config_schema": json.dumps({
                "type": "object",
                "properties": {
                    "action": {
                        "type": "string",
                        "enum": ["send_message"]
                    },
                    "parameters": {
                        "type": "object"
                    }
                },
                "required": ["action"]
            }),
            "is_active": True
        }
    ]

    for provider_data in providers:
        provider = MCPProvider(**provider_data)
        db.add(provider)

    await db.commit()
```

---

## 보안 고려사항

### 1. API 키 암호화

- **AES-256-GCM 암호화**: 양방향 암호화로 키 값 보호 (실제 사용 시 복호화 필요)
- **Nonce**: 96비트 랜덤 nonce 생성
- **마스터 키**: 환경 변수 `MCP_ENCRYPTION_KEY`에서 관리

```python
# app/core/mcp/crypto.py

import os
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from typing import Optional

_aesgcm: Optional[AESGCM] = None

def _get_aesgcm() -> AESGCM:
    """지연 초기화로 .env 설정 전에도 import 가능"""
    global _aesgcm
    if _aesgcm is not None:
        return _aesgcm

    from app.config import settings
    encryption_key = settings.mcp_encryption_key
    key_bytes = base64.b64decode(encryption_key)
    _aesgcm = AESGCM(key_bytes)
    return _aesgcm

def encrypt(plain_text: str) -> str:
    """API 키를 AES-256-GCM으로 암호화"""
    aesgcm = _get_aesgcm()
    nonce = os.urandom(12)  # 96비트
    ciphertext = aesgcm.encrypt(nonce, plain_text.encode(), None)
    # nonce + ciphertext를 Base64로 인코딩
    return base64.b64encode(nonce + ciphertext).decode()

def decrypt(encrypted_text: str) -> str:
    """암호화된 API 키를 복호화"""
    aesgcm = _get_aesgcm()
    data = base64.b64decode(encrypted_text)
    nonce = data[:12]
    ciphertext = data[12:]
    plaintext = aesgcm.decrypt(nonce, ciphertext, None)
    return plaintext.decode()
```

### 2. 사용자별 격리

- 각 사용자는 자신의 키만 조회 가능
- JWT에서 user_id 추출
- 모든 쿼리에 user_id 필터 적용
- 봇 레벨 키는 추가로 bot_id 필터 적용

### 3. 권한 관리

- **키 등록/삭제**: 사용자 본인만
- **키 조회**: 사용자 본인만
- **키 사용**: 워크플로우 실행 시 자동 (봇 소유자 검증)

### 4. Rate Limiting

- MCP 외부 서비스 호출에 Rate Limit 적용
- 제공자별 다른 제한:
  - YouTube API: 분당 100회
  - Slack API: 분당 1회 (Tier 1)

---

## 성능 최적화

### 1. MCP 키 캐싱

```python
# app/core/mcp/cache.py

from functools import lru_cache
from typing import Optional

@lru_cache(maxsize=1000)
async def get_user_mcp_key_cached(
    user_id: int,
    bot_id: Optional[str],
    provider_id: str
) -> Optional[MCPKey]:
    """사용자의 MCP 키 조회 (캐시 적용, 봇 레벨 → 사용자 레벨 폴백)"""
    # Redis 캐시 확인
    cache_key = f"mcp:key:{user_id}:{bot_id or 'global'}:{provider_id}"
    cached = await redis_client.get(cache_key)

    if cached:
        return MCPKey.parse_raw(cached)

    # DB에서 조회 (봇 레벨 우선, 없으면 사용자 레벨)
    # 1. 봇 레벨 키 조회
    if bot_id:
        key = await db.query(MCPKey).filter(
            MCPKey.user_id == user_id,
            MCPKey.bot_id == bot_id,
            MCPKey.provider_id == provider_id,
            MCPKey.is_active == True
        ).first()
        if key:
            return key

    # 2. 사용자 레벨 키 조회 (폴백)
    key = await db.query(MCPKey).filter(
        MCPKey.user_id == user_id,
        MCPKey.bot_id == None,
        MCPKey.provider_id == provider_id,
        MCPKey.is_active == True
    ).first()

    if key:
        # 캐시에 저장 (5분)
        await redis_client.setex(
            cache_key,
            300,
            key.json()
        )

    return key
```

### 2. MCP 제공자 정보 캐싱

- 애플리케이션 시작 시 메모리에 로드
- 변경 시 캐시 무효화

### 3. 비동기 MCP 호출

```python
# app/core/mcp/client.py

import httpx

class MCPClient:
    def __init__(self, provider_id: str, api_key: str):
        self.provider_id = provider_id
        self.api_key = api_key
        self.client = httpx.AsyncClient(timeout=30.0)

    async def execute(
        self,
        action: str,
        parameters: dict
    ) -> dict:
        """MCP 액션 실행"""
        # 제공자별 구현
        if self.provider_id == "youtube-summary":
            return await self._youtube_summarize(parameters)
        elif self.provider_id == "slack":
            return await self._slack_send_message(parameters)
        else:
            raise ValueError(f"Unsupported provider: {self.provider_id}")
```

---

## 테스트

### 단위 테스트

```python
# tests/unit/test_mcp_service.py

import pytest
from app.services.mcp_service import MCPService

@pytest.mark.asyncio
async def test_register_mcp_key():
    """MCP 키 등록 테스트"""
    service = MCPService()

    key = await service.register_key(
        user_id=1,
        bot_id=None,  # 사용자 레벨 키
        provider_id="youtube-summary",
        display_name="Test Key",
        keys={"api_key": "AIza123..."}
    )

    assert key.provider_id == "youtube-summary"
    assert key.is_active == True
    assert key.encrypted_value != "AIza123..."  # 암호화됨

@pytest.mark.asyncio
async def test_delete_key_in_use():
    """사용 중인 키 삭제 시도"""
    service = MCPService()

    with pytest.raises(KeyInUseError) as exc:
        await service.delete_key("mcp_key_123")

    assert "워크플로우" in str(exc.value)
```

### 통합 테스트

```python
# tests/integration/test_mcp_workflow.py

@pytest.mark.asyncio
async def test_mcp_workflow_execution(client, auth_headers):
    """MCP 노드 포함 워크플로우 실행 테스트"""

    # 1. 봇 생성
    response = await client.post(
        "/api/v1/bots",
        json={
            "name": "Test Bot",
            "workflow": {
                "nodes": [
                    {"id": "start-1", "type": "start", ...},
                    {
                        "id": "mcp-1",
                        "type": "mcp",
                        "data": {
                            "provider_id": "youtube-summary",
                            "action": "summarize",
                            "parameters": {...}
                        }
                    },
                    ...
                ],
                "edges": [...]
            }
        },
        headers=auth_headers
    )

    assert response.status_code == 201
    bot_id = response.json()["data"]["id"]

    # 2. 챗봇 실행
    response = await client.post(
        "/api/v1/chat",
        json={
            "bot_id": bot_id,
            "message": "Test message"
        },
        headers=auth_headers
    )

    assert response.status_code == 200
    assert "response" in response.json()
```

---

## 마이그레이션 계획

### Phase 1: 백엔드 구현 (2주)

- [x] 데이터베이스 마이그레이션
- [x] MCP 모델 및 스키마 정의
- [x] MCP API 엔드포인트 구현
- [x] MCP 클라이언트 (YouTube, Slack)
- [x] MCPNode 노드 클래스 구현
- [x] 워크플로우 엔진에 MCP 노드 통합

### Phase 2: 프론트엔드 구현 (2주)

- [ ] MCP API 클라이언트 추가
- [ ] MCP 스토어 및 타입 정의
- [ ] 사용자 설정 페이지: MCP 키 관리 탭 (봇 레벨 스코핑 지원)
- [ ] 워크플로우 빌더: MCP 노드 컴포넌트
- [ ] 워크플로우 빌더: 노드 설정 패널 확장

### Phase 3: 테스트 및 배포 (1주)

- [ ] 단위 테스트
- [ ] 통합 테스트
- [ ] E2E 테스트
- [ ] 문서 작성
- [ ] 프로덕션 배포

---

## 추가 확장 가능성

### 향후 지원 예정 MCP 제공자

1. **Notion**: Notion 페이지 조회/생성
2. **Google Drive**: 파일 업로드/다운로드
3. **Gmail**: 이메일 전송/조회
4. **Zapier**: Zapier Webhook 연동
5. **Custom HTTP**: 임의의 HTTP API 호출

### 고급 기능

1. **MCP 키 로테이션**: 주기적으로 키 갱신
2. **MCP 사용량 모니터링**: 제공자별 호출 횟수, 비용 추적
3. **MCP 오류 알림**: 외부 서비스 장애 시 팀에 알림
4. **MCP 테스트 모드**: 실제 호출 전 파라미터 검증

---

## 결론

이 명세서는 MCP 통합 기능의 완전한 API 설계를 제공합니다. 프론트엔드와 백엔드 개발자가 이 문서를 바탕으로 병렬로 개발을 진행할 수 있으며, 각 단계에서 정확히 어떤 데이터를 주고받아야 하는지 명확하게 정의되어 있습니다.

주요 특징:

- **사용자별 격리**: 각 사용자는 독립적인 MCP 키 관리 (봇 레벨 스코핑 지원)
- **유연한 확장성**: 새로운 MCP 제공자 추가 용이
- **강력한 보안**: AES-256-GCM 암호화, JWT 인증, 권한 관리
- **명확한 에러 처리**: 모든 에러 상황에 대한 명확한 응답
- **최적화된 성능**: 캐싱, 비동기 처리

문의사항이나 개선 제안은 개발 팀에 문의하세요.
