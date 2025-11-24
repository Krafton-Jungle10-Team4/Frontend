import { useMemo, useState, useRef, useEffect } from 'react';
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
import { Separator } from '@shared/components/separator';
import { InfoIcon, Eye } from 'lucide-react';
import { EmbedCodeDisplay } from './EmbedCodeDisplay';
import { WidgetCustomizer } from './WidgetCustomizer';
import {
  useDeploymentStore,
  selectIsEmbedDialogOpen,
  selectEmbedScript,
  selectWidgetConfig,
  selectWidgetKey,
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
  const widgetConfig = useDeploymentStore(selectWidgetConfig);
  const widgetKey = useDeploymentStore(selectWidgetKey);
  const closeDialog = useDeploymentStore((state) => state.closeEmbedDialog);
  const updateWidgetConfig = useDeploymentStore((state) => state.updateWidgetConfig);
  const [showPreview, setShowPreview] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const formattedScript = useMemo(
    () => formatEmbedScript(embedScript),
    [embedScript]
  );

  // widgetConfig 변경 시 iframe에 postMessage로 전송
  useEffect(() => {
    if (iframeRef.current?.contentWindow && widgetKey) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'UPDATE_WIDGET_CONFIG',
          config: widgetConfig,
        },
        '*'
      );
    }
  }, [widgetConfig, widgetKey]);

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
      <DialogContent className="!max-w-6xl w-[95vw] sm:!max-w-6xl max-h-[90vh] overflow-y-auto p-6">
        <div className="space-y-6">
          {/* 커스터마이저 */}
          <div>
            <DialogHeader className="mb-4">
              <DialogTitle>위젯 커스터마이징</DialogTitle>
              <DialogDescription>
                챗봇의 스타일과 동작을 설정하세요
              </DialogDescription>
            </DialogHeader>

            <WidgetCustomizer value={widgetConfig} onChange={updateWidgetConfig} />
          </div>

          <Separator />

          {/* 미리보기 및 코드 */}
          <div>
            <DialogHeader className="mb-4">
              <DialogTitle>미리보기 및 임베드 코드</DialogTitle>
              <DialogDescription>
                실시간 미리보기를 확인하고 코드를 복사하세요
              </DialogDescription>
            </DialogHeader>

            {embedScript ? (
              <div className="space-y-4">
                {/* 미리보기 토글 */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-900">미리보기</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {showPreview ? '미리보기 숨기기' : '미리보기 보기'}
                  </Button>
                </div>

                {/* 미리보기 영역 */}
                {showPreview && widgetKey && (
                  <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                    <div className="w-full h-[500px]">
                      <iframe
                        ref={iframeRef}
                        src={`/app/${widgetKey}?preview=true`}
                        className="w-full h-full"
                        title="Widget Preview"
                      />
                    </div>
                  </div>
                )}

                {/* 임베드 코드 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">임베드 코드</label>
                  <EmbedCodeDisplay code={formattedScript} language="html" />
                </div>

                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertDescription>
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
