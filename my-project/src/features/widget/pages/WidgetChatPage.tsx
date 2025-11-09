import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, AlertCircle, Send } from 'lucide-react';
import { Alert, AlertDescription } from '@shared/components/alert';
import { widgetApi } from '../api/widgetApi';
import type {
  WidgetConfigResponse,
  WidgetMessage,
  WidgetSessionMessage,
} from '../types/widget.types';

/**
 * Widget Chat Page
 * 외부 임베딩용 독립 채팅 페이지
 *
 * 데이터 흐름:
 * 1. useParams로 widgetKey 추출
 * 2. postMessage 수신 대기 (부모 inject.js에서 전송)
 * 3. WIDGET_SESSION 메시지 수신 시 session_token/config를 localStorage에 저장
 * 4. 채팅 인터페이스 표시
 *
 * 중요: 세션 생성은 inject.js에서 수행 (Origin/Referer 검증)
 */
export function WidgetChatPage() {
  const { widgetKey } = useParams<{ widgetKey: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<WidgetConfigResponse | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [messages, setMessages] = useState<WidgetMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * 허용된 부모 도메인 계산
   * iframe을 임베드한 부모 페이지의 origin을 document.referrer에서 추출
   */
  const allowedOrigin = useMemo(() => {
    if (document.referrer) {
      try {
        const parentOrigin = new URL(document.referrer).origin;
        console.log('[WidgetChatPage] Allowed parent origin:', parentOrigin);
        return parentOrigin;
      } catch (error) {
        console.error('[WidgetChatPage] Failed to parse referrer:', error);
        return null;
      }
    }
    console.warn('[WidgetChatPage] No referrer - origin validation disabled (development mode)');
    return null;
  }, []);

  /**
   * 부모 문서에서 전송한 메시지 처리
   * 중요: inject.js에서 생성한 세션 정보 수신
   *
   * 보안: origin 검증을 통해 신뢰할 수 있는 부모에서 온 메시지만 처리
   */
  const handleParentMessage = useCallback((event: MessageEvent<WidgetSessionMessage>) => {
    // Origin 검증: 부모 도메인이 확인된 경우에만 체크
    if (allowedOrigin && event.origin !== allowedOrigin) {
      console.warn(
        '[WidgetChatPage] Rejected message from untrusted origin:',
        event.origin,
        'Expected:',
        allowedOrigin
      );
      return;
    }

    // 메시지 타입 검증
    if (event.data?.type !== 'WIDGET_SESSION') {
      return;
    }

    const { session, config: configData, apiBaseUrl } = event.data;

    // 추가 보안 검증: widgetKey 일치 여부 확인
    if (configData.widget_key && configData.widget_key !== widgetKey) {
      console.warn('[WidgetChatPage] Widget key mismatch');
      return;
    }

    // 세션 정보를 localStorage에 저장
    localStorage.setItem('widget_session_token', session.session_token);
    localStorage.setItem('widget_session_id', session.session_id);
    localStorage.setItem('widget_refresh_token', session.refresh_token);
    localStorage.setItem('widget_api_base_url', apiBaseUrl);

    // Config 설정
    setConfig(configData);
    applyTheme(configData.config);

    // Welcome 메시지 추가
    if (configData.config.welcome_message) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: configData.config.welcome_message,
          timestamp: new Date().toISOString(),
        },
      ]);
    }

    setSessionReady(true);
    setLoading(false);

    console.log('[WidgetChatPage] Session received and validated from parent');
  }, [widgetKey, allowedOrigin]);

  /**
   * postMessage 리스너 등록 및 정리
   */
  useEffect(() => {
    if (!widgetKey) {
      setError('Widget key가 없습니다');
      setLoading(false);
      return;
    }

    // 리스너 등록
    window.addEventListener('message', handleParentMessage);

    // Cleanup 함수: 컴포넌트 언마운트 시 리스너 제거
    return () => {
      window.removeEventListener('message', handleParentMessage);
    };
  }, [widgetKey, handleParentMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * 메시지 전송
   */
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || sending || !sessionReady) return;

    const userMessage: WidgetMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      const sessionToken = localStorage.getItem('widget_session_token');
      const sessionId = localStorage.getItem('widget_session_id');

      if (!sessionToken || !sessionId) {
        throw new Error('세션이 만료되었습니다');
      }

      const response = await widgetApi.sendMessage(sessionToken, {
        session_id: sessionId,
        message: {
          content: userMessage.content,
          type: 'text',
        },
        context: {
          timestamp: new Date().toISOString(),
        },
      });

      const assistantMessage: WidgetMessage = {
        id: response.message_id,
        role: 'assistant',
        content: response.response.content,
        timestamp: response.timestamp,
        sources: response.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : '메시지 전송 실패';
      console.error('Send message error:', err);

      const errorMsg: WidgetMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `오류: ${errorMessage}`,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  const applyTheme = (cfg: WidgetConfigResponse['config']) => {
    document.documentElement.style.setProperty(
      '--primary-color',
      cfg.primary_color || '#0066FF'
    );

    const isDark =
      cfg.theme === 'dark' ||
      (cfg.theme === 'auto' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    document.documentElement.classList.toggle('dark', isDark);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen p-4 bg-gray-50">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const primaryColor = config?.config.primary_color || '#0066FF';

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div
        className="px-4 py-3 border-b text-white shadow-sm"
        style={{ background: primaryColor }}
      >
        <div className="flex items-center gap-3">
          {config?.config.avatar_url && (
            <img
              src={config.config.avatar_url}
              alt="Bot Avatar"
              className="w-8 h-8 rounded-full"
            />
          )}
          <h1 className="font-semibold text-lg">
            {config?.config.bot_name || '챗봇'}
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
                msg.role === 'user'
                  ? 'text-white'
                  : 'bg-white text-gray-900 border'
              }`}
              style={{
                background: msg.role === 'user' ? primaryColor : undefined,
              }}
            >
              <p className="text-sm whitespace-pre-wrap break-words">
                {msg.content}
              </p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">출처:</p>
                  {msg.sources.map((source, idx) => (
                    <div key={idx} className="text-xs text-gray-500">
                      • {source.title}
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs mt-1 opacity-70">
                {new Date(msg.timestamp).toLocaleTimeString('ko-KR')}
              </p>
            </div>
          </div>
        ))}
        {config?.config.show_typing_indicator && sending && (
          <div className="flex justify-start">
            <div className="bg-white rounded-lg p-3 shadow-sm border">
              <p className="text-sm text-gray-600">입력 중...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-white">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
            placeholder={
              config?.config.placeholder_text || '메시지를 입력하세요...'
            }
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            style={{ background: primaryColor }}
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
