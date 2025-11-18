import { useState, useCallback, useMemo, useSyncExternalStore } from 'react';
import { useQuery } from '@tanstack/react-query';
import { widgetApi } from '@/features/widget/api/widgetApi';
import type {
  WidgetConfigResponse,
  WidgetMessage,
  BrowserFingerprint,
  PageContext,
} from '@/features/widget/types/widget.types';

type StateUpdater<T> = T | ((prev: T) => T);

type CachedSession = {
  id: string;
  token: string;
  refreshToken: string;
  expiresAt: string;
};

const SESSION_KEY = (widgetKey: string) => `standalone_session_${widgetKey}`;

const resolveNextState = <T,>(updater: StateUpdater<T>, prevState: T): T =>
  typeof updater === 'function'
    ? (updater as (prev: T) => T)(prevState)
    : updater;

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
  const getSnapshot = useCallback((): CachedSession | null => {
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
  }, [widgetKey]);

  const subscribe = useCallback(
    (callback: () => void) => {
      if (!widgetKey) return () => {};
      const eventName = `session-change-${widgetKey}`;
      const handleChange = () => callback();
      window.addEventListener(eventName, handleChange);
      // 다른 탭의 변경도 감지
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === SESSION_KEY(widgetKey)) {
          callback();
        }
      };
      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener(eventName, handleChange);
        window.removeEventListener('storage', handleStorageChange);
      };
    },
    [widgetKey]
  );

  const session = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const saveSession = useCallback(
    (payload: CachedSession) => {
      if (!widgetKey) return;
      localStorage.setItem(SESSION_KEY(widgetKey), JSON.stringify(payload));
      // 커스텀 이벤트로 변경 알림
      window.dispatchEvent(new CustomEvent(`session-change-${widgetKey}`));
    },
    [widgetKey]
  );

  const clearSession = useCallback(() => {
    if (!widgetKey) return;
    localStorage.removeItem(SESSION_KEY(widgetKey));
    // 커스텀 이벤트로 변경 알림
    window.dispatchEvent(new CustomEvent(`session-change-${widgetKey}`));
  }, [widgetKey]);

  return { session, saveSession, clearSession };
}

type InitializationResult = {
  config: WidgetConfigResponse;
  session: CachedSession;
};

export function useStandaloneChat(widgetKey: string | undefined) {
  const normalizedKey = widgetKey ?? '__default_widget__';
  const [messagesMap, setMessagesMap] = useState<
    Record<string, WidgetMessage[]>
  >({});
  const [sending, setSending] = useState(false);
  const [chatErrorMap, setChatErrorMap] = useState<
    Record<string, string | null>
  >({});
  const { session, saveSession, clearSession } = useSessionManager(widgetKey);

  const messages = messagesMap[normalizedKey] ?? [];
  const setMessagesForKey = useCallback(
    (updater: StateUpdater<WidgetMessage[]>) => {
      setMessagesMap((prev) => {
        const prevMessages = prev[normalizedKey] ?? [];
        const nextMessages = resolveNextState(updater, prevMessages);
        if (prevMessages === nextMessages) {
          return prev;
        }
        return {
          ...prev,
          [normalizedKey]: nextMessages,
        };
      });
    },
    [normalizedKey]
  );

  const chatError = chatErrorMap[normalizedKey] ?? null;
  const setChatErrorForKey = useCallback(
    (updater: StateUpdater<string | null>) => {
      setChatErrorMap((prev) => {
        const prevError = prev[normalizedKey] ?? null;
        const nextError = resolveNextState(updater, prevError);
        if (prevError === nextError) {
          return prev;
        }
        return {
          ...prev,
          [normalizedKey]: nextError,
        };
      });
    },
    [normalizedKey]
  );

  const initializeSession = useCallback(async (): Promise<InitializationResult> => {
    if (!widgetKey) {
      throw new Error('Widget key가 없습니다');
    }

    const configData = await widgetApi.getConfig(widgetKey);

    if (configData.config.welcome_message) {
      setMessagesForKey((prev) =>
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
      return { config: configData, session };
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

    const payload: CachedSession = {
      id: sessionResponse.session_id,
      token: sessionResponse.session_token,
      refreshToken: sessionResponse.refresh_token,
      expiresAt: sessionResponse.expires_at,
    };

    saveSession(payload);

    return {
      config: configData,
      session: payload,
    };
  }, [widgetKey, session, saveSession, setMessagesForKey]);

  const {
    data: initializationResult,
    error: initializationError,
    isPending: initializationPending,
    refetch: refetchInitialization,
  } = useQuery({
    queryKey: ['standalone-chat', widgetKey],
    queryFn: initializeSession,
    enabled: Boolean(widgetKey),
    retry: 1,
  });

  const effectiveSession = useMemo<CachedSession | null>(() => {
    return session ?? initializationResult?.session ?? null;
  }, [session, initializationResult]);

  const config = initializationResult?.config ?? null;
  const loading = Boolean(widgetKey) && initializationPending;
  const error =
    widgetKey === undefined
      ? 'Widget key가 없습니다'
      : initializationError instanceof Error
        ? initializationError.message
        : null;

  const sendMessage = useCallback(
    async (content: string) => {
      if (!effectiveSession || !config) return;

      setChatErrorForKey(null);

      const userMessage: WidgetMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };
      const assistantId = `assistant-${Date.now()}`;

      const markAssistantError = (message: string) => {
        setMessagesForKey((prev) =>
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

      setMessagesForKey((prev) => [
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
          effectiveSession.token,
          {
            session_id: effectiveSession.id,
            message: { content, type: 'text' },
            context: { timestamp: new Date().toISOString() },
          },
          {
            onChunk: (chunk) => {
              setMessagesForKey((prev) =>
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
              setMessagesForKey((prev) =>
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
                setChatErrorForKey('세션이 만료되어 다시 연결 중입니다.');
                setMessagesForKey([]);
                clearSession();
                void refetchInitialization();
              } else {
                markAssistantError('응답을 가져오지 못했습니다. 다시 시도해주세요.');
                setChatErrorForKey(
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
        setChatErrorForKey(
          err instanceof Error ? err.message : '메시지 전송에 실패했습니다.'
        );
      }
    },
    [effectiveSession, config, clearSession, refetchInitialization, setMessagesForKey, setChatErrorForKey]
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
