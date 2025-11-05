import type { UserResponse } from '@/shared/types/api.types';

/**
 * 사용자 역할 (프론트엔드용)
 * SnapAgent API에는 role이 없으므로 프론트엔드에서 관리
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}

/**
 * 사용자 기본 정보 (SnapAgent API 기반)
 */
export interface User {
  id: number;
  email: string;
  name: string | null;
  profile_image: string | null;
  created_at: string;
  role?: UserRole; // 프론트엔드에서 관리 (선택)
}

/**
 * UserResponse를 User로 변환
 */
export const mapUserResponseToUser = (response: UserResponse): User => {
  return {
    id: response.id,
    email: response.email,
    name: response.name,
    profile_image: response.profile_image,
    created_at: response.created_at,
    role: UserRole.USER, // 기본값
  };
};

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
 * 일반 로그인 요청 (이메일/비밀번호)
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * 회원가입 요청
 */
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

/**
 * 토큰 응답 (로그인/회원가입 성공 시)
 */
export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

/**
 * 인증 상태 (SnapAgent 기반)
 */
export interface AuthState {
  user: User | null;
  jwtToken: string | null; // JWT Token (SnapAgent)
  isAuthenticated: boolean;
  isLoading: boolean;
}
