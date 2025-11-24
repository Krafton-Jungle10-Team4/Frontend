import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle, Send, ShoppingBag, Maximize2, Bot } from 'lucide-react';
import { Alert, AlertDescription } from '@shared/components/alert';
import { widgetApi } from '../api/widgetApi';
import { API_BASE_URL } from '@shared/constants/apiEndpoints';
import type {
  WidgetConfigResponse,
  WidgetMessage,
  WidgetSessionMessage,
  WidgetSource,
} from '../types/widget.types';
import type { Source } from '@/shared/types/api.types';

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
  const [searchParams] = useSearchParams();
  const isPreviewMode = searchParams.get('preview') === 'true';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<WidgetConfigResponse | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [messages, setMessages] = useState<WidgetMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'notice'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingBufferRef = useRef('');
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeAssistantIdRef = useRef<string | null>(null);
  const updateAssistantMessage = useCallback(
    (messageId: string, updater: (msg: WidgetMessage) => WidgetMessage) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? updater(msg) : msg))
      );
    },
    []
  );

  /**
   * 타이핑 애니메이션 중지
   */
  const stopTypingAnimation = useCallback(() => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    typingBufferRef.current = '';
    activeAssistantIdRef.current = null;
  }, []);

  /**
   * 타이핑 애니메이션에 텍스트 청크 추가
   */
  const enqueueTypingChunk = useCallback((messageId: string, chunk: string) => {
    if (activeAssistantIdRef.current !== messageId) {
      stopTypingAnimation();
      activeAssistantIdRef.current = messageId;
    }

    typingBufferRef.current += chunk;

    if (typingIntervalRef.current) {
      return;
    }

    typingIntervalRef.current = setInterval(() => {
      if (!typingBufferRef.current.length) {
        stopTypingAnimation();
        return;
      }

      const nextChar = typingBufferRef.current[0];
      typingBufferRef.current = typingBufferRef.current.slice(1);

      updateAssistantMessage(messageId, (msg) => ({
        ...msg,
        content: `${msg.content}${nextChar}`,
      }));
    }, 12);
  }, [stopTypingAnimation, updateAssistantMessage]);

  /**
   * 타이핑 애니메이션 완료 대기
   */
  const waitForTypingToFinish = useCallback((callback?: () => void) => {
    const poll = () => {
      if (!typingBufferRef.current.length && !typingIntervalRef.current) {
        callback?.();
        return;
      }
      requestAnimationFrame(poll);
    };
    poll();
  }, []);

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
  const handleParentMessage = useCallback((event: MessageEvent<any>) => {
    console.log('[WidgetChatPage] Received postMessage:', {
      type: event.data?.type,
      origin: event.origin,
      allowedOrigin: allowedOrigin,
      referrer: document.referrer
    });

    // Preview 모드: UPDATE_WIDGET_CONFIG 메시지 처리
    if (isPreviewMode && event.data?.type === 'UPDATE_WIDGET_CONFIG') {
      const newConfig = event.data.config;
      console.log('[WidgetChatPage] Preview config updated:', newConfig);

      // Config 업데이트
      setConfig((prev) => ({
        ...prev!,
        config: {
          ...prev!.config,
          ...newConfig,
        },
      }));

      // 테마 적용
      applyTheme(newConfig);
      return;
    }

    // Origin 검증: 부모 도메인이 확인된 경우에만 체크
    // 개발 모드: localhost origins는 항상 허용
    const isLocalhost = event.origin.includes('localhost') || event.origin.includes('127.0.0.1');
    const shouldValidateOrigin = allowedOrigin && !isLocalhost;

    if (shouldValidateOrigin && event.origin !== allowedOrigin) {
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
      console.log('[WidgetChatPage] Ignoring non-WIDGET_SESSION message:', event.data?.type);
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
   * Preview 모드에서 초기 config 로드
   */
  useEffect(() => {
    if (isPreviewMode && widgetKey) {
      // Preview 모드에서는 API로 기본 config 로드
      widgetApi.getConfig(widgetKey).then((configData) => {
        setConfig(configData);
        applyTheme(configData.config);
        setSessionReady(true);
        setLoading(false);

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

        // 부모에게 초기화 완료 알림
        window.parent.postMessage({ type: 'PREVIEW_READY' }, '*');
      }).catch((err) => {
        console.error('[WidgetChatPage] Failed to load config:', err);
        setError('설정을 불러올 수 없습니다');
        setLoading(false);
      });
    }
  }, [isPreviewMode, widgetKey]);

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

  useEffect(() => {
    return () => {
      stopTypingAnimation();
    };
  }, [stopTypingAnimation]);

  /**
   * 세션 준비 완료 시 입력창에 자동 포커스
   */
  useEffect(() => {
    if (sessionReady && inputRef.current) {
      inputRef.current.focus();
    }
  }, [sessionReady]);

  const startStreamingConversation = async (messageContent: string) => {
    const userMessage: WidgetMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString(),
    };

    const assistantMessageId = `assistant-${Date.now()}`;
    const placeholderAssistant: WidgetMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      sources: [],
    };

    stopTypingAnimation();
    activeAssistantIdRef.current = assistantMessageId;

    setMessages((prev) => [...prev, userMessage, placeholderAssistant]);
    setSending(true);

    try {
      const sessionToken = localStorage.getItem('widget_session_token');
      const sessionId = localStorage.getItem('widget_session_id');
      const apiBaseUrl =
        localStorage.getItem('widget_api_base_url') || API_BASE_URL;

      if (!sessionToken || !sessionId) {
        throw new Error('세션이 만료되었습니다');
      }

      await widgetApi.sendMessageStream(
        sessionToken,
        {
          session_id: sessionId,
          message: {
            content: userMessage.content,
            type: 'text',
          },
          context: {
            timestamp: new Date().toISOString(),
          },
        },
        {
          onChunk: (chunk) => {
            enqueueTypingChunk(assistantMessageId, chunk);
          },
          onSources: (sources) => {
            const normalized = normalizeSources(sources);
            updateAssistantMessage(assistantMessageId, (msg) => ({
              ...msg,
              sources: normalized,
            }));
          },
          onComplete: () => {
            waitForTypingToFinish(() => {
              updateAssistantMessage(assistantMessageId, (msg) => ({
                ...msg,
                timestamp: new Date().toISOString(),
              }));
              setSending(false);
            });
          },
          onError: (error) => {
            stopTypingAnimation();
            updateAssistantMessage(assistantMessageId, () => ({
              id: assistantMessageId,
              role: 'assistant',
              content: `오류: ${error.message}`,
              timestamp: new Date().toISOString(),
            }));
            setSending(false);
          },
        },
        apiBaseUrl
      );
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : '메시지 전송 실패';
      console.error('Send message error:', err);

      stopTypingAnimation();
      updateAssistantMessage(assistantMessageId, () => ({
        id: assistantMessageId,
        role: 'assistant',
        content: `오류: ${errorMessage}`,
        timestamp: new Date().toISOString(),
      }));
    } finally {
      setSending(false);
    }
  };

  /**
   * 메시지 전송
   */
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || sending || !sessionReady) return;

    const messageContent = input.trim();
    setInput('');

    await startStreamingConversation(messageContent);
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

  // 🔧 Hook을 early return 전에 호출 (React Hooks 규칙)
  const primaryColor = config?.config.primary_color || '#0066FF';
  const position = config?.config.position || 'bottom-right';

  // 위치에 따른 클래스 계산
  const containerClasses = useMemo(() => {
    const baseClasses = 'flex flex-col bg-gray-50';

    if (!isPreviewMode) {
      return `${baseClasses} h-screen`;
    }

    const previewBaseClasses = `${baseClasses} fixed w-[400px] h-[600px] shadow-2xl rounded-lg overflow-hidden`;
    const positionMap = {
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
    };

    return `${previewBaseClasses} ${positionMap[position as keyof typeof positionMap] || positionMap['bottom-right']}`;
  }, [isPreviewMode, position]);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-screen bg-gray-50"
        role="status"
        aria-live="polite"
        aria-label="채팅 로딩 중"
      >
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" aria-hidden="true" />
        <span className="sr-only">채팅을 불러오는 중입니다...</span>
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

  return (
    <div className={containerClasses}>
      <header
        className="px-4 py-4 text-white shadow-sm"
        style={{ background: primaryColor }}
        role="banner"
        aria-label="서비스 헤더"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h1 className="font-bold text-lg leading-tight">
                {config?.config.bot_name || '서비스'}
              </h1>
              <p className="text-sm opacity-90 mt-0.5">무엇을 물어보세요!</p>
            </div>
          </div>
          <button
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            aria-label="전체화면"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b">
        <div className="flex">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'chat'
                ? 'text-gray-900 border-b-2'
                : 'text-gray-500'
            }`}
            style={{
              borderColor: activeTab === 'chat' ? primaryColor : 'transparent',
            }}
          >
            문의해주세요
          </button>
          <button
            onClick={() => setActiveTab('notice')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'notice'
                ? 'text-gray-900 border-b-2'
                : 'text-gray-500'
            }`}
            style={{
              borderColor: activeTab === 'notice' ? primaryColor : 'transparent',
            }}
          >
            공지사항 내역
          </button>
        </div>
      </div>

      <main
        className="flex-1 overflow-y-auto p-4 space-y-4"
        role="log"
        aria-live="polite"
        aria-label="채팅 메시지"
      >
        {activeTab === 'notice' ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Bot className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-sm">공지사항이 없습니다</p>
          </div>
        ) : messages.length === 1 && messages[0].id === 'welcome' ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Bot className="w-20 h-20 text-gray-300 mb-4" />
            <p className="text-gray-600 whitespace-pre-wrap">
              {messages[0].content}
            </p>
          </div>
        ) : (
          messages.map((msg) => (
          <article
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            aria-label={`${msg.role === 'user' ? '사용자' : '서비스'} 메시지`}
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
                <div className="mt-2 pt-2 border-t border-gray-200 space-y-2">
                  <p className="text-xs text-gray-600 mb-1">출처:</p>
                  {msg.sources.map((source, idx) => (
                    <div
                      key={`${msg.id}-source-${idx}`}
                      className="text-xs text-gray-600"
                    >
                      <p className="font-medium text-gray-700">{source.title}</p>
                      {source.snippet && (
                        <p className="text-gray-500 line-clamp-2">{source.snippet}</p>
                      )}
                      {typeof source.relevance_score === 'number' && (
                        <span className="text-gray-400">
                          {Math.round(source.relevance_score * 100)}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs mt-1 opacity-70">
                {new Date(msg.timestamp).toLocaleTimeString('ko-KR')}
              </p>
            </div>
          </article>
          ))
        )}
        {config?.config.show_typing_indicator && sending && activeTab === 'chat' && (
          <div className="flex justify-start" role="status" aria-live="polite">
            <div className="bg-white rounded-lg p-3 shadow-sm border">
              <p className="text-sm text-gray-600">입력 중...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {activeTab === 'chat' && (
        <footer className="p-4 border-t bg-white">
          <div className="mb-2">
            <label htmlFor="chat-input" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <span className="text-gray-900">질문입력</span>
            </label>
          </div>
          <form onSubmit={sendMessage} className="flex gap-2" aria-label="메시지 입력 폼">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 bg-gray-50"
              placeholder={
                config?.config.placeholder_text || '메시지를 입력하세요...'
              }
              disabled={sending}
              aria-label="메시지 입력"
              id="chat-input"
              style={{
                '--tw-ring-color': primaryColor,
              } as React.CSSProperties}
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="p-3 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:opacity-90"
              style={{ background: primaryColor }}
              aria-label={sending ? '메시지 전송 중' : '메시지 전송'}
            >
              {sending ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </form>
        </footer>
      )}
    </div>
  );
}

const normalizeSources = (sources: Source[]): WidgetSource[] => {
  return sources.map((source, idx) => ({
    document_id: source.document_id,
    title: `출처 ${idx + 1}`,
    snippet: source.content,
    relevance_score: source.similarity_score ?? 0,
  }));
};
