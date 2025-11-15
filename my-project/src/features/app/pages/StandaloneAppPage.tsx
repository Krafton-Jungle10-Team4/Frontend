import { useParams } from 'react-router-dom';
import { useStandaloneChat } from '../hooks/useStandaloneChat';
import { ChatHeader } from '../components/ChatHeader';
import { ChatMessageList } from '../components/ChatMessageList';
import { ChatInput } from '../components/ChatInput';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@shared/components/alert';

export function StandaloneAppPage() {
  const { widgetKey } = useParams<{ widgetKey: string }>();
  const { loading, error, config, messages, sending, sendMessage, chatError } =
    useStandaloneChat(widgetKey);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen p-4 bg-gray-50">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <ChatHeader config={config} />
      <ChatMessageList messages={messages} config={config} />
      {chatError && (
        <div className="px-6 pb-2">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{chatError}</AlertDescription>
          </Alert>
        </div>
      )}
      <ChatInput
        onSend={sendMessage}
        disabled={sending}
        placeholder={config?.config.placeholder_text}
      />
    </div>
  );
}
