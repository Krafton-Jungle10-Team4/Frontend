/**
 * Chat 스트리밍 API
 * chatApi.ts와 분리하여 관리 (선택적)
 */

import { streamRequest } from '@/shared/api/streamClient';
import { API_BASE_URL, API_ENDPOINTS } from '@/shared/constants/apiEndpoints';
import type { StreamChatRequest, StreamCallbacks } from '@/shared/types/streaming.types';

/**
 * 스트리밍 메시지 전송
 *
 * @param request - 스트리밍 요청 파라미터
 * @param callbacks - 이벤트 콜백
 *
 * @example
 * await sendMessageStream(
 *   { message: '안녕하세요', bot_id: 'bot_123' },
 *   {
 *     onChunk: (chunk) => console.log(chunk),
 *     onSources: (sources) => console.log('출처:', sources),
 *     onComplete: () => console.log('완료'),
 *     onError: (error) => console.error(error),
 *   }
 * );
 */
export async function sendMessageStream(
  request: StreamChatRequest,
  callbacks: StreamCallbacks
): Promise<void> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.CHAT.STREAM}`;

  await streamRequest({
    url,
    body: {
      message: request.message,
      bot_id: request.bot_id,
      session_id: request.session_id,
      document_ids: request.document_ids,
      top_k: request.top_k || 5,
      temperature: request.temperature || 0.7,
      max_tokens: request.max_tokens || 1000,
      model: request.model,
      include_sources: request.include_sources ?? true,
    },
    callbacks,
    timeout: 60000, // 60초
  });
}
