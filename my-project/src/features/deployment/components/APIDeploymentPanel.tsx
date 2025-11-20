import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/card';
import { Button } from '@shared/components/button';
import { Plus, ExternalLink } from 'lucide-react';
import { useApiKeyStore } from '../stores/apiKeyStore';
import { APIKeyList } from './APIKeyList';
import { CreateAPIKeyDialog } from './CreateAPIKeyDialog';
import { APIKeyCreatedDialog } from './APIKeyCreatedDialog';
import { CodeExamples } from './CodeExamples';
import { InlineTester } from './InlineTester';
import { PUBLIC_API_BASE_URL } from '@/shared/constants/apiEndpoints';

interface APIDeploymentPanelProps {
  botId: string;
}

export function APIDeploymentPanel({ botId }: APIDeploymentPanelProps) {
  const { apiKeys, isLoading, fetchApiKeys } = useApiKeyStore();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  useEffect(() => {
    fetchApiKeys(botId);
  }, [botId, fetchApiKeys]);

  return (
    <div className="space-y-6">
      {/* 1. API 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>API 엔드포인트</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Base URL</p>
            <code className="px-3 py-2 bg-muted rounded-md text-sm block">
              {PUBLIC_API_BASE_URL}
            </code>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">워크플로우 실행</p>
            <code className="px-3 py-2 bg-muted rounded-md text-sm block">
              POST {PUBLIC_API_BASE_URL}/workflows/run
            </code>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open('https://docs.snapagent.com/api', '_blank')
              }
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              API 문서 보기
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 2. API 키 관리 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>API 키</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              워크플로우를 외부 API로 실행하기 위한 키를 발급하세요.
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            새 API 키 생성
          </Button>
        </CardHeader>
        <CardContent>
          <APIKeyList botId={botId} keys={apiKeys} isLoading={isLoading} />
        </CardContent>
      </Card>

      {/* 3. 코드 예제 */}
      <Card>
        <CardHeader>
          <CardTitle>코드 예제</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            다양한 언어로 API를 호출하는 방법을 확인하세요.
          </p>
        </CardHeader>
        <CardContent>
          <CodeExamples
            botId={botId}
            apiKey={apiKeys[0]?.key_preview} // 첫 번째 키의 preview 사용 (실제로는 평문 키 필요)
          />
        </CardContent>
      </Card>

      {/* 4. Inline API 테스터 */}
      <Card>
        <CardHeader>
          <CardTitle>API 테스트</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            브라우저에서 직접 API를 테스트해보세요.
          </p>
        </CardHeader>
        <CardContent>
          <InlineTester
            botId={botId}
            apiKey={
              apiKeys.length > 0 ? 'USE_YOUR_ACTUAL_KEY' : undefined
            }
          />
          {apiKeys.length > 0 && (
            <div className="mt-4 p-3 rounded-md bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>참고:</strong> 테스트를 위해 생성한 API 키를 직접 입력하세요.
                보안을 위해 브라우저에 평문 키를 저장하지 않습니다.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 다이얼로그 */}
      <CreateAPIKeyDialog
        botId={botId}
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreated={(plainKey) => {
          setCreatedKey(plainKey);
          setShowCreateDialog(false);
        }}
      />

      <APIKeyCreatedDialog
        apiKey={createdKey}
        onClose={() => setCreatedKey(null)}
      />
    </div>
  );
}

