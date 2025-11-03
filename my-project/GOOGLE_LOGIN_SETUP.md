# 구글 로그인 설정 가이드

이 문서는 프론트엔드에서 구글 로그인을 구현하기 위한 전체 설정 가이드입니다.

---

## 📋 목차

1. [구글 클라우드 콘솔 설정](#1-구글-클라우드-콘솔-설정)
2. [프론트엔드 환경 설정](#2-프론트엔드-환경-설정)
3. [백엔드 API 요구사항](#3-백엔드-api-요구사항)
4. [동작 흐름](#4-동작-흐름)
5. [테스트 방법](#5-테스트-방법)
6. [트러블슈팅](#6-트러블슈팅)

---

## 1. 구글 클라우드 콘솔 설정

### 1.1 프로젝트 생성

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. 프로젝트 이름: `RAG Platform` (원하는 이름)

### 1.2 OAuth 동의 화면 설정

1. **좌측 메뉴** → **API 및 서비스** → **OAuth 동의 화면**
2. 사용자 유형 선택:
   - **내부**: Google Workspace 조직 내부만 사용 (회사용)
   - **외부**: 누구나 사용 가능 (개인/테스트용 추천)
3. 앱 정보 입력:
   ```
   앱 이름: RAG Platform
   사용자 지원 이메일: your-email@gmail.com
   개발자 연락처 정보: your-email@gmail.com
   ```
4. **저장 후 계속**

### 1.3 OAuth 클라이언트 ID 생성

1. **좌측 메뉴** → **API 및 서비스** → **사용자 인증 정보**
2. **+ 사용자 인증 정보 만들기** → **OAuth 클라이언트 ID**
3. 애플리케이션 유형: **웹 애플리케이션**
4. 정보 입력:
   ```
   이름: RAG Platform Web Client

   승인된 자바스크립트 원본:
   - http://localhost:5173 (Vite 개발 서버)
   - http://localhost:3000 (백업)
   - https://yourdomain.com (프로덕션)

   승인된 리디렉션 URI:
   - http://localhost:5173/login (선택사항)
   - https://yourdomain.com/login (프로덕션)
   ```
5. **만들기** 클릭
6. **클라이언트 ID**를 복사 (형식: `123456789-abc.apps.googleusercontent.com`)

---

## 2. 프론트엔드 환경 설정

### 2.1 환경 변수 설정

프로젝트 루트에 `.env` 파일 생성:

```bash
cp .env.example .env
```

`.env` 파일 수정:
```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=당신의-클라이언트-ID.apps.googleusercontent.com
```

### 2.2 의존성 설치

이미 설치되어 있지만, 확인 차원에서:

```bash
npm install
```

필요한 패키지:
- `axios` - API 통신
- `react-router-dom` - 라우팅

---

## 3. 백엔드 API 요구사항

### 3.1 필요한 엔드포인트

백엔드 개발자에게 다음 API를 요청하세요:

#### **POST /api/auth/google**

구글 ID Token을 검증하고 사용자 인증을 처리합니다.

**요청 (Request)**:
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjY4M..."
}
```

**응답 (Response) - 성공 (200 OK)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh-token-string",
  "user": {
    "id": "user-uuid-or-id",
    "email": "user@example.com",
    "name": "홍길동",
    "picture": "https://lh3.googleusercontent.com/...",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "expiresIn": 3600
}
```

**응답 (Response) - 실패 (401 Unauthorized)**:
```json
{
  "message": "Invalid Google token",
  "statusCode": 401
}
```

#### **POST /api/auth/logout**

로그아웃 처리 (선택사항, 백엔드에서 토큰 무효화 필요시)

**요청 (Request)**:
```
Authorization: Bearer <accessToken>
```

**응답 (Response)**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### **GET /api/auth/me**

현재 로그인한 사용자 정보 조회

**요청 (Request)**:
```
Authorization: Bearer <accessToken>
```

**응답 (Response)**:
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "홍길동",
  "picture": "https://...",
  "role": "user",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### 3.2 백엔드 구현 가이드

백엔드에서 구글 ID Token 검증 방법:

#### **Node.js (Express + google-auth-library)**

```javascript
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken: idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
    emailVerified: payload.email_verified,
  };
}

// API 엔드포인트
app.post('/api/auth/google', async (req, res) => {
  try {
    const { idToken } = req.body;

    // 구글 토큰 검증
    const googleUser = await verifyGoogleToken(idToken);

    // 사용자 DB 조회 또는 생성
    let user = await User.findOne({ email: googleUser.email });
    if (!user) {
      user = await User.create({
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        googleId: googleUser.googleId,
        role: 'user',
      });
    }

    // JWT 토큰 생성
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role,
      },
      expiresIn: 3600,
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid Google token' });
  }
});
```

#### **Python (FastAPI + google-auth)**

```python
from google.oauth2 import id_token
from google.auth.transport import requests

def verify_google_token(token: str):
    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )

        return {
            'google_id': idinfo['sub'],
            'email': idinfo['email'],
            'name': idinfo['name'],
            'picture': idinfo['picture'],
            'email_verified': idinfo['email_verified']
        }
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.post("/api/auth/google")
async def google_login(request: GoogleLoginRequest):
    google_user = verify_google_token(request.idToken)

    # 사용자 DB 처리
    user = get_or_create_user(google_user)

    # JWT 생성
    access_token = create_access_token(data={"sub": user.id})

    return {
        "accessToken": access_token,
        "user": user.dict(),
        "expiresIn": 3600
    }
```

---

## 4. 동작 흐름

### 전체 인증 흐름

```
┌─────────┐         ┌──────────┐         ┌─────────┐         ┌──────────┐
│ 사용자  │         │프론트엔드│         │  구글   │         │ 백엔드   │
└────┬────┘         └────┬─────┘         └────┬────┘         └────┬─────┘
     │                   │                    │                   │
     │ 1. "구글 로그인"  │                    │                   │
     │   버튼 클릭       │                    │                   │
     ├──────────────────>│                    │                   │
     │                   │                    │                   │
     │                   │ 2. 구글 로그인 팝업│                   │
     │                   ├───────────────────>│                   │
     │                   │                    │                   │
     │ 3. 이메일/비밀번호│                    │                   │
     │    입력           │                    │                   │
     ├──────────────────────────────────────>│                   │
     │                   │                    │                   │
     │                   │  4. ID Token 발급  │                   │
     │                   │<───────────────────┤                   │
     │                   │                    │                   │
     │                   │ 5. ID Token 전송   │                   │
     │                   │    POST /auth/google                   │
     │                   ├───────────────────────────────────────>│
     │                   │                    │                   │
     │                   │                    │ 6. 토큰 검증 요청 │
     │                   │                    │<──────────────────┤
     │                   │                    │                   │
     │                   │                    │ 7. 검증 결과      │
     │                   │                    ├──────────────────>│
     │                   │                    │                   │
     │                   │ 8. JWT + 사용자 정보                   │
     │                   │<───────────────────────────────────────┤
     │                   │                    │                   │
     │                   │ 9. localStorage 저장                   │
     │                   │    & 대시보드 이동│                   │
     │<──────────────────┤                    │                   │
     │                   │                    │                   │
```

### 주요 단계 설명

1. **사용자 클릭**: 로그인 페이지에서 "구글 로그인" 버튼 클릭
2. **구글 팝업**: Google Identity Services가 로그인 팝업 표시
3. **사용자 인증**: 구글 계정으로 로그인
4. **ID Token 발급**: 구글이 JWT 형식의 ID Token 발급
5. **백엔드 전송**: 프론트엔드가 ID Token을 백엔드로 전송
6. **토큰 검증**: 백엔드가 구글 API에 토큰 검증 요청
7. **사용자 처리**: 백엔드가 사용자 DB 조회/생성
8. **JWT 발급**: 백엔드가 자체 JWT 토큰 발급
9. **로컬 저장**: 프론트엔드가 토큰과 사용자 정보 localStorage에 저장

---

## 5. 테스트 방법

### 5.1 개발 서버 실행

```bash
# 프론트엔드
npm run dev

# 백엔드 (별도 터미널)
# 백엔드 프로젝트에서 실행
npm run dev  # or python main.py
```

### 5.2 테스트 시나리오

1. **로그인 페이지 접속**
   - http://localhost:5173/login

2. **구글 로그인 버튼 클릭**
   - 구글 계정 선택 팝업이 나타나야 함

3. **구글 계정 선택**
   - 테스트용 구글 계정으로 로그인

4. **로그인 성공 확인**
   - 대시보드(/dashboard)로 자동 리다이렉트
   - 사용자 정보 (이름, 이메일, 프로필 사진) 표시
   - localStorage에 토큰 저장 확인 (개발자 도구 → Application → Local Storage)

5. **페이지 새로고침 테스트**
   - F5 새로고침 후에도 로그인 상태 유지 확인

6. **로그아웃 테스트**
   - 로그아웃 버튼 클릭 → 로그인 페이지로 이동
   - localStorage 정리 확인

### 5.3 디버깅

브라우저 개발자 도구(F12)에서 확인:

```javascript
// Console에서 확인
console.log('Access Token:', localStorage.getItem('accessToken'));
console.log('User Info:', localStorage.getItem('userInfo'));

// Network 탭에서 확인
// - POST /api/auth/google 요청/응답
// - Authorization 헤더에 Bearer 토큰 포함 여부
```

---

## 6. 트러블슈팅

### 문제 1: "구글 버튼이 표시되지 않음"

**원인**: 구글 스크립트 로드 실패 또는 잘못된 클라이언트 ID

**해결**:
```bash
# .env 파일 확인
cat .env

# VITE_GOOGLE_CLIENT_ID가 올바른지 확인
# 형식: 123456789-abc.apps.googleusercontent.com

# 브라우저 콘솔에서 확인
console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID);
```

### 문제 2: "로그인 후 401 Unauthorized 에러"

**원인**: 백엔드 API 엔드포인트 미구현 또는 CORS 문제

**해결**:
```bash
# 백엔드 서버 실행 여부 확인
curl http://localhost:3000/api/auth/google

# CORS 설정 확인 (백엔드)
# Node.js: app.use(cors())
# FastAPI: app.add_middleware(CORSMiddleware, ...)
```

### 문제 3: "Invalid Google token"

**원인**: 백엔드에서 구글 클라이언트 ID 불일치

**해결**:
- 백엔드의 `GOOGLE_CLIENT_ID` 환경 변수가 프론트엔드와 동일한지 확인
- 구글 클라우드 콘솔에서 발급받은 클라이언트 ID가 정확한지 확인

### 문제 4: "redirect_uri_mismatch"

**원인**: 승인된 자바스크립트 원본 불일치

**해결**:
1. Google Cloud Console → 사용자 인증 정보
2. OAuth 클라이언트 ID 편집
3. "승인된 자바스크립트 원본"에 `http://localhost:5173` 추가
4. 저장 후 5분 대기 (구글 서버 동기화 시간)

### 문제 5: "페이지 새로고침 시 로그아웃됨"

**원인**: localStorage 복원 로직 미작동

**해결**:
```typescript
// useAuth.ts 확인
// useEffect에서 localStorage 복원 코드가 실행되는지 확인
console.log('Restoring auth state...');
```

---

## 7. 프로덕션 배포 체크리스트

배포 전 확인사항:

- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] 프로덕션 URL을 구글 클라우드 콘솔에 등록
- [ ] 백엔드 API URL을 프로덕션 URL로 변경
- [ ] HTTPS 사용 (HTTP는 구글 로그인 제한됨)
- [ ] CORS 설정 (프로덕션 도메인 추가)
- [ ] 에러 로깅 설정 (Sentry 등)

---

## 8. 참고 자료

- [Google Identity Services 공식 문서](https://developers.google.com/identity/gsi/web)
- [OAuth 2.0 설명](https://developers.google.com/identity/protocols/oauth2)
- [JWT 소개](https://jwt.io/introduction)

---

## 📞 문의사항

구현 중 문제가 발생하면:
1. 브라우저 개발자 도구 콘솔 로그 확인
2. Network 탭에서 API 요청/응답 확인
3. 위 트러블슈팅 섹션 참고
