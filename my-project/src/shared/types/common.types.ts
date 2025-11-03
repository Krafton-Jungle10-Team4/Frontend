/**
 * Common Types
 * 공통으로 사용되는 타입 정의
 */

export type Language = 'en' | 'ko';

export type ViewMode = 'grid' | 'list';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}
