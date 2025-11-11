import { useState, useRef, useEffect } from 'react';
import { RotateCw } from 'lucide-react';
import { sendMessageStream } from '@/features/chat/api/chatApi';
import { toast } from 'sonner';
import type { Source } from '@/shared/types/api.types';
import type { WorkflowNodeEvent } from '@/shared/types/streaming.types';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
  sources?: Source[];
}

interface ChatPreviewPanelProps {
  botId?: string;
  botName: string;
  language: 'en' | 'ko';
}

/**
 * 챗봇 프리뷰 패널 (워크플로우 빌더 우측용)
 * BotPreview에서 챗봇 UI만 추출한 컴포넌트
 */
export function ChatPreviewPanel({
  botId,
  botName,
  language,
}: ChatPreviewPanelProps) {
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
  const statusLabels = {
    running: language === 'ko' ? '진행 중' : 'Running',
    completed: language === 'ko' ? '완료' : 'Completed',
    failed: language === 'ko' ? '실패' : 'Failed',
    pending: language === 'ko' ? '대기' : 'Pending',
    skipped: language === 'ko' ? '건너뜀' : 'Skipped',
  } as const;
  const statusColors = {
    running: 'text-amber-500',
    completed: 'text-teal-600',
    failed: 'text-red-500',
    pending: 'text-gray-500',
    skipped: 'text-gray-400',
  } as const;

  const initialMessage: Message = {
    id: '1',
    type: 'bot',
    content: t.initialMessage,
    timestamp: new Date(),
  };

  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [_sessionId, setSessionId] = useState<string>('');
  const sessionIdRef = useRef<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [nodeEvents, setNodeEvents] = useState<WorkflowNodeEvent[]>([]);
  const typingBufferRef = useRef('');
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const ensureSessionId = () => {
    if (!sessionIdRef.current) {
      const generated = `session_${crypto.randomUUID()}`;
      sessionIdRef.current = generated;
      setSessionId(generated);
    }
    return sessionIdRef.current;
  };

  const stopTypingAnimation = () => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    typingBufferRef.current = '';
  };

  const enqueueTypingChunk = (chunk: string) => {
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

      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        const lastMsg = updated[lastIndex];
        if (lastMsg && lastMsg.type === 'bot') {
          updated[lastIndex] = {
            ...lastMsg,
            content: lastMsg.content + nextChar,
          };
        }
        return updated;
      });
    }, 12);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      stopTypingAnimation();
    };
  }, []);

  const handleResetChat = () => {
    stopTypingAnimation();
    setMessages([
      {
        id: Date.now().toString(),
        type: 'bot',
        content: t.initialMessage,
        timestamp: new Date(),
      },
    ]);
    setInputValue('');
    stopTypingAnimation();
    setIsTyping(false);
    setNodeEvents([]);
  };

  const handleNodeEventUpdate = (event: WorkflowNodeEvent) => {
    setNodeEvents((prev) => {
      const existingIndex = prev.findIndex((item) => item.node_id === event.node_id);
      if (existingIndex === -1) {
        return [...prev, event];
      }
      const updated = [...prev];
      updated[existingIndex] = event;
      return updated;
    });
  };

  const waitForTypingToFinish = () => {
    const poll = () => {
      if (!typingBufferRef.current.length && !typingIntervalRef.current) {
        setIsTyping(false);
        return;
      }
      requestAnimationFrame(poll);
    };
    poll();
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

    stopTypingAnimation();
    stopTypingAnimation();
    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');

    const assistantMessageId = `${Date.now()}_assistant`;
    const emptyAssistantMessage: Message = {
      id: assistantMessageId,
      type: 'bot',
      content: '',
      timestamp: new Date(),
      sources: [],
    };

    setMessages((prev) => [...prev, emptyAssistantMessage]);
    setIsTyping(true);

    try {
      if (!botId) {
        throw new Error(
          language === 'ko'
            ? '봇 ID가 없어 스트리밍을 시작할 수 없습니다.'
            : 'Cannot start streaming without a bot ID.'
        );
      }

      const activeSessionId = sessionIdRef.current || ensureSessionId();
      setNodeEvents([]);
      setNodeEvents([]);

      await sendMessageStream(userMessageContent, botId, {
        sessionId: activeSessionId,
        topK: 5,
        temperature: 0.7,
        maxTokens: 1000,
        includeSources: true,
        onChunk: (chunk) => {
          enqueueTypingChunk(chunk);
        },
        onSources: (sources: Source[]) => {
          setMessages((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            const lastMsg = updated[lastIndex];
            if (lastMsg && lastMsg.type === 'bot') {
              updated[lastIndex] = {
                ...lastMsg,
                sources,
              };
            }
            return updated;
          });
        },
        onComplete: () => waitForTypingToFinish(),
        onError: (error) => {
          setIsTyping(false);
          const errorText =
            language === 'ko'
              ? `죄송합니다. 오류가 발생했습니다: ${error.message}`
              : `Sorry, an error occurred: ${error.message}`;

          stopTypingAnimation();
          setMessages((prev) => {
            const updated = [...prev];
            const lastMsg = updated[updated.length - 1];
            if (lastMsg && lastMsg.type === 'bot' && !lastMsg.content) {
              updated[updated.length - 1] = {
                ...lastMsg,
                content: errorText,
              };
            }
            return updated;
          });

          toast.error(errorText);
        },
        onNodeEvent: handleNodeEventUpdate,
      });
    } catch (error) {
      stopTypingAnimation();
      waitForTypingToFinish();
      console.error('Chat error:', error);
      console.error('Chat error:', error);

      let errorText =
        language === 'ko'
          ? '죄송합니다. 응답을 처리하는 중 오류가 발생했습니다.'
          : 'Sorry, an error occurred while processing your response.';

      if (error instanceof Error) {
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

      setMessages((prev) => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg && lastMsg.type === 'bot') {
          updated[updated.length - 1] = {
            ...lastMsg,
            content: errorText,
          };
        }
        return updated;
      });

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

    setMessages((prev) => [...prev, newMessage]);

    const assistantMessageId = `${Date.now()}_assistant`;
    const emptyAssistantMessage: Message = {
      id: assistantMessageId,
      type: 'bot',
      content: '',
      timestamp: new Date(),
      sources: [],
    };

    setMessages((prev) => [...prev, emptyAssistantMessage]);
    setIsTyping(true);

    try {
      if (!botId) {
        throw new Error(
          language === 'ko'
            ? '봇 ID가 없어 스트리밍을 시작할 수 없습니다.'
            : 'Cannot start streaming without a bot ID.'
        );
      }

      const activeSessionId = sessionIdRef.current || ensureSessionId();

      await sendMessageStream(msg, botId, {
        sessionId: activeSessionId,
        topK: 5,
        temperature: 0.7,
        maxTokens: 1000,
        includeSources: true,
        onChunk: (chunk) => {
          enqueueTypingChunk(chunk);
        },
        onSources: (sources: Source[]) => {
          setMessages((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            const lastMsg = updated[lastIndex];
            if (lastMsg && lastMsg.type === 'bot') {
              updated[lastIndex] = {
                ...lastMsg,
                sources,
              };
            }
            return updated;
          });
        },
        onComplete: () => waitForTypingToFinish(),
        onError: (error) => {
          stopTypingAnimation();
          waitForTypingToFinish();
          const errorText =
            language === 'ko'
              ? `죄송합니다. 오류가 발생했습니다: ${error.message}`
              : `Sorry, an error occurred: ${error.message}`;

          setMessages((prev) => {
            const updated = [...prev];
            const lastMsg = updated[updated.length - 1];
            if (lastMsg && lastMsg.type === 'bot' && !lastMsg.content) {
              updated[updated.length - 1] = {
                ...lastMsg,
                content: errorText,
              };
            }
            return updated;
          });

          toast.error(errorText);
        },
        onNodeEvent: handleNodeEventUpdate,
      });
    } catch (error) {
      stopTypingAnimation();
      waitForTypingToFinish();
      console.error('Chat error:', error);

      let errorText =
        language === 'ko'
          ? '죄송합니다. 응답을 처리하는 중 오류가 발생했습니다.'
          : 'Sorry, an error occurred while processing your response.';

      if (error instanceof Error) {
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

      setMessages((prev) => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg && lastMsg.type === 'bot') {
          updated[updated.length - 1] = {
            ...lastMsg,
            content: errorText,
          };
        }
        return updated;
      });

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

        {nodeEvents.length > 0 && (
          <div className="mb-4 space-y-2">
            {nodeEvents.map((event) => {
              const statusColor =
                statusColors[event.status as keyof typeof statusColors] || 'text-gray-500';
              const statusLabel =
                statusLabels[event.status as keyof typeof statusLabels] || event.status;
              return (
                <div
                  key={event.node_id}
                  className="bg-white border border-gray-200 rounded-xl px-3 py-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">
                      {event.node_type} · {event.node_id}
                    </span>
                    <span className={`font-medium ${statusColor}`}>
                      {statusLabel}
                    </span>
                  </div>
                  {event.output_preview && (
                    <p className="text-xs text-gray-700 mt-1 whitespace-pre-wrap">
                      {event.output_preview}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

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
                            key={`${source.chunk_id}-${idx}`}
                            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-gray-700 font-medium mb-1">
                                  {language === 'ko'
                                    ? `출처 ${idx + 1}`
                                    : `Source ${idx + 1}`}
                                </p>
                                <p className="text-gray-600 line-clamp-2 whitespace-pre-wrap">
                                  {source.content.replace(/\*\*/g, '')}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 text-teal-500">
                                <span className="text-xs">
                                  {Math.round(source.similarity_score * 100)}%
                                </span>
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
