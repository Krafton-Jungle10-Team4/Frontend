import { useParams } from 'react-router-dom';
import { useStandaloneChat } from '../hooks/useStandaloneChat';
import { ChatHeader } from '../components/ChatHeader';
import { ChatMessageList } from '../components/ChatMessageList';
import { ChatInput } from '../components/ChatInput';
import { ChatSkeleton } from '../components/ChatSkeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@shared/components/alert';
import { Button } from '@shared/components/button';

export function StandaloneAppPage() {
  const { widgetKey } = useParams<{ widgetKey: string }>();
  const { loading, error, config, messages, sending, sendMessage, chatError } =
    useStandaloneChat(widgetKey);

  if (loading) {
    return <ChatSkeleton />;
  }

  if (error) {
    return (
      <div
        className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-background to-muted/30"
        role="alert"
        aria-live="assertive"
      >
        <div className="max-w-md w-full space-y-4 animate-in fade-in zoom-in-95 duration-300">
          <Alert variant="destructive" className="shadow-lg">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="text-lg font-semibold">
              챗봇을 불러올 수 없습니다
            </AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p className="text-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="mt-3 w-full sm:w-auto"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                다시 시도
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20"
      role="main"
      aria-label="챗봇 대화 페이지"
    >
      <ChatHeader config={config} />
      <ChatMessageList messages={messages} config={config} />
      {chatError && (
        <div className="px-4 sm:px-6 pb-2 animate-in slide-in-from-top-2 duration-300">
          <Alert variant="destructive" className="shadow-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{chatError}</AlertDescription>
          </Alert>
        </div>
      )}
      <ChatInput
        onSend={sendMessage}
        disabled={sending}
        placeholder={config?.config.placeholder_text || '메시지를 입력하세요...'}
      />
    </div>
  );
}
