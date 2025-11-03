/**
 * 사용자 역할
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}

/**
 * 사용자 기본 정보
 */
export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string; // 프로필 이미지
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

/**
 * 구글 로그인 응답 (구글에서 받는 데이터)
 */
export interface GoogleLoginResponse {
  credential: string; // JWT ID Token
  clientId: string;
  select_by: string;
}

/**
 * 구글 사용자 정보 (디코딩된 ID Token)
 */
export interface GoogleUserInfo {
  iss: string; // 발급자
  azp: string; // 인증된 클라이언트
  aud: string; // 대상
  sub: string; // 사용자 고유 ID
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  iat: number; // 발급 시간
  exp: number; // 만료 시간
}

/**
 * 로그인 요청 DTO (백엔드로 전송)
 */
export interface GoogleLoginDto {
  idToken: string; // 구글 ID Token
}

/**
 * 인증 응답 (백엔드에서 받는 데이터)
 */
export interface AuthResponse {
  accessToken: string; // 백엔드 JWT 토큰
  refreshToken?: string; // 리프레시 토큰 (선택)
  user: User;
  expiresIn: number; // 토큰 만료 시간 (초)
}

/**
 * 로그아웃 응답
 */
export interface LogoutResponse {
  success: boolean;
  message: string;
}

/**
 * 인증 상태
 */
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
