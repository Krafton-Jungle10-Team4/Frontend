import { useState, useEffect, useCallback } from 'react';
import { widgetApi } from '@/features/widget/api/widgetApi';
import type {
  WidgetConfigResponse,
  WidgetMessage,
  BrowserFingerprint,
  PageContext,
} from '@/features/widget/types/widget.types';

type CachedSession = {
  id: string;
  token: string;
  refreshToken: string;
  expiresAt: string;
};

const SESSION_KEY = (widgetKey: string) => `standalone_session_${widgetKey}`;

const buildFingerprint = (): BrowserFingerprint => ({
  user_agent: navigator.userAgent,
  screen_resolution: `${window.screen.width}x${window.screen.height}`,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  language: navigator.language,
  platform: navigator.platform,
});

const buildContext = (): PageContext => {
  const params = new URLSearchParams(window.location.search);
  return {
    page_url: window.location.href,
    page_title: document.title,
    referrer: document.referrer || null,
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
  };
};

function useSessionManager(widgetKey?: string) {
  const [session, setSession] = useState<CachedSession | null>(() => {
    if (!widgetKey) return null;

    const raw = localStorage.getItem(SESSION_KEY(widgetKey));
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as CachedSession;
      if (new Date(parsed.expiresAt).getTime() > Date.now()) {
        return parsed;
      }
      localStorage.removeItem(SESSION_KEY(widgetKey));
      return null;
    } catch {
      localStorage.removeItem(SESSION_KEY(widgetKey));
      return null;
    }
  });

  useEffect(() => {
    const loadSession = () => {
      if (!widgetKey) {
        setSession(null);
        return;
      }
      const raw = localStorage.getItem(SESSION_KEY(widgetKey));
      if (!raw) {
        setSession(null);
        return;
      }

      try {
        const parsed = JSON.parse(raw) as CachedSession;
        if (new Date(parsed.expiresAt).getTime() > Date.now()) {
          setSession(parsed);
        } else {
          localStorage.removeItem(SESSION_KEY(widgetKey));
          setSession(null);
        }
      } catch {
        localStorage.removeItem(SESSION_KEY(widgetKey));
        setSession(null);
      }
    };

    // eslint-disable-next-line react-compiler/react-compiler
    loadSession();
  }, [widgetKey]);

  const saveSession = useCallback(
    (payload: CachedSession) => {
      if (!widgetKey) return;
      localStorage.setItem(SESSION_KEY(widgetKey), JSON.stringify(payload));
      setSession(payload);
    },
    [widgetKey]
  );

  const clearSession = useCallback(() => {
    if (!widgetKey) return;
    localStorage.removeItem(SESSION_KEY(widgetKey));
    setSession(null);
  }, [widgetKey]);

  return { session, saveSession, clearSession };
}

export function useStandaloneChat(widgetKey: string | undefined) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<WidgetConfigResponse | null>(null);
  const [messages, setMessages] = useState<WidgetMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const { session, saveSession, clearSession } = useSessionManager(widgetKey);

  useEffect(() => {
    setMessages([]);
    setChatError(null);
  }, [widgetKey]);

  const initializeSession = useCallback(async () => {
    if (!widgetKey) {
      setError('Widget key가 없습니다');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const configData = await widgetApi.getConfig(widgetKey);
      setConfig(configData);

      if (configData.config.welcome_message) {
        setMessages((prev) =>
          prev.length > 0
            ? prev
            : [
                {
                  id: `welcome-${widgetKey}`,
                  role: 'assistant',
                  content: configData.config.welcome_message,
                  timestamp: new Date().toISOString(),
                },
              ]
        );
      }

      if (session) {
        setLoading(false);
        return;
      }

      const sessionResponse = await widgetApi.createSession({
        widget_key: widgetKey,
        widget_signature: {
          signature: configData.signature,
          expires_at: configData.expires_at,
          nonce: configData.nonce,
          widget_key: configData.widget_key ?? widgetKey,
        },
        fingerprint: buildFingerprint(),
        context: buildContext(),
        user_info: null,
      });

      saveSession({
        id: sessionResponse.session_id,
        token: sessionResponse.session_token,
        refreshToken: sessionResponse.refresh_token,
        expiresAt: sessionResponse.expires_at,
      });

      setLoading(false);
    } catch (err) {
      clearSession();
      setError(err instanceof Error ? err.message : '세션 초기화 실패');
      setLoading(false);
    }
  }, [widgetKey, session, saveSession, clearSession]);

  useEffect(() => {
    // eslint-disable-next-line react-compiler/react-compiler
    void initializeSession();
  }, [initializeSession]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!session || !config) return;

      setChatError(null);

      const userMessage: WidgetMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };
      const assistantId = `assistant-${Date.now()}`;

      const markAssistantError = (message: string) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? {
                  ...msg,
                  content: message,
                  sources: [],
                }
              : msg
          )
        );
      };

      setMessages((prev) => [
        ...prev,
        userMessage,
        {
          id: assistantId,
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString(),
          sources: [],
        },
      ]);
      setSending(true);

      try {
        await widgetApi.sendMessageStream(
          session.token,
          {
            session_id: session.id,
            message: { content, type: 'text' },
            context: { timestamp: new Date().toISOString() },
          },
          {
            onChunk: (chunk) => {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantId
                    ? { ...msg, content: `${msg.content}${chunk}` }
                    : msg
                )
              );
            },
            onSources: (sources) => {
              const widgetSources = sources.map((source) => ({
                document_id: source.document_id,
                title: source.metadata?.filename || source.document_id,
                snippet: source.content,
                relevance_score: source.similarity_score,
              }));
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantId ? { ...msg, sources: widgetSources } : msg
                )
              );
            },
            onComplete: () => {
              setSending(false);
            },
            onError: (err) => {
              setSending(false);
              if (
                err instanceof Error &&
                /401|403|expired/i.test(err.message)
              ) {
                setChatError('세션이 만료되어 다시 연결 중입니다.');
                setMessages([]);
                clearSession();
                void initializeSession();
              } else {
                markAssistantError('응답을 가져오지 못했습니다. 다시 시도해주세요.');
                setChatError(
                  err instanceof Error
                    ? err.message
                    : '메시지 전송 중 오류가 발생했습니다.'
                );
              }
            },
          }
        );
      } catch (err) {
        setSending(false);
        markAssistantError('메시지 전송에 실패했습니다.');
        setChatError(
          err instanceof Error ? err.message : '메시지 전송에 실패했습니다.'
        );
      }
    },
    [session, config, clearSession, initializeSession]
  );

  return {
    loading,
    error,
    config,
    messages,
    sending,
    sendMessage,
    chatError,
  };
}
