import { useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@shared/components/dialog';
import { Button } from '@shared/components/button';
import { Alert, AlertDescription } from '@shared/components/alert';
import { Separator } from '@shared/components/separator';
import { InfoIcon } from 'lucide-react';
import { EmbedCodeDisplay } from './EmbedCodeDisplay';
import { WidgetCustomizer } from './WidgetCustomizer';
import {
  useDeploymentStore,
  selectIsEmbedDialogOpen,
  selectEmbedScript,
  selectWidgetConfig,
} from '../stores/deploymentStore.ts';
import { botApi } from '@/features/bot/api/botApi';

interface EmbedWebsiteDialogProps {
  botId?: string;
}

/**
 * 웹사이트 임베드 모달
 * - API 응답의 embed_script 표시
 * - 코드 복사 기능
 * - 사용 가이드 링크
 */
export function EmbedWebsiteDialog({ botId }: EmbedWebsiteDialogProps) {
  const isOpen = useDeploymentStore(selectIsEmbedDialogOpen);
  const embedScript = useDeploymentStore(selectEmbedScript);
  const widgetConfig = useDeploymentStore(selectWidgetConfig);
  const closeDialog = useDeploymentStore((state) => state.closeEmbedDialog);
  const updateWidgetConfig = useDeploymentStore((state) => state.updateWidgetConfig);

  useEffect(() => {
    if (isOpen && botId && (!widgetConfig.bot_name || widgetConfig.bot_name === '')) {
      botApi.getById(botId).then((bot) => {
        updateWidgetConfig({ bot_name: bot.name });
      }).catch((error) => {
        console.error('Failed to fetch bot info:', error);
      });
    }
  }, [isOpen, botId, widgetConfig.bot_name, updateWidgetConfig]);

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
      <DialogContent className="!max-w-3xl w-[50vw] sm:!max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <div className="space-y-6">
          {/* 커스터마이저 */}
          <div>
            <DialogHeader className="mb-4">
              <DialogTitle>임베드 위젯 배포</DialogTitle>
              <DialogDescription>
                챗봇의 스타일과 동작을 설정하세요
              </DialogDescription>
            </DialogHeader>

            <WidgetCustomizer value={widgetConfig} onChange={updateWidgetConfig} />
          </div>

          <Separator />

          {/* 임베드 코드 */}
          <div>
            <DialogHeader className="mb-4">
              <DialogTitle>임베드 코드</DialogTitle>
              <DialogDescription>
                코드를 복사하여 웹사이트에 붙여넣으세요
              </DialogDescription>
            </DialogHeader>

            {embedScript ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <EmbedCodeDisplay code={formattedScript} language="html" />
                </div>

                <Alert className="bg-blue-50 border-blue-300 text-blue-700">
                  <InfoIcon className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700">
                    위젯이 웹사이트에 표시되지 않는다면, 허용 도메인 설정을
                    확인하세요.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <Alert variant="destructive">
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  아직 배포되지 않았습니다. 먼저 "업데이트 게시"를 눌러 서비스를
                  배포하세요.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* 버튼 영역 */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={closeDialog} className="hover:scale-[1.005] transition-transform">
              닫기
            </Button>
            {embedScript && (
              <Button onClick={handleCopyAndClose} className="bg-blue-600 hover:bg-blue-700 hover:scale-[1.005] transition-transform">
                코드 복사 후 닫기
              </Button>
            )}
          </div>
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
