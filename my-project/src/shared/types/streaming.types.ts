/**
 * 스트리밍 API 타입 정의
 * API 명세서: API_SPEC_STREAMING_CHAT.md
 */

import type { Source } from './api.types';

// ============================================
// SSE 이벤트 타입
// ============================================

/**
 * SSE 이벤트 타입
 */
export type SSEEventType = 'content' | 'sources' | 'error';

/**
 * 콘텐츠 청크 이벤트
 * 스트리밍되는 텍스트 조각
 */
export interface ContentEvent {
  type: 'content';
  data: string;
}

/**
 * 출처 정보 이벤트
 * RAG 검색 결과 출처 (응답 마지막에 전송)
 */
export interface SourcesEvent {
  type: 'sources';
  data: Source[];
}

/**
 * 에러 코드
 */
export type ErrorCode =
  | 'RATE_LIMIT_EXCEEDED'  // 429 - API 사용량 제한
  | 'TIMEOUT'              // 504 - 응답 시간 초과
  | 'INVALID_REQUEST'      // 400 - 잘못된 요청
  | 'STREAM_ERROR'         // 500 - 스트리밍 서버 에러
  | 'UNKNOWN_ERROR';       // 500 - 알 수 없는 에러

/**
 * 에러 이벤트
 */
export interface ErrorEvent {
  type: 'error';
  code: ErrorCode;
  message: string;
}

/**
 * SSE 이벤트 유니온 타입
 */
export type SSEEvent = ContentEvent | SourcesEvent | ErrorEvent;

/**
 * 완료 신호 (문자열 리터럴)
 */
export type DoneSignal = '[DONE]';

// ============================================
// 스트리밍 요청 타입
// ============================================

/**
 * 스트리밍 챗봇 요청
 */
export interface StreamChatRequest {
  // 필수 파라미터
  message: string;        // 1-2000자
  bot_id: string;         // 봇 식별자

  // 선택 파라미터
  session_id?: string;
  document_ids?: string[];
  top_k?: number;         // 1-20, 기본값 5
  temperature?: number;   // 0.0-1.0, 기본값 0.7
  max_tokens?: number;    // 100-4000, 기본값 1000
  model?: string;
  include_sources?: boolean; // 기본값 true
}

// ============================================
// 콜백 인터페이스
// ============================================

/**
 * 스트리밍 이벤트 콜백
 */
export interface StreamCallbacks {
  /**
   * 콘텐츠 청크 수신 시 호출
   * @param chunk - 텍스트 조각
   */
  onChunk?: (chunk: string) => void;

  /**
   * 출처 정보 수신 시 호출
   * @param sources - RAG 검색 결과
   */
  onSources?: (sources: Source[]) => void;

  /**
   * 에러 발생 시 호출
   * @param error - 에러 객체
   */
  onError?: (error: Error) => void;

  /**
   * 스트림 완료 시 호출
   */
  onComplete?: () => void;
}

// ============================================
// 유틸리티 타입
// ============================================

/**
 * 스트리밍 상태
 */
export type StreamingState =
  | 'idle'       // 대기 중
  | 'connecting' // 연결 중
  | 'streaming'  // 스트리밍 중
  | 'completed'  // 완료
  | 'error';     // 에러

/**
 * 에러 핸들러 맵
 */
export type ErrorHandlerMap = Record<ErrorCode, (message: string) => void>;
