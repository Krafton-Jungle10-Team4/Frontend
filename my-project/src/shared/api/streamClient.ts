/**
 * SSE 스트리밍 클라이언트
 * Fetch API 기반 Server-Sent Events 구현
 */

import type { SSEEvent, StreamCallbacks, WorkflowNodeEvent } from '@/shared/types/streaming.types';
import { getFreshAccessToken } from '@/shared/utils/tokenManager';

/**
 * SSE 스트리밍 요청 옵션
 */
interface StreamRequestOptions {
  url: string;
  body: object;
  callbacks: StreamCallbacks;
  timeout?: number; // 밀리초, 기본값 60초
  headers?: Record<string, string>;
  useAuth?: boolean;
  credentials?: RequestCredentials;
}

/**
 * SSE 스트리밍 요청 실행
 *
 * @param options - 스트리밍 옵션
 * @throws {Error} 네트워크 에러, 인증 에러, 파싱 에러
 *
 * @example
 * await streamRequest({
 *   url: 'https://api.snapagent.shop/api/v1/chat/stream',
 *   body: { message: '안녕하세요', bot_id: 'bot_123' },
 *   callbacks: {
 *     onChunk: (chunk) => console.log(chunk),
 *     onComplete: () => console.log('Done'),
 *   }
 * });
 */
export async function streamRequest({
  url,
  body,
  callbacks,
  timeout = 60000,
  headers = {},
  useAuth = true,
  credentials = 'include',
}: StreamRequestOptions): Promise<void> {
  // 1. 인증 헤더 구성
  let requestHeaders: Record<string, string> = { ...headers };

  if (useAuth) {
    const token = await getFreshAccessToken();
    requestHeaders = {
      ...requestHeaders,
      Authorization: `Bearer ${token}`,
    };
  }

  // 2. AbortController로 타임아웃 설정
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, timeout);

  try {
    // 3. Fetch 요청
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...requestHeaders,
      },
      body: JSON.stringify(body),
      signal: abortController.signal,
      credentials,
    });

    // 4. HTTP 에러 확인
    if (!response.ok) {
      if (response.status === 401) {
        const authError = new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        callbacks.onError?.(authError);
        throw authError;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // 5. Content-Type 검증
    const contentType = response.headers.get('Content-Type');
    if (!contentType?.includes('text/event-stream')) {
      throw new Error(`잘못된 Content-Type: ${contentType}`);
    }

    // 6. 스트림 읽기 준비
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is null');
    }

    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    // 7. 스트림 읽기 루프
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        console.log('[SSE] Stream ended');
        break;
      }

      // 8. 청크 디코딩 및 버퍼 추가
      buffer += decoder.decode(value, { stream: true });

      // 9. SSE 이벤트 파싱 ("\n\n" 구분자)
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || ''; // 마지막 불완전한 라인은 버퍼에 유지

      for (const line of lines) {
        if (!line.trim()) continue;

        // 10. "data: " 접두사 추출
        const dataMatch = line.match(/^data: (.+)$/);
        if (!dataMatch) {
          console.warn('[SSE] Invalid line format:', line);
          continue;
        }

        const eventData = dataMatch[1].trim();

        // 11. [DONE] 신호 확인
        if (eventData === '[DONE]') {
          console.log('[SSE] Received [DONE] signal');
          callbacks.onComplete?.();
          clearTimeout(timeoutId);
          return;
        }

        // 12. JSON 파싱 및 이벤트 처리
        try {
          const event: SSEEvent = JSON.parse(eventData);

          switch (event.type) {
            case 'content':
              callbacks.onChunk?.(event.data);
              break;

            case 'sources':
              callbacks.onSources?.(event.data);
              break;

            case 'error':
              const error = new Error(event.message) as Error & { code: string };
              error.code = event.code;
              callbacks.onError?.(error);
              throw error; // 에러 발생 시 스트림 중단

            case 'node':
              callbacks.onNodeEvent?.(event as WorkflowNodeEvent);
              break;

            default:
              console.warn('[SSE] Unknown event type:', event);
          }
        } catch (parseError) {
          console.error('[SSE] JSON parse error:', parseError, 'Data:', eventData);
          callbacks.onError?.(
            parseError instanceof Error
              ? parseError
              : new Error('SSE 파싱 실패')
          );
          throw parseError;
        }
      }
    }
  } catch (error) {
    clearTimeout(timeoutId);

    // AbortError 처리
    if ((error as Error).name === 'AbortError') {
      const timeoutError = new Error('요청 시간이 초과되었습니다.');
      callbacks.onError?.(timeoutError);
      throw timeoutError;
    }

    // 기타 에러
    callbacks.onError?.(error as Error);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * SSE 에러인지 확인
 */
export function isSSEError(error: unknown): error is Error & { code: string } {
  return error instanceof Error && 'code' in error;
}
