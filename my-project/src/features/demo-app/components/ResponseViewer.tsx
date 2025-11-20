import { Alert, AlertDescription } from '@/shared/components/alert';
import { Button } from '@/shared/components/button';
import { Copy, CheckCircle, XCircle } from 'lucide-react';
import { WorkflowResponse } from '../types';
import { useState } from 'react';

interface ResponseViewerProps {
  response: WorkflowResponse | null;
  error: string | null;
}

export function ResponseViewer({ response, error }: ResponseViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!response) return null;

  return (
    <div className="space-y-4">
      {/* 상태 배지 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {response.status === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          <span className="font-semibold">
            {response.status === 'success' ? '성공' : '실패'}
          </span>
        </div>

        {response.elapsed_time && (
          <span className="text-sm text-muted-foreground">
            실행 시간: {response.elapsed_time}ms
          </span>
        )}

        {response.usage && (
          <span className="text-sm text-muted-foreground">
            토큰: {response.usage.total_tokens}
          </span>
        )}
      </div>

      {/* JSON 응답 */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          className="absolute top-2 right-2 z-10"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              복사됨
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              복사
            </>
          )}
        </Button>
        <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
          {JSON.stringify(response, null, 2)}
        </pre>
      </div>
    </div>
  );
}

