import { useMemo } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/components/dialog';
import { Button } from '@shared/components/button';
import { Alert, AlertDescription } from '@shared/components/alert';
import { InfoIcon } from 'lucide-react';
import { EmbedCodeDisplay } from './EmbedCodeDisplay';
import {
  useDeploymentStore,
  selectIsEmbedDialogOpen,
  selectEmbedScript,
} from '../stores/deploymentStore.ts';

interface EmbedWebsiteDialogProps {
  botId?: string; // 현재는 사용하지 않지만 향후 확장 가능
}

/**
 * 웹사이트 임베드 모달
 * - API 응답의 embed_script 표시
 * - 코드 복사 기능
 * - 사용 가이드 링크
 */
export function EmbedWebsiteDialog({ botId: _botId }: EmbedWebsiteDialogProps) {
  const isOpen = useDeploymentStore(selectIsEmbedDialogOpen);
  const embedScript = useDeploymentStore(selectEmbedScript);
  const closeDialog = useDeploymentStore((state) => state.closeEmbedDialog);
  const formattedScript = useMemo(
    () => formatEmbedScript(embedScript),
    [embedScript]
  );

  const handleCopyAndClose = async () => {
    if (embedScript) {
      try {
        await navigator.clipboard.writeText(embedScript);
        toast.success('코드가 복사되었습니다');
        closeDialog();
      } catch (error) {
        console.error('코드 복사에 실패했습니다:', error);
        toast.error('코드 복사에 실패했습니다');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-4xl w-[90vw] max-w-[90vw] aspect-[16/9] max-h-[85vh] overflow-hidden p-0">
        <div className="flex h-full flex-col p-6 gap-4">
          <DialogHeader className="shrink-0">
            <DialogTitle>웹사이트에 임베드하기</DialogTitle>
            <DialogDescription>
              다음 코드를 웹사이트의 <code>&lt;head&gt;</code> 태그 내에
              붙여넣으세요.
            </DialogDescription>
          </DialogHeader>

          {embedScript ? (
            <>
              <div className="flex-1 overflow-y-auto">
                <EmbedCodeDisplay code={formattedScript} language="html" />
              </div>

              <Alert className="shrink-0 -mt-1">
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  위젯이 웹사이트에 표시되지 않는다면, 허용 도메인 설정을
                  확인하세요.
                </AlertDescription>
              </Alert>
            </>
          ) : (
            <div className="flex-1">
              <Alert variant="destructive" className="shrink-0">
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  아직 배포되지 않았습니다. 먼저 "업데이트 게시"를 눌러 서비스를
                  배포하세요.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter className="shrink-0">
            <Button variant="outline" onClick={closeDialog} className="hover:scale-[1.005] transition-transform">
              닫기
            </Button>
            {embedScript && (
              <Button onClick={handleCopyAndClose} className="bg-blue-600 hover:bg-blue-700 hover:scale-[1.005] transition-transform">코드 복사 후 닫기</Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatEmbedScript(script?: string | null): string {
  if (!script) {
    return '';
  }

  const trimmed = script.trim();

  // 이미 줄바꿈이 적용되어 있다면 그대로 반환
  if (trimmed.includes('\n')) {
    return trimmed;
  }

  const match = trimmed.match(/^<script\b([^>]*)>([\s\S]*?)<\/script>$/i);
  if (!match) {
    return trimmed;
  }

  const attributesString = match[1].trim();
  const attributes = attributesString.match(/[\w:-]+="[^"]*"/g);

  if (!attributes || attributes.length === 0) {
    return trimmed;
  }

  const formattedAttributes = attributes.map((attr) => `  ${attr}`);

  return `<script\n${formattedAttributes.join('\n')}\n></script>`;
}
