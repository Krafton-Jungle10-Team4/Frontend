import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  vscDarkPlus,
  vs,
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@shared/components/button';

interface EmbedCodeDisplayProps {
  code: string;
  language?: 'html' | 'javascript' | 'typescript';
  onCopy?: () => void;
}

/**
 * 코드 표시 및 복사 컴포넌트
 * - Syntax highlighting
 * - 복사 버튼
 * - 복사 성공 피드백
 * - 다크/라이트 테마 지원
 */
export function EmbedCodeDisplay({
  code,
  language = 'html',
  onCopy,
}: EmbedCodeDisplayProps) {
  const { theme } = useTheme();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      toast.success('코드가 클립보드에 복사되었습니다');

      // onCopy 콜백 실행
      onCopy?.();

      // 2초 후 아이콘 원복
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      toast.error('코드 복사에 실패했습니다');
      console.error('Failed to copy code:', error);
    }
  };

  // 테마에 따라 스타일 선택
  const syntaxStyle = theme === 'dark' ? vscDarkPlus : vs;

  return (
    <div className="relative rounded-lg border bg-gray-100 overflow-hidden">
      {/* 헤더: 언어 표시 + 복사 버튼 */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-200">
        <span className="text-xs font-mono text-gray-600 uppercase">
          {language}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 gap-1.5 px-2 hover:scale-[1.005] transition-transform"
        >
          {isCopied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span className="text-xs">복사됨</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span className="text-xs">복사</span>
            </>
          )}
        </Button>
      </div>

      {/* 코드 블록 */}
      <div className="overflow-x-auto bg-gray-50">
        <SyntaxHighlighter
          language={language}
          style={syntaxStyle}
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            background: 'transparent',
          }}
          showLineNumbers={false}
          wrapLines={true}
          wrapLongLines={true}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
