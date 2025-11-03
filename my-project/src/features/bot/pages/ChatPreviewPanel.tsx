import { useState, useRef, useEffect } from 'react';
import { RotateCw } from 'lucide-react';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
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
      botResponse: "I apologize, but I'm currently in preview mode and cannot process requests yet. Please connect the bot to a knowledge base to enable full functionality.",
      today: 'Today',
      delivered: 'Delivered',
      placeholder: 'Type your message...',
      quickMessages: [
        "How do I set up my first AI agent?",
        "Where can I find tutorials or guides?",
        "I'm having trouble with a feature"
      ],
    },
    ko: {
      initialMessage: `안녕하세요! 👋 AI 에이전트 웹 플랫폼 지원팀입니다. 무엇을 도와드릴까요?`,
      botResponse: '죄송합니다. 현재 미리보기 모드로 요청을 처리할 수 없습니다. 전체 기능을 사용하려면 챗봇을 지식 베이스에 연결해주세요.',
      today: '오늘',
      delivered: '전송됨',
      placeholder: '메시지를 입력하세요...',
      quickMessages: [
        "첫 번째 AI 에이전트는 어떻게 설정하나요?",
        "튜토리얼이나 가이드는 어디서 찾을 수 있나요?",
        "기능 사용에 문제가 있습니다"
      ],
    }
  };

  const t = translations[language];

  const initialMessage: Message = {
    id: '1',
    type: 'bot',
    content: t.initialMessage,
    timestamp: new Date()
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

  const handleResetChat = () => {
    setMessages([{
      id: Date.now().toString(),
      type: 'bot',
      content: t.initialMessage,
      timestamp: new Date()
    }]);
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
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsTyping(false);
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: t.botResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      
    } catch (error) {
      setIsTyping(false);
      console.error('Chat error:', error);
    }
  };

  const handleQuickMessage = async (msg: string) => {
    setInputValue('');
    
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: msg,
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    setIsTyping(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsTyping(false);
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: t.botResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      
    } catch (error) {
      setIsTyping(false);
      console.error('Chat error:', error);
    }
  };

  const botInitial = botName.charAt(0).toUpperCase();

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      {/* Chat Header */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-teal-400 rounded-full flex items-center justify-center">
            <span className="text-xs text-gray-900">{botInitial}</span>
          </div>
          <h3 className="text-sm">{botName}</h3>
        </div>
        <button onClick={handleResetChat} className="text-gray-400 hover:text-white transition-colors">
          <RotateCw size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-900 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
                    <span className="text-xs text-gray-900">{botInitial}</span>
                  </div>
                  <div className="bg-gray-700 text-white rounded-2xl px-4 py-2 max-w-[80%]">
                    <p className="text-sm">{message.content}</p>
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
              <div className="bg-gray-700 text-white rounded-2xl px-4 py-3 flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
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
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={t.placeholder}
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-500"
          />
          <button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="text-teal-400 disabled:text-gray-600"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 2L9 11M18 2L12 18L9 11M18 2L2 8L9 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
