import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/shared/components/button';
import {
  RotateCw,
  Share2,
  CheckCircle2,
  ExternalLink,
  Puzzle,
  TestTube,
} from 'lucide-react';
import { Progress } from '@/shared/components/progress';
import { Card } from '@/shared/components/card';
import { toast } from 'sonner';
import type { Language } from '@/shared/types';

interface BotPreviewProps {
  botName: string;
  onContinue: () => void;
  language?: Language;
}

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

export function BotPreview({ botName, onContinue, language: _language = 'ko' }: BotPreviewProps) {
  // TODO: Get botId from props or context
  const [_botId, _setBotId] = useState<string | null>(null); // Backend should provide this
  const messageIdCounter = useRef(0);
  const generateMessageId = useCallback(() => {
    messageIdCounter.current += 1;
    return `msg-${messageIdCounter.current}`;
  }, []);

  const translations = {
    ko: {
      initialMessage: `안녕하세요! 👋 AI 에이전트 웹 플랫폼 지원팀입니다. 무엇을 도와드릴까요?`,
      botResponse:
        '죄송합니다. 현재 미리보기 모드로 요청을 처리할 수 없습니다. 전체 기능을 사용하려면 챗봇을 지식 베이스에 연결해주세요.',
      today: '오늘',
      delivered: '전송됨',
      placeholder: '메시지를 입력하세요...',
      quickMessages: [
        '첫 번째 AI 에이전트는 어떻게 설정하나요?',
        '튜토리얼이나 가이드는 어디서 찾을 수 있나요?',
        '기능 사용에 문제가 있습니다',
      ],
      ready: '챗봇이 준비되었습니다!',
      trainingComplete: '학습 완료',
      nextSteps: '다음 단계',
      testBot: '챗봇 테스트하기',
      enterStudio: '스튜디오에서 챗봇 조정하기',
      extendBot: '연동으로 챗봇 확장하기',
      shareBot: '챗봇 공유하기',
      getAccess: '더 많은 기능 사용하기',
      premiumDesc:
        '커스텀 브랜딩, 상담원 전환, 역할 기반 접근 제어 등이 프리미엄 플랜에서 제공됩니다.',
      viewPlans: '플랜 보기',
      share: '공유',
      continue: '계속하기',
    },
  };

  const t = translations.ko;

  const initialMessage: Message = {
    id: '1',
    type: 'bot',
    content: t.initialMessage,
    timestamp: new Date(),
  };

  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleResetChat = async () => {
    // TODO: Optional - POST /api/chat/reset
    // If you want to reset chat history on backend
    // Request body: { sessionId: sessionId, botId: botId }
    // Response: { success: boolean }
    //
    // try {
    //   await fetch('/api/chat/reset', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ sessionId, botId })
    //   });
    // } catch (error) {
    //   console.error('Failed to reset chat:', error);
    // }

    // Frontend: Reset local state
    setMessages([
      {
        id: generateMessageId(),
        type: 'bot',
        content: t.initialMessage,
        timestamp: new Date(),
      },
    ]);
    setInputValue('');
    setIsTyping(false);

    // Generate new session ID for fresh chat
    messageIdCounter.current = 0;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // TODO: POST /api/chat
    // Send user message and get bot response
    //
    // Request body: {
    //   botId: string,
    //   sessionId: string,
    //   message: string,
    //   userId?: string  // Optional: if user is logged in
    // }
    //
    // Response: {
    //   messageId: string,
    //   botResponse: string,
    //   timestamp: string
    // }
    //
    // Backend Process:
    // 1. Receive user message
    // 2. Query bot's knowledge base
    // 3. Generate response using AI model
    // 4. Store conversation in database
    // 5. Return bot response

    const userMessageContent = inputValue;
    const newMessage: Message = {
      id: generateMessageId(),
      type: 'user',
      content: userMessageContent,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputValue('');

    // Show typing indicator
    setIsTyping(true);

    try {
      // Mock API call - replace with actual API
      // const response = await fetch('/api/chat', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     botId,
      //     sessionId,
      //     message: userMessageContent
      //   })
      // });
      //
      // if (!response.ok) throw new Error('Chat API failed');
      //
      // const data = await response.json();

      // Mock delay to simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsTyping(false);

      const botResponse: Message = {
        id: generateMessageId(),
        type: 'bot',
        content: t.botResponse, // Replace with: data.botResponse
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      setIsTyping(false);
      console.error('Chat error:', error);

      // Show error message
      const errorMessage: Message = {
        id: generateMessageId(),
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleQuickMessage = async (msg: string) => {
    // TODO: Same as handleSendMessage - POST /api/chat

    setInputValue('');

    const newMessage: Message = {
      id: generateMessageId(),
      type: 'user',
      content: msg,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);

    // Show typing indicator
    setIsTyping(true);

    try {
      // Mock API call - replace with actual API (same endpoint as handleSendMessage)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsTyping(false);
      const botResponse: Message = {
        id: generateMessageId(),
        type: 'bot',
        content: t.botResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      setIsTyping(false);
      console.error('Chat error:', error);
    }
  };

  const handleShare = async () => {
    // TODO: POST /api/bots/{botId}/share
    // Generate shareable URL for the bot
    //
    // Request: POST /api/bots/${botId}/share
    // Response: {
    //   shareUrl: string,  // e.g., "https://yourapp.com/chat/abc123"
    //   shareId: string,
    //   expiresAt?: string  // Optional: if URLs expire
    // }
    //
    // Backend Process:
    // 1. Generate unique share ID
    // 2. Create shareable chat link
    // 3. Store share metadata in database
    // 4. Return share URL
    //
    // Frontend:
    // 1. Call API to get share URL
    // 2. Copy URL to clipboard
    // 3. Show success toast
    // 4. Optional: Open URL in new tab

    try {
      // Mock API call - replace with actual API
      // const response = await fetch(`/api/bots/${botId}/share`, {
      //   method: 'POST'
      // });
      //
      // if (!response.ok) throw new Error('Share API failed');
      //
      // const data = await response.json();
      // const shareUrl = data.shareUrl;

      // Mock share URL
      const shareUrl = `${window.location.origin}/chat/${_botId || 'preview'}`;

      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);

      // Show success toast
      toast.success('공유 링크가 클립보드에 복사되었습니다!');

      // Optional: Open in new tab
      // window.open(shareUrl, '_blank');
    } catch (error) {
      console.error('Share error:', error);
      toast.error('공유 링크 생성에 실패했습니다');
    }
  };

  const botInitial = botName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="w-full max-w-6xl flex gap-6">
        {/* Mobile Chat Preview */}
        <div className="flex-1 flex justify-center items-start">
          <div className="w-[400px] h-[720px] bg-gray-900 rounded-[30px] shadow-2xl overflow-hidden flex flex-col border-8 border-gray-800">
            {/* Chat Header */}
            <div className="bg-gray-900 text-white p-4 flex items-center justify-between border-b border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-teal-400 rounded-full flex items-center justify-center">
                  <span className="text-xs text-gray-900">{botInitial}</span>
                </div>
                <h3 className="text-sm">{botName}</h3>
              </div>
              <button
                onClick={handleResetChat}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <RotateCw size={18} />
              </button>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto p-4 bg-gray-900 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {/* Bot Avatar and Name */}
              <div className="flex flex-col items-center mb-6 mt-4">
                <div className="w-20 h-20 bg-teal-400 rounded-full flex items-center justify-center mb-3">
                  <span className="text-2xl text-gray-900">{botInitial}</span>
                </div>
                <p className="text-white text-sm">{botName}</p>
              </div>

              {/* Today Label */}
              <div className="text-center mb-4">
                <span className="text-xs text-gray-500">{t.today}</span>
              </div>

              {/* Messages */}
              <div className="space-y-3">
                {messages.map((message, index) => (
                  <div key={message.id}>
                    {message.type === 'user' ? (
                      <div className="flex justify-end">
                        <div className="bg-teal-400 text-gray-900 rounded-2xl px-4 py-2 max-w-[80%]">
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-start gap-2">
                        <div className="w-6 h-6 bg-teal-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-xs text-gray-900">
                            {botInitial}
                          </span>
                        </div>
                        <div className="bg-gray-700 text-white rounded-2xl px-4 py-2 max-w-[80%]">
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    )}
                    {index === messages.length - 1 &&
                      message.type === 'user' && (
                        <div className="text-right mt-1">
                          <span className="text-xs text-gray-500">
                            {t.delivered}
                          </span>
                        </div>
                      )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start gap-2">
                    <div className="w-6 h-6 bg-teal-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs text-gray-900">
                        {botInitial}
                      </span>
                    </div>
                    <div className="bg-gray-700 text-white rounded-2xl px-4 py-3 flex gap-1">
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      ></div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              {messages.length === 1 && !isTyping && (
                <div className="mt-4 space-y-2">
                  {t.quickMessages.map((msg, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickMessage(msg)}
                      className="w-full text-left px-4 py-2.5 bg-transparent border border-teal-400 text-teal-400 rounded-2xl text-sm hover:bg-teal-400 hover:bg-opacity-10 transition-colors"
                    >
                      {msg}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-gray-900 border-t border-gray-700">
              <div className="flex items-center gap-2 bg-gray-800 rounded-full px-4 py-2">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                      handleSendMessage();
                    }
                  }}
                  placeholder={t.placeholder}
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="text-teal-400 disabled:text-gray-600"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 2L9 11M18 2L12 18L9 11M18 2L2 8L9 11"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-96 space-y-4">
          {/* Progress */}
          <Card className="p-6 bg-white shadow-lg">
            <p className="text-sm text-gray-600 mb-4">{t.ready}</p>
            <Progress value={100} className="h-2 mb-2" />
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle2 size={16} />
              <span>{t.trainingComplete}</span>
            </div>
          </Card>

          {/* Next Steps */}
          <Card className="p-6 bg-white shadow-lg">
            <h3 className="text-sm mb-4 flex items-center gap-2">
              <span>→</span>
              <span>{t.nextSteps}</span>
            </h3>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <TestTube size={18} className="text-gray-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">{t.testBot}</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <ExternalLink
                  size={18}
                  className="text-gray-600 flex-shrink-0"
                />
                <span className="text-sm text-gray-700">{t.enterStudio}</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <Puzzle size={18} className="text-gray-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">{t.extendBot}</span>
              </button>
              <button
                onClick={handleShare}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <Share2 size={18} className="text-gray-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">{t.shareBot}</span>
              </button>
            </div>
          </Card>

          {/* Premium Card */}
          <Card className="p-6 bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 shadow-lg">
            <h3 className="mb-3">{t.getAccess}</h3>
            <p className="text-sm text-gray-700 mb-4">{t.premiumDesc}</p>
            <Button variant="outline" className="w-full bg-white">
              {t.viewPlans}
            </Button>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleShare}
              variant="outline"
              className="flex-1 gap-2"
            >
              <Share2 size={16} />
              {t.share}
            </Button>
            <Button
              onClick={() => {
                // NAVIGATE: Go to main page (workspace with all bots)
                onContinue();
              }}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            >
              {t.continue}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
