/**
 * Common Types
 * 공통으로 사용되는 타입 정의
 */

// UI Types
export type Language = 'en' | 'ko';
export type ViewMode = 'grid' | 'list';

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Async State
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  status?: number;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Form Types
export interface SelectOption {
  label: string;
  value: string;
}

export interface DateRange {
  from: Date;
  to: Date;
}
