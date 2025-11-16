import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { StandaloneAppPage } from '../pages/StandaloneAppPage';
import { useStandaloneChat } from '../hooks/useStandaloneChat';
import type { WidgetConfigResponse } from '@/features/widget/types/widget.types';

vi.mock('../hooks/useStandaloneChat');
vi.mock('../components/ChatHeader', () => ({
  ChatHeader: () => <div data-testid="chat-header">Mock ChatHeader</div>,
}));
vi.mock('../components/ChatMessageList', () => ({
  ChatMessageList: () => <div data-testid="chat-message-list">Mock ChatMessageList</div>,
}));
vi.mock('../components/ChatInput', () => ({
  ChatInput: () => <div data-testid="chat-input">Mock ChatInput</div>,
}));
vi.mock('../components/ChatSkeleton', () => ({
  ChatSkeleton: () => <div data-testid="chat-skeleton">Loading...</div>,
}));

describe('StandaloneAppPage', () => {
  const mockConfig: WidgetConfigResponse = {
    widget_key: 'test-key',
    config: {
      bot_name: 'TestBot',
      welcome_message: '안녕하세요',
      placeholder_text: '메시지 입력',
      primary_color: '#3B82F6',
      avatar_url: null,
      show_sources: true,
    },
    signature: 'sig',
    expires_at: new Date().toISOString(),
    nonce: 'nonce',
  };

  const defaultMockReturn = {
    loading: false,
    error: null,
    config: mockConfig,
    messages: [],
    sending: false,
    sendMessage: vi.fn(),
    chatError: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (widgetKey = 'test-widget-key') => {
    return render(
      <MemoryRouter initialEntries={[`/app/${widgetKey}`]}>
        <Routes>
          <Route path="/app/:widgetKey" element={<StandaloneAppPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('로딩 중일 때 ChatSkeleton을 렌더링해야 함', () => {
    vi.mocked(useStandaloneChat).mockReturnValue({
      ...defaultMockReturn,
      loading: true,
    });

    renderWithRouter();

    expect(screen.getByTestId('chat-skeleton')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('에러 발생 시 에러 메시지를 표시해야 함', () => {
    const errorMessage = 'Widget을 찾을 수 없습니다';
    vi.mocked(useStandaloneChat).mockReturnValue({
      ...defaultMockReturn,
      loading: false,
      error: errorMessage,
    });

    renderWithRouter();

    expect(screen.getByText('챗봇을 불러올 수 없습니다')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /다시 시도/i })).toBeInTheDocument();
  });

  it('정상 상태일 때 모든 채팅 컴포넌트를 렌더링해야 함', () => {
    vi.mocked(useStandaloneChat).mockReturnValue(defaultMockReturn);

    renderWithRouter();

    expect(screen.getByTestId('chat-header')).toBeInTheDocument();
    expect(screen.getByTestId('chat-message-list')).toBeInTheDocument();
    expect(screen.getByTestId('chat-input')).toBeInTheDocument();
  });

  it('chatError가 있을 때 에러 알림을 표시해야 함', () => {
    const chatErrorMessage = '메시지 전송 실패';
    vi.mocked(useStandaloneChat).mockReturnValue({
      ...defaultMockReturn,
      chatError: chatErrorMessage,
    });

    renderWithRouter();

    expect(screen.getByText(chatErrorMessage)).toBeInTheDocument();
  });

  it('widgetKey URL 파라미터를 useStandaloneChat에 전달해야 함', () => {
    const testWidgetKey = 'custom-widget-123';
    vi.mocked(useStandaloneChat).mockReturnValue(defaultMockReturn);

    renderWithRouter(testWidgetKey);

    expect(useStandaloneChat).toHaveBeenCalledWith(testWidgetKey);
  });

  it('main 역할과 적절한 aria-label을 가져야 함', () => {
    vi.mocked(useStandaloneChat).mockReturnValue(defaultMockReturn);

    renderWithRouter();

    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveAttribute('aria-label', '챗봇 대화 페이지');
  });
});
