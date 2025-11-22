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
        <TabsList className="grid w-full grid-cols-4 bg-transparent p-0 gap-2">
          <TabsTrigger value="curl" className="rounded-md transition-all duration-200 hover:scale-[1.05] data-[state=active]:bg-[#2563eb] data-[state=active]:text-white data-[state=active]:shadow-sm bg-gray-100">cURL</TabsTrigger>
          <TabsTrigger value="python" className="rounded-md transition-all duration-200 hover:scale-[1.05] data-[state=active]:bg-[#2563eb] data-[state=active]:text-white data-[state=active]:shadow-sm bg-gray-100">Python</TabsTrigger>
          <TabsTrigger value="javascript" className="rounded-md transition-all duration-200 hover:scale-[1.05] data-[state=active]:bg-[#2563eb] data-[state=active]:text-white data-[state=active]:shadow-sm bg-gray-100">JavaScript</TabsTrigger>
          <TabsTrigger value="typescript" className="rounded-md transition-all duration-200 hover:scale-[1.05] data-[state=active]:bg-[#2563eb] data-[state=active]:text-white data-[state=active]:shadow-sm bg-gray-100">TypeScript</TabsTrigger>
        </TabsList>

        {Object.entries(examples).map(([lang, code]) => (
          <TabsContent key={lang} value={lang} className="space-y-2">
            <div className="relative">
              <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                <pre className="overflow-x-auto text-[13px] leading-relaxed font-normal" style={{ fontFamily: "JetBrains Mono, Fira Code, SF Mono, Roboto Mono, Menlo, Monaco, Courier New, monospace" }}>
                  <code className="block">
                    {code.split('\n').map((line, index) => (
                      <div key={index} className="flex hover:bg-blue-50">
                        <span className="inline-block w-12 flex-shrink-0 text-right pr-4 select-none text-gray-400 bg-gray-50 border-r border-gray-200" style={{ userSelect: 'none' }}>
                          {index + 1}
                        </span>
                        <span className="inline-block px-4 text-gray-800 flex-1" style={{ letterSpacing: '-0.02em' }}>
                          {line || ' '}
                        </span>
                      </div>
                    ))}
                  </code>
                </pre>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 bg-white hover:bg-gray-100 border-gray-300 rounded-md transition-all duration-200 hover:scale-[1.03]"
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
        <div className="rounded-lg border border-blue-400 bg-gray-50 p-3">
          <p className="text-sm text-gray-700 flex items-center gap-2">
            <span>🔑</span>
            <span>API 키를 생성하면 실제 키가 예제 코드에 표시됩니다.</span>
          </p>
        </div>
      )}
    </div>
  );
}

