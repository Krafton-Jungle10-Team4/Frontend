import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/card';
import { InlineTester } from './InlineTester';
import { ApiKey } from '../types/deployment';

interface APITestSectionProps {
  botId: string;
  apiKeys: ApiKey[];
}

export function APITestSection({ botId, apiKeys }: APITestSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">API 테스트</CardTitle>
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
      </CardContent>
    </Card>
  );
}
