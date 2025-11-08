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
} from '../stores/deploymentStore';

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

  const handleCopyAndClose = async () => {
    if (embedScript) {
      try {
        await navigator.clipboard.writeText(embedScript);
        toast.success('코드가 복사되었습니다');
        closeDialog();
      } catch (error) {
        toast.error('코드 복사에 실패했습니다');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>웹사이트에 임베드하기</DialogTitle>
          <DialogDescription>
            다음 코드를 웹사이트의 <code>&lt;body&gt;</code> 태그 내에
            붙여넣으세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {embedScript ? (
            <>
              {/* 임베드 스크립트 표시 */}
              <EmbedCodeDisplay code={embedScript} language="html" />

              {/* 안내 메시지 */}
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  위젯이 웹사이트에 표시되지 않는다면, 허용 도메인 설정을
                  확인하세요.
                  {/* 향후 문서 링크 활성화 */}
                  {/* <a
                    href="/docs/embed"
                    className="underline ml-1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    자세한 설정 가이드
                  </a> */}
                </AlertDescription>
              </Alert>
            </>
          ) : (
            /* 배포가 없는 경우 */
            <Alert variant="destructive">
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                아직 배포되지 않았습니다. 먼저 "업데이트 게시"를 눌러 봇을
                배포하세요.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={closeDialog}>
            닫기
          </Button>
          {embedScript && (
            <Button onClick={handleCopyAndClose}>코드 복사 후 닫기</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
