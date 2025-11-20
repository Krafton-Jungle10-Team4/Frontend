import { Button } from '@shared/components/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/components/tabs';
import { Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { PUBLIC_API_BASE_URL } from '@/shared/constants/apiEndpoints';

interface CodeExamplesProps {
  botId: string;
  apiKey?: string;
}

export function CodeExamples({ botId, apiKey }: CodeExamplesProps) {
  const [copiedLang, setCopiedLang] = useState<string | null>(null);

  const displayApiKey = apiKey || 'YOUR_API_KEY';

  const examples = {
    curl: `curl -X POST ${PUBLIC_API_BASE_URL}/workflows/run \\
  -H "X-API-Key: ${displayApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "inputs": {
      "user_query": "엔비디아 소식을 알고싶어"
    },
    "response_mode": "blocking"
  }'`,

    python: `import requests

response = requests.post(
    "${PUBLIC_API_BASE_URL}/workflows/run",
    headers={"X-API-Key": "${displayApiKey}"},
    json={
        "inputs": {"user_query": "엔비디아 소식을 알고싶어"},
        "response_mode": "blocking"
    }
)

result = response.json()
print(result['outputs'])`,

    javascript: `const response = await fetch('${PUBLIC_API_BASE_URL}/workflows/run', {
  method: 'POST',
  headers: {
    'X-API-Key': '${displayApiKey}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    inputs: { user_query: '엔비디아 소식을 알고싶어' },
    response_mode: 'blocking'
  })
});

const data = await response.json();
console.log(data.outputs);`,

    typescript: `interface WorkflowResponse {
  workflow_run_id: string;
  status: string;
  outputs: Record<string, any>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const response = await fetch('${PUBLIC_API_BASE_URL}/workflows/run', {
  method: 'POST',
  headers: {
    'X-API-Key': '${displayApiKey}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    inputs: { user_query: '엔비디아 소식을 알고싶어' },
    response_mode: 'blocking'
  })
});

const data: WorkflowResponse = await response.json();
console.log(data.outputs);`,
  };

  const handleCopy = async (lang: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedLang(lang);
      setTimeout(() => setCopiedLang(null), 2000);
    } catch (error) {
      console.error('복사 실패:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">API 호출 예제</h3>
      </div>

      <Tabs defaultValue="curl" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="curl">cURL</TabsTrigger>
          <TabsTrigger value="python">Python</TabsTrigger>
          <TabsTrigger value="javascript">JavaScript</TabsTrigger>
          <TabsTrigger value="typescript">TypeScript</TabsTrigger>
        </TabsList>

        {Object.entries(examples).map(([lang, code]) => (
          <TabsContent key={lang} value={lang} className="space-y-2">
            <div className="relative">
              <pre className="p-4 bg-muted rounded-md overflow-x-auto text-sm">
                <code>{code}</code>
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => handleCopy(lang, code)}
              >
                {copiedLang === lang ? (
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
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {!apiKey && (
        <div className="rounded-md border border-amber-500 bg-amber-50 dark:bg-amber-950 p-3">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            API 키를 생성하면 실제 키가 예제 코드에 표시됩니다.
          </p>
        </div>
      )}
    </div>
  );
}

