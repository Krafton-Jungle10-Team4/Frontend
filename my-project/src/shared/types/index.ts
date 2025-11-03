// Common types used across the application

export type Language = 'en' | 'ko';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface DateRange {
  from: Date;
  to: Date;
}
