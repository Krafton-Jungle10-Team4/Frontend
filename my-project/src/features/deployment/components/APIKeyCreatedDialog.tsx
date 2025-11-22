import { Button } from '@shared/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@shared/components/dialog';
import { Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

interface APIKeyCreatedDialogProps {
  apiKey: string | null;
  onClose: () => void;
}

export function APIKeyCreatedDialog({
  apiKey,
  onClose,
}: APIKeyCreatedDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!apiKey) return;

    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('복사 실패:', error);
      alert('클립보드 복사에 실패했습니다.');
    }
  };

  return (
    <Dialog open={!!apiKey} onOpenChange={onClose}>
      <DialogContent className="sm:!max-w-[50%]">
        <DialogHeader>
          <DialogTitle>⚠️ API 키가 생성되었습니다</DialogTitle>
          <DialogDescription>
            이 키는 다시 표시되지 않습니다. 안전한 곳에 보관하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* API 키 표시 */}
          <div className="p-4 bg-muted rounded-md font-mono text-sm break-all">
            {apiKey}
          </div>

          {/* 버튼 */}
          <div className="flex gap-2">
            <Button
              onClick={handleCopy}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={copied}
            >
              {copied ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  복사됨!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  복사
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              확인
            </Button>
          </div>

          {/* 경고 메시지 */}
          <div className="rounded-md border border-blue-400 bg-blue-50 p-3">
            <p className="text-sm text-blue-900">
              <strong>중요:</strong> API 키는 생성 시 한 번만 표시됩니다.
              분실하면 새 키를 만들어야 합니다.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

