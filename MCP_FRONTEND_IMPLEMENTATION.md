# MCP 프론트엔드 구현 완료 보고서

## 작성일

2025-01-11 (최종 업데이트: 2025-01-11)

## 프론트엔드 개발자 작업 범위

MCP (Model Context Protocol) 통합 기능의 **프론트엔드 구현을 완료**했습니다.

---

## 🎯 백엔드 개발자 빠른 시작 가이드

### 현재 상황

- ✅ **프론트엔드**: 완벽하게 구현 완료 (UI, API 클라이언트, 워크플로우 통합)
- ⏳ **백엔드**: 구현 필요 (데이터베이스, API 엔드포인트, 암호화)

### 백엔드 개발자가 해야 할 일 (우선순위 순)

#### 🔴 **1단계: 필수 구현 (프론트엔드 기능 동작을 위한 최소 요구사항)**

1. **데이터베이스 설정** (30분)

   - `MCPProvider`, `MCPKey` 모델 생성
   - Alembic 마이그레이션 실행

2. **암호화 모듈** (20분)

   - AES-256-GCM 암호화/복호화 함수 구현
   - 환경변수에 암호화 키 설정

3. **MCP API 엔드포인트** (2시간)

   - 6개 엔드포인트 구현 (아래 체크리스트 참고)
   - 라우터를 FastAPI 앱에 등록

4. **시드 데이터** (30분)
   - 기본 MCP 제공자 추가 (YouTube, Slack 등)

#### 🟡 **2단계: 선택 구현 (나중에 추가 가능)**

- 워크플로우 실행 엔진에 MCP 노드 통합
- MCP 키 업데이트/비활성화 API
- 관리자용 제공자 관리 API

### 📋 백엔드 구현 체크리스트

현재 프론트엔드에서 호출하는 API를 체크리스트로 정리했습니다. 모든 항목을 체크해야 프론트엔드가 정상 작동합니다.

#### API 엔드포인트

- [ ] `GET /api/v1/mcp/providers` - MCP 제공자 목록 조회
- [ ] `GET /api/v1/mcp/providers/{provider_id}` - 특정 제공자 조회
- [ ] `POST /api/v1/mcp/keys` - MCP 키 생성 (암호화 필수)
- [ ] `GET /api/v1/mcp/keys` - 키 목록 조회 (필터링: provider_id, bot_id, is_active)
- [ ] `GET /api/v1/mcp/keys/{key_id}` - 특정 키 조회
- [ ] `DELETE /api/v1/mcp/keys/{key_id}` - 키 삭제

#### 데이터베이스

- [ ] `MCPProvider` 모델 생성 및 마이그레이션
- [ ] `MCPKey` 모델 생성 및 마이그레이션
- [ ] User FK, Bot FK 설정
- [ ] 인덱스 설정 (provider_id, user_id)

#### 보안

- [ ] AES-256-GCM 암호화 모듈 구현
- [ ] 환경변수에 32바이트 암호화 키 설정
- [ ] 키 생성 시 암호화, 응답 시 복호화하지 않음 (보안)

#### 시드 데이터

- [ ] YouTube Summary 제공자 추가
- [ ] Slack 제공자 추가 (선택)
- [ ] 기타 제공자 추가 (선택)

#### 워크플로우 통합

- [ ] `/api/v1/workflows/node-types`에 MCP 노드 타입 추가
- [ ] 워크플로우 저장 시 MCP 노드 데이터 (provider_id, action, parameters) 정상 처리 확인

---

## 📊 프론트엔드 구현 완료 현황 (2025-01-11 기준)

### ✅ 완료된 기능

1. **MCP 타입 시스템** - TypeScript 인터페이스 전체 정의
2. **API 클라이언트** - 6개 엔드포인트 호출 함수 구현
3. **MCP 노드 UI** - 워크플로우 캔버스에 표시되는 노드 컴포넌트
4. **MCP 노드 설정 패널** - 제공자/액션/파라미터 선택 UI
5. **MCP 키 관리 페이지** - 키 목록, 추가 모달, 삭제 기능
6. **워크플로우 직렬화** - MCP 노드 데이터 저장/불러오기 로직
7. **TypeScript 빌드** - 모든 타입 오류 해결 완료

### 🔧 최근 수정사항 (2025-01-11)

1. **MCPNodeConfig.tsx** - `updateNode` 함수 사용 및 타입 안전성 확보
2. **MCPKeyManagement.tsx** - 키 추가 모달 완전 구현 (폼 검증, API 호출)
3. **workflowTransform.ts** - MCP 노드 직렬화/역직렬화 로직 추가
4. **workflowTransform.types.ts** - BackendNode에 MCP 필드 추가

### 프론트엔드에서 기대하는 데이터 형식

#### 1. `GET /api/v1/mcp/providers` 응답 예시

```json
[
  {
    "provider_id": "youtube-summary",
    "name": "YouTube Summary",
    "description": "YouTube 영상을 요약합니다.",
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
            "description": "YouTube 영상 URL"
          },
          {
            "name": "language",
            "type": "string",
            "required": false,
            "default": "ko",
            "options": ["ko", "en", "ja"],
            "description": "요약 언어"
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
    "config_schema": null,
    "is_active": true
  }
]
```

#### 2. `POST /api/v1/mcp/keys` 요청 예시

```json
{
  "provider_id": "youtube-summary",
  "bot_id": null,
  "display_name": "프로덕션 YouTube 키",
  "description": "메인 서비스용 YouTube API 키",
  "keys": {
    "api_key": "AIzaSyC1234567890abcdefghijklmnopqrstuv"
  }
}
```

#### 3. `GET /api/v1/mcp/keys` 응답 예시

```json
{
  "total": 2,
  "keys": [
    {
      "key_id": "mcp_key_abc123",
      "user_id": 1,
      "bot_id": null,
      "provider_id": "youtube-summary",
      "provider_name": "YouTube Summary",
      "display_name": "프로덕션 YouTube 키",
      "description": "메인 서비스용 YouTube API 키",
      "is_active": true,
      "keys_registered": ["api_key"],
      "last_used_at": "2025-01-11T10:30:00Z",
      "created_at": "2025-01-10T15:00:00Z",
      "user_email": "user@example.com"
    }
  ]
}
```

**중요**: 응답에는 **실제 키 값을 포함하지 않습니다** (보안). `keys_registered`는 등록된 키의 이름 목록만 반환합니다.

#### 4. 워크플로우 저장 시 프론트엔드가 보내는 MCP 노드 데이터 형식

백엔드는 워크플로우 저장/불러오기 API에서 다음과 같은 MCP 노드 데이터를 처리해야 합니다:

```json
{
  "nodes": [
    {
      "id": "node_abc123",
      "type": "mcp",
      "position": {"x": 300, "y": 200},
      "data": {
        "title": "YouTube 요약",
        "desc": "영상 요약 서비스",
        "type": "mcp",
        "provider_id": "youtube-summary",
        "action": "summarize",
        "parameters": {
          "video_url": "https://youtube.com/watch?v=...",
          "language": "ko"
        }
      }
    }
  ],
  "edges": [...]
}
```

**백엔드가 확인해야 할 사항:**

1. `data.provider_id`: MCP 제공자 ID (예: "youtube-summary")
2. `data.action`: 실행할 액션 ID (예: "summarize")
3. `data.parameters`: 액션 파라미터 (JSON 객체)
4. 이 3개 필드는 **반드시 저장하고 불러올 때 그대로 반환**해야 합니다
5. 프론트엔드의 `workflowTransform.ts`가 자동으로 직렬화/역직렬화를 처리합니다

**데이터베이스 저장 예시** (워크플로우 테이블의 JSON 컬럼):

```sql
-- bots 테이블의 workflow 컬럼 (JSON 타입)
{
  "nodes": [
    {
      "id": "node_abc123",
      "type": "mcp",
      "position": {"x": 300, "y": 200},
      "data": {
        "title": "YouTube 요약",
        "type": "mcp",
        "provider_id": "youtube-summary",  -- ⭐ 저장 필수
        "action": "summarize",              -- ⭐ 저장 필수
        "parameters": {...}                 -- ⭐ 저장 필수
      }
    }
  ]
}
```

**⚠️ 주의**: `provider_id`, `action`, `parameters` 필드를 누락하면 프론트엔드에서 MCP 노드 설정이 사라집니다!

---

## 구현 완료 항목

### 1. MCP 타입 정의

**파일**: `Frontend/my-project/src/features/mcp/types/mcp.types.ts`

```typescript
export interface MCPProvider {
  provider_id: string;
  name: string;
  description: string | null;
  icon: string | null;
  supported_actions: MCPAction[];
  required_keys: RequiredKeyInfo[];
  config_schema: object | null;
  is_active: boolean;
}

export interface MCPKeyResponse {
  key_id: string;
  user_id: number;
  bot_id: string | null;
  provider_id: string;
  provider_name: string;
  display_name: string;
  description: string | null;
  is_active: boolean;
  keys_registered: string[];
  last_used_at: string | null;
  created_at: string;
  user_email: string;
}
```

### 2. API 클라이언트

**파일**: `Frontend/my-project/src/features/mcp/api/mcpApi.ts`

다음 API 엔드포인트 클라이언트를 구현했습니다:

- `getProviders()`: MCP 제공자 목록 조회
- `getProvider(providerId)`: 특정 MCP 제공자 조회
- `createKey(keyData)`: MCP 키 생성
- `listKeys(params)`: MCP 키 목록 조회 (provider_id, bot_id, is_active 필터 지원)
- `getKey(keyId)`: 특정 MCP 키 조회
- `deleteKey(keyId)`: MCP 키 삭제

### 3. API 엔드포인트 상수

**파일**: `Frontend/my-project/src/shared/constants/apiEndpoints.ts`

```typescript
MCP: {
  PROVIDERS: '/api/v1/mcp/providers',
  PROVIDER_DETAIL: (providerId: string) => `/api/v1/mcp/providers/${providerId}`,
  KEYS: '/api/v1/mcp/keys',
  KEY_DETAIL: (keyId: string) => `/api/v1/mcp/keys/${keyId}`,
}
```

### 4. Workflow 타입 확장

**파일**: `Frontend/my-project/src/shared/types/workflow.types.ts`

- `BlockEnum`에 `MCP = 'mcp'` 추가
- `MCPNodeType` 타입 정의:
  ```typescript
  export type MCPNodeType = CommonNodeType<{
    type: BlockEnum.MCP;
    provider_id?: string;
    action?: string;
    parameters?: Record<string, any>;
  }>;
  ```

### 5. MCP 노드 컴포넌트

**파일**: `Frontend/my-project/src/features/workflow/components/nodes/mcp/node.tsx`

워크플로우 캔버스에 표시되는 MCP 노드 UI 컴포넌트를 구현했습니다.

### 6. MCP 노드 설정 패널

**파일**: `Frontend/my-project/src/features/workflow/components/NodeConfigPanel/configs/MCPNodeConfig.tsx`

MCP 노드 선택 시 우측 패널에 표시되는 설정 UI:

- MCP 제공자 선택 드롭다운
- 액션 선택 드롭다운
- 액션 파라미터 입력 폼 (동적 생성)

**파일**: `Frontend/my-project/src/features/workflow/components/NodeConfigPanel/NodeConfigPanel.tsx`

NodeConfigPanel에 MCP 케이스 추가:

```typescript
{
  isMCPNode && <MCPNodeConfig />;
}
```

### 7. 워크플로우 빌더 통합

**파일**: `Frontend/my-project/src/features/workflow/components/WorkflowBuilder/ContextMenu.tsx`

- 아이콘 매핑에 `plug: '🔌'` 추가
- Fallback 노드 타입에 MCP 추가:
  ```typescript
  { type: 'mcp', label: 'MCP Service', icon: 'plug', max_instances: -1, configurable: true }
  ```

**파일**: `Frontend/my-project/src/features/workflow/components/nodes/components.ts`

노드 컴포넌트 매핑에 MCP 추가:

```typescript
[BlockEnum.MCP]: MCPNode,
```

### 8. MCP 키 관리 컴포넌트

**파일**: `Frontend/my-project/src/features/mcp/components/MCPKeyManagement.tsx`

MCP 키를 관리하는 UI 페이지 컴포넌트:

- 등록된 키 목록 표시
- 키 삭제 기능
- 사용 가능한 제공자 목록 표시

---

## 백엔드 개발자가 구현해야 할 사항

### 1. 필수 구현 사항

#### 1.1 데이터베이스 모델 및 마이그레이션

**파일**: `Backend/app/models/mcp.py` (신규 생성)

```python
class MCPProvider(Base):
    __tablename__ = "mcp_providers"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(500), nullable=True)

    # JSON으로 저장
    supported_actions = Column(Text, nullable=False)  # JSON
    required_keys = Column(Text, nullable=False)  # JSON
    config_schema = Column(Text, nullable=True)  # JSON

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class MCPKey(Base):
    __tablename__ = "mcp_keys"

    id = Column(Integer, primary_key=True, index=True)
    key_id = Column(String(50), unique=True, index=True, nullable=False)

    # 소유권 (사용자 기반)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    provider_id = Column(String(50), ForeignKey("mcp_providers.provider_id"), nullable=False)
    bot_id = Column(String(50), ForeignKey("bots.bot_id"), nullable=True)  # 봇 레벨 스코핑

    # 암호화된 키 값 (AES-256-GCM)
    encrypted_blob = Column(Text, nullable=False)

    display_name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    last_used_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

**마이그레이션 파일 생성**:

```bash
alembic revision --autogenerate -m "Add MCP tables"
alembic upgrade head
```

#### 1.2 Pydantic 스키마

**파일**: `Backend/app/schemas/mcp.py` (신규 생성)

```python
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class MCPProviderResponse(BaseModel):
    provider_id: str
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    supported_actions: List[Dict[str, Any]]
    required_keys: List[Dict[str, Any]]
    config_schema: Optional[Dict[str, Any]]
    is_active: bool

class MCPKeyCreate(BaseModel):
    provider_id: str
    bot_id: Optional[str] = None
    display_name: str
    description: Optional[str] = None
    keys: Dict[str, str]  # {"api_key": "AIza123..."}

class MCPKeyResponse(BaseModel):
    key_id: str
    user_id: int
    bot_id: Optional[str]
    provider_id: str
    provider_name: str
    display_name: str
    description: Optional[str]
    is_active: bool
    keys_registered: List[str]
    last_used_at: Optional[datetime]
    created_at: datetime
    user_email: str

class MCPKeyListResponse(BaseModel):
    total: int
    keys: List[MCPKeyResponse]
```

#### 1.3 API 엔드포인트

**파일**: `Backend/app/api/v1/endpoints/mcp.py` (신규 생성)

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.auth.dependencies import get_current_user_from_jwt
from app.models.user import User

router = APIRouter()

@router.get("/providers", response_model=List[MCPProviderResponse])
async def get_providers(
    current_user: User = Depends(get_current_user_from_jwt),
    db: AsyncSession = Depends(get_db)
):
    """MCP 제공자 목록 조회"""
    # 구현 필요
    pass

@router.get("/providers/{provider_id}", response_model=MCPProviderResponse)
async def get_provider(
    provider_id: str,
    current_user: User = Depends(get_current_user_from_jwt),
    db: AsyncSession = Depends(get_db)
):
    """특정 MCP 제공자 조회"""
    # 구현 필요
    pass

@router.post("/keys", response_model=MCPKeyResponse)
async def create_key(
    key_data: MCPKeyCreate,
    current_user: User = Depends(get_current_user_from_jwt),
    db: AsyncSession = Depends(get_db)
):
    """MCP 키 생성"""
    # 구현 필요
    # 1. 키 값을 AES-256-GCM으로 암호화
    # 2. DB에 저장
    pass

@router.get("/keys", response_model=MCPKeyListResponse)
async def list_keys(
    provider_id: Optional[str] = None,
    bot_id: Optional[str] = None,
    is_active: Optional[bool] = None,
    current_user: User = Depends(get_current_user_from_jwt),
    db: AsyncSession = Depends(get_db)
):
    """MCP 키 목록 조회"""
    # 구현 필요
    # user_id, provider_id, bot_id, is_active로 필터링
    pass

@router.get("/keys/{key_id}", response_model=MCPKeyResponse)
async def get_key(
    key_id: str,
    current_user: User = Depends(get_current_user_from_jwt),
    db: AsyncSession = Depends(get_db)
):
    """특정 MCP 키 조회"""
    # 구현 필요
    pass

@router.delete("/keys/{key_id}")
async def delete_key(
    key_id: str,
    current_user: User = Depends(get_current_user_from_jwt),
    db: AsyncSession = Depends(get_db)
):
    """MCP 키 삭제"""
    # 구현 필요
    pass
```

**라우터 등록** (`Backend/app/main.py`):

```python
from app.api.v1.endpoints import mcp

app.include_router(
    mcp.router,
    prefix="/api/v1/mcp",
    tags=["mcp"]
)
```

#### 1.4 암호화 모듈

**파일**: `Backend/app/core/mcp/encryption.py` (신규 생성)

```python
import os
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from typing import Optional

_aesgcm: Optional[AESGCM] = None

def _get_aesgcm() -> AESGCM:
    """지연 초기화 패턴"""
    global _aesgcm
    if _aesgcm is None:
        from app.config import settings
        key = base64.b64decode(settings.mcp_encryption_key)
        _aesgcm = AESGCM(key)
    return _aesgcm

def encrypt_keys(keys: dict) -> str:
    """
    키 값을 AES-256-GCM으로 암호화

    Args:
        keys: {"api_key": "AIza123...", "bot_token": "xoxb-..."}

    Returns:
        Base64 인코딩된 암호화 데이터 (nonce + ciphertext + tag)
    """
    import json

    aesgcm = _get_aesgcm()
    nonce = os.urandom(12)
    plaintext = json.dumps(keys).encode('utf-8')

    ciphertext = aesgcm.encrypt(nonce, plaintext, None)
    encrypted_blob = nonce + ciphertext

    return base64.b64encode(encrypted_blob).decode('utf-8')

def decrypt_keys(encrypted_blob: str) -> dict:
    """
    암호화된 키 값을 복호화

    Args:
        encrypted_blob: Base64 인코딩된 암호화 데이터

    Returns:
        복호화된 키 딕셔너리
    """
    import json

    aesgcm = _get_aesgcm()
    data = base64.b64decode(encrypted_blob)

    nonce = data[:12]
    ciphertext = data[12:]

    plaintext = aesgcm.decrypt(nonce, ciphertext, None)
    return json.loads(plaintext.decode('utf-8'))
```

**환경변수 추가** (`.env`):

```env
# 32바이트 키를 Base64로 인코딩한 값
MCP_ENCRYPTION_KEY=<base64-encoded-32-byte-key>
```

**키 생성 스크립트**:

```python
import os
import base64

key = os.urandom(32)
print(base64.b64encode(key).decode('utf-8'))
```

#### 1.5 MCP 제공자 시드 데이터

**파일**: `Backend/scripts/seed_mcp_providers.py` (신규 생성)

```python
import asyncio
import json
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.config import settings
from app.models.mcp import MCPProvider

async def seed_mcp_providers():
    """MCP 제공자 초기 데이터 삽입"""
    database_url = settings.get_database_url()
    engine = create_async_engine(database_url, echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    providers = [
        {
            "provider_id": "youtube-summary",
            "name": "YouTube Summary",
            "description": "YouTube 영상을 요약합니다.",
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
                            "options": ["ko", "en", "ja"],
                            "description": "요약 언어"
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
                    "action": {"type": "string", "enum": ["summarize"]},
                    "parameters": {"type": "object"}
                },
                "required": ["action"]
            }),
            "is_active": True
        },
        # 추가 제공자...
    ]

    async with async_session() as session:
        for provider_data in providers:
            provider = MCPProvider(**provider_data)
            session.add(provider)

        await session.commit()
        print(f"✅ {len(providers)} MCP providers seeded successfully")

if __name__ == "__main__":
    asyncio.run(seed_mcp_providers())
```

**실행**:

```bash
python scripts/seed_mcp_providers.py
```

#### 1.6 워크플로우 노드 타입 API

**파일**: `Backend/app/api/v1/endpoints/workflows.py` (수정)

MCP 노드 타입을 `/api/v1/workflows/node-types` 응답에 추가:

```python
@router.get("/node-types")
async def get_node_types():
    """워크플로우 노드 타입 목록 조회"""
    return [
        {"type": "start", "label": "Start", "icon": "play", "max_instances": 1, "configurable": False},
        {"type": "llm", "label": "LLM", "icon": "brain", "max_instances": -1, "configurable": True},
        {"type": "knowledge-retrieval", "label": "Knowledge Retrieval", "icon": "book", "max_instances": -1, "configurable": True},
        {"type": "mcp", "label": "MCP Service", "icon": "plug", "max_instances": -1, "configurable": True},
        {"type": "end", "label": "End", "icon": "flag", "max_instances": 1, "configurable": False},
    ]
```

### 2. 선택 사항 (나중에 구현 가능)

#### 2.1 워크플로우 실행 엔진 통합

**파일**: `Backend/app/core/workflow/mcp_node.py` (신규 생성)

MCP 노드를 실행하는 워크플로우 노드 클래스 구현.

#### 2.2 MCP 키 업데이트 API

키 값 업데이트 및 is_active 토글 기능.

#### 2.3 MCP 제공자 관리 API

관리자가 제공자를 추가/수정/삭제할 수 있는 API.

---

## ⚠️ 백엔드 구현 시 주의사항

### 1. 보안 요구사항

- **절대 API 키 값을 복호화하여 반환하지 마세요**

  - 프론트엔드는 키 목록 조회 시 실제 키 값을 기대하지 않습니다
  - `keys_registered: ["api_key", "bot_token"]` 형태로 키 이름만 반환
  - 실제 키 값은 워크플로우 실행 시에만 백엔드 내부에서 사용

- **암호화는 반드시 AES-256-GCM 사용**
  - CBC, ECB 등 다른 모드 사용 금지 (취약함)
  - Nonce는 매번 랜덤 생성 (12바이트)
  - 인증 태그를 포함하여 데이터 무결성 보장

### 2. 데이터베이스 설계 주의사항

- **user_id 기반 소유권 모델**

  - `MCPKey.user_id`는 NOT NULL (필수)
  - `MCPKey.bot_id`는 NULLABLE (선택적 스코핑)
  - 키 조회 시 반드시 `user_id` 필터링 추가 (다른 사용자의 키 노출 방지)

- **외래 키 제약 조건**
  - `user_id`: `ON DELETE CASCADE` (사용자 삭제 시 키도 삭제)
  - `provider_id`: `ON DELETE RESTRICT` (제공자 삭제 시 키가 있으면 거부)
  - `bot_id`: `ON DELETE CASCADE` (봇 삭제 시 봇 전용 키도 삭제)

### 3. JSON 필드 처리

- **MCPProvider의 JSON 필드**

  - `supported_actions`: Text 컬럼에 JSON 문자열 저장
  - `required_keys`: Text 컬럼에 JSON 문자열 저장
  - Pydantic 스키마에서 자동 직렬화/역직렬화 처리
  - 예시:

    ```python
    import json

    # 저장 시
    provider.supported_actions = json.dumps(actions_list)

    # 조회 시
    actions = json.loads(provider.supported_actions)
    ```

### 4. API 응답 형식 주의사항

- **provider_name 포함 필수**

  - `MCPKeyResponse`에는 `provider_name`이 필요합니다
  - JOIN을 통해 `MCPProvider.name`을 가져와야 합니다

  ```python
  # 예시 SQLAlchemy 쿼리
  query = (
      select(MCPKey, MCPProvider.name)
      .join(MCPProvider, MCPKey.provider_id == MCPProvider.provider_id)
      .where(MCPKey.user_id == current_user.id)
  )
  ```

- **user_email 포함 필수**
  - `MCPKeyResponse`에는 `user_email`이 필요합니다
  - User 테이블과 JOIN하여 이메일 가져오기

### 5. 에러 처리 가이드

프론트엔드가 예상하는 에러 응답 형식:

```json
{
  "detail": {
    "message": "사용자에게 표시할 한국어 메시지",
    "code": "ERROR_CODE"
  }
}
```

#### 필수 에러 케이스

| HTTP Status | 상황                       | message (한국어)                            | code                   |
| ----------- | -------------------------- | ------------------------------------------- | ---------------------- |
| 400         | 제공자가 존재하지 않음     | "존재하지 않는 MCP 제공자입니다."           | `PROVIDER_NOT_FOUND`   |
| 400         | 필수 키가 누락됨           | "필수 키가 누락되었습니다: api_key"         | `MISSING_REQUIRED_KEY` |
| 400         | 키 형식 불일치             | "YouTube API Key 형식이 올바르지 않습니다." | `INVALID_KEY_FORMAT`   |
| 403         | 다른 사용자의 키 접근 시도 | "이 키에 접근할 권한이 없습니다."           | `FORBIDDEN`            |
| 404         | 키가 존재하지 않음         | "MCP 키를 찾을 수 없습니다."                | `KEY_NOT_FOUND`        |
| 409         | 중복된 키 이름             | "동일한 이름의 키가 이미 존재합니다."       | `DUPLICATE_KEY_NAME`   |
| 500         | 암호화 실패                | "키 저장 중 오류가 발생했습니다."           | `ENCRYPTION_ERROR`     |

#### 에러 처리 예시 코드

```python
from fastapi import HTTPException

# 제공자 존재 확인
provider = await db.get(MCPProvider, provider_id=key_data.provider_id)
if not provider:
    raise HTTPException(
        status_code=400,
        detail={
            "message": "존재하지 않는 MCP 제공자입니다.",
            "code": "PROVIDER_NOT_FOUND"
        }
    )

# 필수 키 검증
required_key_names = [k["key_name"] for k in json.loads(provider.required_keys)]
missing_keys = set(required_key_names) - set(key_data.keys.keys())
if missing_keys:
    raise HTTPException(
        status_code=400,
        detail={
            "message": f"필수 키가 누락되었습니다: {', '.join(missing_keys)}",
            "code": "MISSING_REQUIRED_KEY"
        }
    )

# 키 형식 검증 (Regex)
for key_info in json.loads(provider.required_keys):
    key_name = key_info["key_name"]
    key_value = key_data.keys.get(key_name)
    validation_pattern = key_info.get("validation_pattern")

    if validation_pattern:
        import re
        if not re.match(validation_pattern, key_value):
            raise HTTPException(
                status_code=400,
                detail={
                    "message": f"{key_info['display_name']} 형식이 올바르지 않습니다.",
                    "code": "INVALID_KEY_FORMAT"
                }
            )
```

### 6. 성능 최적화

- **인덱스 생성 필수**

  ```sql
  CREATE INDEX idx_mcp_keys_user_provider ON mcp_keys(user_id, provider_id);
  CREATE INDEX idx_mcp_keys_bot ON mcp_keys(bot_id);
  CREATE INDEX idx_mcp_providers_provider_id ON mcp_providers(provider_id);
  ```

- **N+1 쿼리 방지**
  - 키 목록 조회 시 Provider와 User를 JOIN으로 함께 가져오기
  - `selectinload()` 또는 `joinedload()` 사용 (SQLAlchemy)

---

## 테스트 가이드

### 프론트엔드 테스트

1. 워크플로우 빌더 페이지로 이동
2. 캔버스에서 우클릭하여 컨텍스트 메뉴 열기
3. "MCP Service" 노드 추가
4. MCP 노드 선택 → 우측 패널에서 제공자, 액션, 파라미터 설정
5. 워크플로우 저장 및 불러오기 테스트

### API 테스트

```bash
# 제공자 목록 조회
curl -X GET http://localhost:8001/api/v1/mcp/providers \
  -H "Authorization: Bearer <access_token>"

# 키 생성
curl -X POST http://localhost:8001/api/v1/mcp/keys \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "provider_id": "youtube-summary",
    "display_name": "My YouTube Key",
    "keys": {"api_key": "AIza..."}
  }'

# 키 목록 조회
curl -X GET "http://localhost:8001/api/v1/mcp/keys?provider_id=youtube-summary" \
  -H "Authorization: Bearer <access_token>"
```

---

## 💡 빠른 구현 예제

백엔드 개발자가 바로 복사하여 사용할 수 있는 핵심 코드 예제입니다.

### 예제 1: MCP 키 생성 엔드포인트 (완전한 구현)

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.auth.dependencies import get_current_user_from_jwt
from app.models.user import User
from app.models.mcp import MCPKey, MCPProvider
from app.schemas.mcp import MCPKeyCreate, MCPKeyResponse
from app.core.mcp.encryption import encrypt_keys
import json
import uuid

router = APIRouter()

@router.post("/keys", response_model=MCPKeyResponse)
async def create_key(
    key_data: MCPKeyCreate,
    current_user: User = Depends(get_current_user_from_jwt),
    db: AsyncSession = Depends(get_db)
):
    """MCP 키 생성"""
    # 1. 제공자 존재 확인
    result = await db.execute(
        select(MCPProvider).where(MCPProvider.provider_id == key_data.provider_id)
    )
    provider = result.scalar_one_or_none()

    if not provider:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "존재하지 않는 MCP 제공자입니다.",
                "code": "PROVIDER_NOT_FOUND"
            }
        )

    # 2. 필수 키 검증
    required_keys_config = json.loads(provider.required_keys)
    required_key_names = [k["key_name"] for k in required_keys_config]
    missing_keys = set(required_key_names) - set(key_data.keys.keys())

    if missing_keys:
        raise HTTPException(
            status_code=400,
            detail={
                "message": f"필수 키가 누락되었습니다: {', '.join(missing_keys)}",
                "code": "MISSING_REQUIRED_KEY"
            }
        )

    # 3. 키 형식 검증 (Regex)
    import re
    for key_info in required_keys_config:
        key_name = key_info["key_name"]
        key_value = key_data.keys.get(key_name)
        validation_pattern = key_info.get("validation_pattern")

        if validation_pattern and not re.match(validation_pattern, key_value):
            raise HTTPException(
                status_code=400,
                detail={
                    "message": f"{key_info['display_name']} 형식이 올바르지 않습니다.",
                    "code": "INVALID_KEY_FORMAT"
                }
            )

    # 4. 키 암호화
    try:
        encrypted_blob = encrypt_keys(key_data.keys)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "키 저장 중 오류가 발생했습니다.",
                "code": "ENCRYPTION_ERROR"
            }
        )

    # 5. DB 저장
    mcp_key = MCPKey(
        key_id=f"mcp_key_{uuid.uuid4().hex[:12]}",
        user_id=current_user.id,
        provider_id=key_data.provider_id,
        bot_id=key_data.bot_id,
        display_name=key_data.display_name,
        description=key_data.description,
        encrypted_blob=encrypted_blob,
        is_active=True
    )

    db.add(mcp_key)
    await db.commit()
    await db.refresh(mcp_key)

    # 6. 응답 생성
    return MCPKeyResponse(
        key_id=mcp_key.key_id,
        user_id=mcp_key.user_id,
        bot_id=mcp_key.bot_id,
        provider_id=mcp_key.provider_id,
        provider_name=provider.name,
        display_name=mcp_key.display_name,
        description=mcp_key.description,
        is_active=mcp_key.is_active,
        keys_registered=list(key_data.keys.keys()),
        last_used_at=mcp_key.last_used_at,
        created_at=mcp_key.created_at,
        user_email=current_user.email
    )
```

### 예제 2: MCP 키 목록 조회 (JOIN 포함)

```python
@router.get("/keys", response_model=MCPKeyListResponse)
async def list_keys(
    provider_id: Optional[str] = None,
    bot_id: Optional[str] = None,
    is_active: Optional[bool] = None,
    current_user: User = Depends(get_current_user_from_jwt),
    db: AsyncSession = Depends(get_db)
):
    """MCP 키 목록 조회"""
    # 1. 쿼리 생성 (JOIN으로 Provider와 User 정보 함께 가져오기)
    query = (
        select(MCPKey, MCPProvider.name, User.email)
        .join(MCPProvider, MCPKey.provider_id == MCPProvider.provider_id)
        .join(User, MCPKey.user_id == User.id)
        .where(MCPKey.user_id == current_user.id)  # 보안: 자기 키만 조회
    )

    # 2. 필터링
    if provider_id:
        query = query.where(MCPKey.provider_id == provider_id)
    if bot_id:
        query = query.where(MCPKey.bot_id == bot_id)
    if is_active is not None:
        query = query.where(MCPKey.is_active == is_active)

    # 3. 실행
    result = await db.execute(query)
    rows = result.all()

    # 4. 응답 생성
    keys = []
    for mcp_key, provider_name, user_email in rows:
        # 등록된 키 이름 추출 (복호화하지 않음!)
        from app.core.mcp.encryption import decrypt_keys
        decrypted_keys = decrypt_keys(mcp_key.encrypted_blob)
        keys_registered = list(decrypted_keys.keys())

        keys.append(MCPKeyResponse(
            key_id=mcp_key.key_id,
            user_id=mcp_key.user_id,
            bot_id=mcp_key.bot_id,
            provider_id=mcp_key.provider_id,
            provider_name=provider_name,
            display_name=mcp_key.display_name,
            description=mcp_key.description,
            is_active=mcp_key.is_active,
            keys_registered=keys_registered,  # 키 이름만 반환
            last_used_at=mcp_key.last_used_at,
            created_at=mcp_key.created_at,
            user_email=user_email
        ))

    return MCPKeyListResponse(
        total=len(keys),
        keys=keys
    )
```

### 예제 3: MCP 제공자 목록 조회 (JSON 파싱 포함)

```python
@router.get("/providers", response_model=List[MCPProviderResponse])
async def get_providers(
    current_user: User = Depends(get_current_user_from_jwt),
    db: AsyncSession = Depends(get_db)
):
    """MCP 제공자 목록 조회"""
    # 1. 활성화된 제공자만 조회
    result = await db.execute(
        select(MCPProvider).where(MCPProvider.is_active == True)
    )
    providers = result.scalars().all()

    # 2. JSON 필드 파싱하여 응답 생성
    response = []
    for provider in providers:
        response.append(MCPProviderResponse(
            provider_id=provider.provider_id,
            name=provider.name,
            description=provider.description,
            icon=provider.icon,
            supported_actions=json.loads(provider.supported_actions),
            required_keys=json.loads(provider.required_keys),
            config_schema=json.loads(provider.config_schema) if provider.config_schema else None,
            is_active=provider.is_active
        ))

    return response
```

---

## 참고 문서

- API 명세: `Backend/MCP_INTEGRATION_API_SPECIFICATION.md`
- 구현 계획: `Backend/MCP_IMPLEMENTATION_PLAN.md`
- 프론트엔드 소스 코드: `Frontend/my-project/src/features/mcp/`

## 연락처

프론트엔드 관련 질문이 있으시면 언제든지 연락 주세요.

---

## 요약

### 프론트엔드 상태

✅ **완벽하게 구현 완료** - 더 이상 수정 필요 없음

### 백엔드 개발자가 해야 할 일

1. ✅ 체크리스트의 모든 항목 구현
2. ✅ 예제 코드 참고하여 빠르게 개발
3. ✅ 에러 처리 가이드 준수
4. ✅ 보안 요구사항 반드시 지킴

### 예상 소요 시간

- **최소 구현**: 3-4시간 (1단계만)
- **완전 구현**: 6-8시간 (1단계 + 2단계)

### 문의 사항

백엔드 구현 중 프론트엔드 관련 질문이 있으면 이 문서를 참고하거나 프론트엔드 개발자에게 문의하세요.

### 생각 할 것

다음 단계

보안 섹션과 키 목록 예제의 복호화 정책을 일치시키세요.
키 이름 중복 규칙(예: 유저+provider 단위 고유)과 검증 방법을 문서에 추가하세요.
