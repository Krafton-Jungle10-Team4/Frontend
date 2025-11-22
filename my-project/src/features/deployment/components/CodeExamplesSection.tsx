import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/card';
import { CodeExamples } from './CodeExamples';
import { ApiKey } from '../types/deployment';

interface CodeExamplesSectionProps {
  botId: string;
  apiKeys: ApiKey[];
}

export function CodeExamplesSection({ botId, apiKeys }: CodeExamplesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">코드 예제</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          다양한 언어로 API를 호출하는 방법을 확인하세요.
        </p>
      </CardHeader>
      <CardContent>
        <CodeExamples
          botId={botId}
          apiKey={apiKeys[0]?.key_preview}
        />
      </CardContent>
    </Card>
  );
}
