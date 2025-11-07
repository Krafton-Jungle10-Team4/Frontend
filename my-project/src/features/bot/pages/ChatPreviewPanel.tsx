import { useState, useRef, useEffect } from 'react';
import { RotateCw, ExternalLink } from 'lucide-react';
import { chatApi, formatChatMessage } from '@/features/chat/api/chatApi';
import { toast } from 'sonner';
import type { Source } from '@/shared/types/api.types';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
  sources?: Source[];
}

interface ChatPreviewPanelProps {
  botName: string;
  language: 'en' | 'ko';
}

/**
 * 챗봇 프리뷰 패널 (워크플로우 빌더 우측용)
 * BotPreview에서 챗봇 UI만 추출한 컴포넌트
 */
export function ChatPreviewPanel({ botName, language }: ChatPreviewPanelProps) {
  const translations = {
    en: {
      initialMessage: `Hello! 👋 Welcome to the AI Agent Web Platform support. How can I assist you today?`,
      botResponse:
        "I apologize, but I'm currently in preview mode and cannot process requests yet. Please connect the bot to a knowledge base to enable full functionality.",
      today: 'Today',
      delivered: 'Delivered',
      placeholder: 'Type your message...',
      quickMessages: [
        'How do I set up my first AI agent?',
        'Where can I find tutorials or guides?',
        "I'm having trouble with a feature",
      ],
    },
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
    },
  };

  const t = translations[language];

  const initialMessage: Message = {
    id: '1',
    type: 'bot',
    content: t.initialMessage,
    timestamp: new Date(),
  };

  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleResetChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        type: 'bot',
        content: t.initialMessage,
        timestamp: new Date(),
      },
    ]);
    setInputValue('');
    setIsTyping(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessageContent = inputValue;
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: userMessageContent,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // 실제 Chat API 호출
      const response = await chatApi.sendMessage(
        userMessageContent,
        undefined, // documentIds - 필요시 전달
        sessionId || undefined, // sessionId
        {
          max_tokens: 1000,
          temperature: 0.7,
        }
      );

      // 세션 ID 저장 (첫 응답 시)
      if (response.sessionId && !sessionId) {
        setSessionId(response.sessionId);
      }

      setIsTyping(false);

      // API 응답을 Message 형식으로 변환
      const botResponse: Message = {
        id: response.message.id,
        type: 'bot',
        content: response.message.content,
        timestamp: new Date(response.message.timestamp),
        sources: response.message.sources,
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      setIsTyping(false);
      console.error('Chat API error:', error);

      // 에러 메시지 구체화
      let errorText =
        language === 'ko'
          ? '죄송합니다. 응답을 처리하는 중 오류가 발생했습니다.'
          : 'Sorry, an error occurred while processing your response.';

      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });

        // 에러 타입별 메시지 커스터마이징
        if (error.message.includes('401') || error.message.includes('403')) {
          errorText =
            language === 'ko'
              ? '로그인이 필요합니다. 다시 로그인해주세요.'
              : 'Authentication required. Please log in again.';
        } else if (error.message.includes('404')) {
          errorText =
            language === 'ko'
              ? 'API 엔드포인트를 찾을 수 없습니다.'
              : 'API endpoint not found.';
        } else if (error.message.includes('500')) {
          errorText =
            language === 'ko'
              ? '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
              : 'Server error. Please try again later.';
        }
      }

      // 에러 시 폴백 응답
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: errorText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);

      // 사용자에게 에러 알림
      toast.error(errorText);
    }
  };

  const handleQuickMessage = async (msg: string) => {
    setInputValue('');

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: msg,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setIsTyping(true);

    try {
      // 실제 Chat API 호출
      const response = await chatApi.sendMessage(
        msg,
        undefined,
        sessionId || undefined,
        {
          max_tokens: 1000,
          temperature: 0.7,
        }
      );

      // 세션 ID 저장 (첫 응답 시)
      if (response.sessionId && !sessionId) {
        setSessionId(response.sessionId);
      }

      setIsTyping(false);

      const botResponse: Message = {
        id: response.message.id,
        type: 'bot',
        content: response.message.content,
        timestamp: new Date(response.message.timestamp),
        sources: response.message.sources,
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      setIsTyping(false);
      console.error('Chat API error:', error);

      // 에러 메시지 구체화
      let errorText =
        language === 'ko'
          ? '죄송합니다. 응답을 처리하는 중 오류가 발생했습니다.'
          : 'Sorry, an error occurred while processing your response.';

      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });

        // 에러 타입별 메시지 커스터마이징
        if (error.message.includes('401') || error.message.includes('403')) {
          errorText =
            language === 'ko'
              ? '로그인이 필요합니다. 다시 로그인해주세요.'
              : 'Authentication required. Please log in again.';
        } else if (error.message.includes('404')) {
          errorText =
            language === 'ko'
              ? 'API 엔드포인트를 찾을 수 없습니다.'
              : 'API endpoint not found.';
        } else if (error.message.includes('500')) {
          errorText =
            language === 'ko'
              ? '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
              : 'Server error. Please try again later.';
        }
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: errorText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);

      toast.error(errorText);
    }
  };

  const botInitial = botName.charAt(0).toUpperCase();

  return (
    <div className="h-full bg-gray-100 flex flex-col">
      {/* Chat Header */}
      <div className="bg-white text-gray-800 p-4 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-teal-400 rounded-full flex items-center justify-center">
            <span className="text-xs text-gray-900">{botInitial}</span>
          </div>
          <h3 className="text-sm">{botName}</h3>
        </div>
        <button
          onClick={handleResetChat}
          className="text-gray-500 hover:text-gray-800 transition-colors"
        >
          <RotateCw size={18} />
        </button>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 bg-gray-50 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Bot Avatar and Name */}
        <div className="flex flex-col items-center mb-6 mt-4">
          <div className="w-20 h-20 bg-teal-400 rounded-full flex items-center justify-center mb-3">
            <span className="text-2xl text-gray-900">{botInitial}</span>
          </div>
          <p className="text-gray-800 text-sm">{botName}</p>
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
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-start gap-2">
                  <div className="w-6 h-6 bg-teal-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs text-gray-900">{botInitial}</span>
                  </div>
                  <div className="max-w-[80%]">
                    <div className="bg-white text-gray-800 rounded-2xl px-4 py-2 border border-gray-200">
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                    {/* Sources Display */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-gray-500 px-2">
                          {language === 'ko' ? '출처:' : 'Sources:'}
                        </p>
                        {message.sources.map((source, idx) => (
                          <div
                            key={source.chunk_id}
                            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-gray-700 font-medium mb-1">
                                  {source.metadata?.filename ||
                                    (language === 'ko' ? `문서 ${idx + 1}` : `Document ${idx + 1}`)}
                                </p>
                                <p className="text-gray-600 line-clamp-2">
                                  {source.content}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 text-teal-500">
                                <span className="text-xs">
                                  {Math.round(source.similarity_score * 100)}%
                                </span>
                                <ExternalLink size={12} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {index === messages.length - 1 && message.type === 'user' && (
                <div className="text-right mt-1">
                  <span className="text-xs text-gray-500">{t.delivered}</span>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start gap-2">
              <div className="w-6 h-6 bg-teal-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-xs text-gray-900">{botInitial}</span>
              </div>
              <div className="bg-white text-gray-800 rounded-2xl px-4 py-3 flex gap-1 border border-gray-200">
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
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
                className="w-full text-left px-4 py-2.5 bg-transparent border border-teal-400 text-teal-400 rounded-2xl text-sm hover:bg-teal-400 hover:text-white transition-colors"
              >
                {msg}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                handleSendMessage();
              }
            }}
            placeholder={t.placeholder}
            className="flex-1 bg-transparent text-gray-800 text-sm outline-none placeholder-gray-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="text-teal-500 disabled:text-gray-400"
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
  );
}
