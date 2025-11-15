import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useStandaloneChat } from '../hooks/useStandaloneChat';
import { widgetApi } from '@/features/widget/api/widgetApi';
import type { WidgetConfigResponse } from '@/features/widget/types/widget.types';

vi.mock('@/features/widget/api/widgetApi');

describe('useStandaloneChat', () => {
  const mockWidgetKey = 'test-widget-key';

  const mockConfig: WidgetConfigResponse = {
    widget_key: mockWidgetKey,
    config: {
      bot_name: 'TestBot',
      welcome_message: '안녕하세요! 테스트봇입니다.',
      placeholder_text: '메시지를 입력하세요',
      primary_color: '#3B82F6',
      avatar_url: null,
      show_sources: true,
    },
    signature: 'mock-signature',
    expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    nonce: 'mock-nonce',
  };

  const mockSession = {
    session_id: 'session-123',
    session_token: 'token-abc',
    refresh_token: 'refresh-xyz',
    expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('widgetKey가 없을 때 에러를 반환해야 함', async () => {
    const { result } = renderHook(() => useStandaloneChat(undefined));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Widget key가 없습니다');
    expect(result.current.config).toBeNull();
  });

  it('세션 초기화 시 config를 로드하고 세션을 생성해야 함', async () => {
    vi.mocked(widgetApi.getConfig).mockResolvedValue(mockConfig);
    vi.mocked(widgetApi.createSession).mockResolvedValue(mockSession);

    const { result } = renderHook(() => useStandaloneChat(mockWidgetKey));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.config).toEqual(mockConfig);
    expect(result.current.error).toBeNull();

    const cachedSession = localStorage.getItem(`standalone_session_${mockWidgetKey}`);
    expect(cachedSession).toBeTruthy();

    const parsed = JSON.parse(cachedSession!);
    expect(parsed.id).toBe(mockSession.session_id);
    expect(parsed.token).toBe(mockSession.session_token);
  });

  it('welcome 메시지가 있을 때 messages에 추가되어야 함', async () => {
    vi.mocked(widgetApi.getConfig).mockResolvedValue(mockConfig);
    vi.mocked(widgetApi.createSession).mockResolvedValue(mockSession);

    const { result } = renderHook(() => useStandaloneChat(mockWidgetKey));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].role).toBe('assistant');
    expect(result.current.messages[0].content).toBe(mockConfig.config.welcome_message);
  });

  it('기존 세션이 localStorage에 있을 때 재사용해야 함', async () => {
    const existingSession = {
      id: 'existing-session',
      token: 'existing-token',
      refreshToken: 'existing-refresh',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };
    localStorage.setItem(
      `standalone_session_${mockWidgetKey}`,
      JSON.stringify(existingSession)
    );

    vi.mocked(widgetApi.getConfig).mockResolvedValue(mockConfig);

    const { result } = renderHook(() => useStandaloneChat(mockWidgetKey));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(widgetApi.createSession).not.toHaveBeenCalled();
    expect(result.current.config).toEqual(mockConfig);
  });

  it('만료된 세션은 localStorage에서 제거되고 새 세션을 생성해야 함', async () => {
    const expiredSession = {
      id: 'expired-session',
      token: 'expired-token',
      refreshToken: 'expired-refresh',
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    };
    localStorage.setItem(
      `standalone_session_${mockWidgetKey}`,
      JSON.stringify(expiredSession)
    );

    vi.mocked(widgetApi.getConfig).mockResolvedValue(mockConfig);
    vi.mocked(widgetApi.createSession).mockResolvedValue(mockSession);

    const { result } = renderHook(() => useStandaloneChat(mockWidgetKey));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(widgetApi.createSession).toHaveBeenCalled();

    const cachedSession = localStorage.getItem(`standalone_session_${mockWidgetKey}`);
    const parsed = JSON.parse(cachedSession!);
    expect(parsed.id).toBe(mockSession.session_id);
  });

  it('API 에러 발생 시 에러 상태를 설정해야 함', async () => {
    const errorMessage = 'Widget을 찾을 수 없습니다';
    vi.mocked(widgetApi.getConfig).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useStandaloneChat(mockWidgetKey));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.config).toBeNull();
  });

  it('잘못된 localStorage 데이터는 무시하고 새 세션을 생성해야 함', async () => {
    localStorage.setItem(
      `standalone_session_${mockWidgetKey}`,
      'invalid-json'
    );

    vi.mocked(widgetApi.getConfig).mockResolvedValue(mockConfig);
    vi.mocked(widgetApi.createSession).mockResolvedValue(mockSession);

    const { result } = renderHook(() => useStandaloneChat(mockWidgetKey));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(widgetApi.createSession).toHaveBeenCalled();
    expect(result.current.config).toEqual(mockConfig);
  });
});
