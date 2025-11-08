/**
 * ApiReferenceDialog
 * API 참조 다이얼로그
 *
 * 위젯 API 엔드포인트 및 사용 예제 제공
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@shared/components/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/components/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/components/card';
import { Badge } from '@shared/components/badge';
import { Button } from '@shared/components/button';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { EmbedCodeDisplay } from './EmbedCodeDisplay';
import {
  useDeploymentStore,
  selectWidgetKey,
  selectIsApiDialogOpen,
} from '../stores/deploymentStore';

interface ApiReferenceDialogProps {
  botId?: string; // 현재는 사용하지 않지만 향후 확장 가능
}

/**
 * API 참조 다이얼로그
 * - 위젯 API 엔드포인트 정보
 * - widget_key 복사
 * - 사용 예제 코드
 * - API 문서 링크
 */
export function ApiReferenceDialog({ botId: _botId }: ApiReferenceDialogProps) {
  const isOpen = useDeploymentStore(selectIsApiDialogOpen);
  const widgetKey = useDeploymentStore(selectWidgetKey);
  const closeDialog = useDeploymentStore((state) => state.closeApiDialog);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyWidgetKey = async () => {
    if (!widgetKey) {
      toast.error('Widget Key를 찾을 수 없습니다');
      return;
    }

    try {
      await navigator.clipboard.writeText(widgetKey);
      setIsCopied(true);
      toast.success('Widget Key가 복사되었습니다');

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      toast.error('복사에 실패했습니다');
      console.error('Failed to copy widget key:', error);
    }
  };

  const configExample = `// 위젯 설정 조회
fetch('https://api.snapagent.shop/api/v1/widget/config/${widgetKey || '{widget_key}'}', {
  method: 'GET',
  headers: {
    'Origin': 'https://your-domain.com'
  }
})
  .then(res => res.json())
  .then(data => {
    console.log('위젯 설정:', data.config);
  });`;

  const sessionExample = `// 세션 생성
fetch('https://api.snapagent.shop/api/v1/widget/sessions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Origin': 'https://your-domain.com'
  },
  body: JSON.stringify({
    widget_key: '${widgetKey || '{widget_key}'}',
    widget_signature: 'signature_from_config_response',
    user_info: {
      id: 'user_12345',
      name: '홍길동',
      email: 'user@example.com'
    },
    fingerprint: {
      user_agent: navigator.userAgent,
      screen_resolution: \`\${screen.width}x\${screen.height}\`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform
    },
    context: {
      page_url: window.location.href,
      page_title: document.title,
      referrer: document.referrer
    }
  })
})
  .then(res => res.json())
  .then(data => {
    console.log('세션 생성됨:', data.session_id);
    console.log('세션 토큰:', data.session_token);
  });`;

  const chatExample = `// 채팅 메시지 전송
fetch('https://api.snapagent.shop/api/v1/widget/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer {session_token}'
  },
  body: JSON.stringify({
    message: '안녕하세요, 도움이 필요해요',
    session_id: '{session_id}'
  })
})
  .then(res => res.json())
  .then(data => {
    console.log('AI 응답:', data.response);
    console.log('출처:', data.sources);
  });`;

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>API 참조</DialogTitle>
          <DialogDescription>
            챗봇 위젯 API 사용 방법 및 엔드포인트 정보
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Widget Key 섹션 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Widget Key</CardTitle>
              <CardDescription>
                위젯 인증에 사용되는 고유 키입니다. 공개되어도 안전합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono break-all">
                  {widgetKey || '배포를 먼저 생성해주세요'}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyWidgetKey}
                  disabled={!widgetKey}
                  className="shrink-0"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      복사됨
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      복사
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* API 엔드포인트 탭 */}
          <Tabs defaultValue="config" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="config">위젯 설정 조회</TabsTrigger>
              <TabsTrigger value="session">세션 생성</TabsTrigger>
              <TabsTrigger value="chat">채팅</TabsTrigger>
            </TabsList>

            {/* 위젯 설정 조회 */}
            <TabsContent value="config" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      GET
                    </Badge>
                    <code className="text-sm font-mono">
                      /api/v1/widget/config/{'{widget_key}'}
                    </code>
                  </div>
                  <CardDescription className="mt-2">
                    위젯 UI 설정 및 기능 정보를 조회합니다. 인증이 필요 없으며, Origin 헤더로 도메인을 검증합니다.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">요청 헤더</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• <code>Origin</code>: 요청하는 도메인 (자동 설정됨)</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">응답 필드</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• <code>config</code>: 위젯 설정 객체 (bot_id, UI 설정, 기능 플래그, API 엔드포인트)</li>
                      <li>• <code>signature</code>: 위젯 보안 서명 (세션 생성 시 필요)</li>
                      <li>• <code>expires_at</code>: 설정 만료 시간</li>
                      <li>• <code>nonce</code>: 재생 공격 방지용 난수</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">사용 예제</h4>
                    <EmbedCodeDisplay
                      code={configExample}
                      language="javascript"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 세션 생성 */}
            <TabsContent value="session" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      POST
                    </Badge>
                    <code className="text-sm font-mono">
                      /api/v1/widget/sessions
                    </code>
                  </div>
                  <CardDescription className="mt-2">
                    새로운 채팅 세션을 생성합니다. 세션 토큰을 받아 채팅 API에 사용합니다.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">요청 헤더</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• <code>Content-Type</code>: application/json</li>
                      <li>• <code>Origin</code>: 요청하는 도메인</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">요청 본문</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• <code>widget_key</code>: 위젯 인증 키 (필수)</li>
                      <li>• <code>widget_signature</code>: 위젯 설정 응답의 서명 (필수)</li>
                      <li>• <code>user_info</code>: 사용자 정보 (선택)</li>
                      <li>• <code>fingerprint</code>: 브라우저 지문 (필수)</li>
                      <li>• <code>context</code>: 페이지 컨텍스트 (필수)</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">응답 필드</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• <code>session_id</code>: 세션 고유 식별자</li>
                      <li>• <code>session_token</code>: 채팅 API 인증용 토큰</li>
                      <li>• <code>refresh_token</code>: 토큰 갱신용</li>
                      <li>• <code>expires_at</code>: 세션 만료 시간</li>
                      <li>• <code>ws_url</code>: WebSocket 연결 URL</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">사용 예제</h4>
                    <EmbedCodeDisplay
                      code={sessionExample}
                      language="javascript"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 채팅 */}
            <TabsContent value="chat" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      POST
                    </Badge>
                    <code className="text-sm font-mono">
                      /api/v1/widget/chat
                    </code>
                  </div>
                  <CardDescription className="mt-2">
                    채팅 메시지를 전송하고 AI 응답을 받습니다. 세션 토큰이 필요합니다.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">요청 헤더</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• <code>Content-Type</code>: application/json</li>
                      <li>• <code>Authorization</code>: Bearer {'{session_token}'}</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">요청 본문</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• <code>message</code>: 사용자 메시지 (필수)</li>
                      <li>• <code>session_id</code>: 세션 ID (필수)</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">응답 필드</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• <code>response</code>: AI 응답 텍스트</li>
                      <li>• <code>sources</code>: RAG 출처 정보 배열</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">사용 예제</h4>
                    <EmbedCodeDisplay
                      code={chatExample}
                      language="javascript"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* 추가 리소스 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">추가 리소스</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a
                href="http://localhost:8001/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Swagger UI (개발 환경)
              </a>
              <a
                href="http://localhost:8001/redoc"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                ReDoc (개발 환경)
              </a>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
