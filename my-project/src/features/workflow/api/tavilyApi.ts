/**
 * Tavily Search API 클라이언트
 *
 * Tavily 검색 프리뷰 및 API 키 검증 기능을 제공합니다.
 */

import { apiClient } from '@/shared/api/client';
import { API_ENDPOINTS } from '@/shared/constants/apiEndpoints';

/**
 * Tavily 검색 요청 타입
 */
export interface TavilySearchRequest {
  query: string;
  search_depth?: 'basic' | 'advanced';
  topic?: 'general' | 'news' | 'finance';
  max_results?: number;
  include_domains?: string[];
  exclude_domains?: string[];
  time_range?: 'day' | 'week' | 'month' | 'year' | null;
  start_date?: string;
  end_date?: string;
  include_answer?: boolean;
  include_raw_content?: boolean;
  api_key?: string; // 테스트용 (선택사항)
}

/**
 * Tavily 검색 결과 타입
 */
export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  raw_content?: string;
  favicon?: string;
}

/**
 * Tavily 검색 응답 타입
 */
export interface TavilySearchResponse {
  query: string;
  answer?: string;
  results: TavilySearchResult[];
  response_time: number;
  request_id?: string;
}

/**
 * API 키 검증 요청 타입
 */
export interface TavilyValidateKeyRequest {
  api_key: string;
}

/**
 * API 키 검증 응답 타입
 */
export interface TavilyValidateKeyResponse {
  valid: boolean;
  message: string;
}

/**
 * Tavily API 클라이언트
 */
export const tavilyApi = {
  /**
   * Tavily 검색 수행 (프리뷰 및 테스트용)
   *
   * @param request 검색 요청 파라미터
   * @returns 검색 결과
   */
  async search(request: TavilySearchRequest): Promise<TavilySearchResponse> {
    const { data } = await apiClient.post<TavilySearchResponse>(
      API_ENDPOINTS.TAVILY.SEARCH,
      request
    );
    return data;
  },

  /**
   * Tavily API 키 유효성 검증
   *
   * @param apiKey API 키
   * @returns 검증 결과
   */
  async validateKey(apiKey: string): Promise<TavilyValidateKeyResponse> {
    const { data } = await apiClient.post<TavilyValidateKeyResponse>(
      API_ENDPOINTS.TAVILY.VALIDATE_KEY,
      { api_key: apiKey }
    );
    return data;
  },
};
