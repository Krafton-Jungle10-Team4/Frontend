/**
 * WorkflowApiReferenceDialog
 * 워크플로우 API 참조 다이얼로그
 *
 * API 키와 코드 예제를 통합하여 제공
 * "배포 현황" 페이지의 "API 참조" 버튼 클릭 시 표시
 */

import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@shared/components/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/components/tabs';
import { Button } from '@shared/components/button';
import { Copy, Check, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PUBLIC_API_BASE_URL } from '@/shared/constants/apiEndpoints';
import { ApiKey } from '../types/deployment';
import { CreateAPIKeyDialog } from './CreateAPIKeyDialog';

interface CodeEditorProps {
  code: string;
  language: string;
  onCopy: (text: string) => void;
  isCopied: boolean;
}

function CodeEditor({ code, language: _language, onCopy, isCopied }: CodeEditorProps) {
  const [editedCode, setEditedCode] = useState(code);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditedCode(code);
  }, [code]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedCode(e.target.value);
  };

  const lineCount = editedCode.split('\n').length;

  return (
    <div className="relative">
      <div className="bg-gray-50 border border-gray-300 rounded-lg overflow-hidden">
        <textarea
          ref={textareaRef}
          value={editedCode}
          onChange={handleTextareaChange}
          rows={lineCount}
          className="w-full p-4 text-[13px] leading-relaxed font-normal resize-none bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{
            fontFamily:
              'JetBrains Mono, Fira Code, SF Mono, Roboto Mono, Menlo, Monaco, Courier New, monospace',
            letterSpacing: '-0.02em',
            tabSize: 2,
          }}
          spellCheck={false}
        />
      </div>
      <div className="absolute top-2 right-2 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-white hover:bg-gray-100 border-gray-300 rounded-md transition-all duration-200 hover:scale-[1.03]"
          onClick={() => onCopy(editedCode)}
        >
          {isCopied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
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
    </div>
  );
}

interface WorkflowApiReferenceDialogProps {
  open: boolean;
  onClose: () => void;
  botId: string;
  apiKeys: ApiKey[];
  plaintextApiKey?: string | null;
}

/**
 * 워크플로우 API 참조 다이얼로그
 * - API 키 정보 표시 및 복사
 * - 4가지 언어별 코드 예제 (cURL, Python, JavaScript, TypeScript)
 * - 코드 예제에 API 키 자동 하드코딩
 */
export function WorkflowApiReferenceDialog({
  open,
  onClose,
  botId,
  apiKeys,
  plaintextApiKey,
}: WorkflowApiReferenceDialogProps) {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'curl' | 'python' | 'javascript' | 'typescript'>('curl');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [generatedApiKey, setGeneratedApiKey] = useState<string | null>(null);

  // 활성화된 API 키 찾기
  const activeApiKey = apiKeys.find((key) => key.is_active);
  const displayApiKey = generatedApiKey || plaintextApiKey || activeApiKey?.masked_key || 'sk-proj-xxxxxxxxxx';
  const hasRealApiKey = Boolean(generatedApiKey || plaintextApiKey || activeApiKey);

  // 복사 핸들러
  const handleCopy = async (text: string, itemName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemName);
      toast.success('복사되었습니다', {
        description: '예시 코드를 성공적으로 복사했습니다.',
        className: 'toast-success-green',
        style: {
          border: '1px solid #10B981',
          backgroundColor: '#F7FEF9',
        },
      });

      setTimeout(() => {
        setCopiedItem(null);
      }, 2000);
    } catch (error) {
      toast.error('복사에 실패했습니다');
      console.error('Failed to copy:', error);
    }
  };

  // 코드 예제 생성
  const codeExamples = {
    curl: `curl -X POST ${PUBLIC_API_BASE_URL}/workflows/run \\
  -H "X-API-Key: ${displayApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "inputs": {
      "query": ""
    },
    "response_mode": "blocking"
  }'`,

    python: `import requests

response = requests.post(
    "${PUBLIC_API_BASE_URL}/workflows/run",
    headers={"X-API-Key": "${displayApiKey}"},
    json={
        "inputs": {"query": ""},
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
    inputs: { query: '' },
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
    inputs: { query: '' },
    response_mode: 'blocking'
  })
});

const data: WorkflowResponse = await response.json();
console.log(data.outputs);`,
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-[90vw] sm:w-[80vw] sm:max-w-[80vw] lg:w-[70vw] lg:max-w-[70vw] xl:w-[60vw] xl:max-w-[60vw] max-h-[90vh] flex flex-col p-0">
        {/* 헤더 */}
        <div className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogHeader>
            <DialogTitle>API 참조 배포</DialogTitle>
            <DialogDescription>
              API 키를 생성하고 코드에서 다양하게 활용해보세요
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* API 키 섹션 */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold">API 키</h3>
                <p className="text-sm text-muted-foreground">
                  {generatedApiKey
                    ? '방금 생성된 API 키입니다 (전체 키가 표시됩니다)'
                    : plaintextApiKey
                    ? '방금 생성된 API 키입니다 (전체 키가 표시됩니다)'
                    : hasRealApiKey
                    ? '워크플로우를 실행하기 위한 인증 키입니다'
                    : 'API 키를 생성해주세요'}
                </p>
              </div>
              <Button
                onClick={() => setShowCreateDialog(true)}
                size="default"
                className="relative overflow-hidden text-white transition-all duration-200 hover:scale-[1.03] shrink-0 border-0"
                style={{
                  backgroundColor: '#2563eb',
                }}
                onMouseEnter={(e) => {
                  const overlay = e.currentTarget.querySelector('.gradient-overlay') as HTMLElement;
                  if (overlay) {
                    overlay.style.transform = 'translateX(0)';
                  }
                }}
                onMouseLeave={(e) => {
                  const overlay = e.currentTarget.querySelector('.gradient-overlay') as HTMLElement;
                  if (overlay) {
                    overlay.style.transform = 'translateX(-100%)';
                  }
                }}
              >
                <div
                  className="gradient-overlay absolute inset-0"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #000000 0%, #2563eb 100%)',
                    transform: 'translateX(-100%)',
                    transition: 'transform 0.5s ease-out',
                  }}
                />
                <span className="relative z-10 flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  새 API 키 생성
                </span>
              </Button>
            </div>
            <div>
              {!hasRealApiKey ? (
                <div className="rounded-lg border border-yellow-400 bg-yellow-50 p-4">
                  <p className="text-sm text-gray-700 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>
                      활성화된 API 키가 없습니다. "새 API 키 생성" 버튼을 클릭하여 API 키를 생성하세요.
                    </span>
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-gray-100 rounded-md text-xs font-mono break-all text-gray-700">
                      {displayApiKey}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(displayApiKey, 'api-key')}
                      className="shrink-0"
                    >
                      {copiedItem === 'api-key' ? (
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

                  {(generatedApiKey || plaintextApiKey) && (
                    <div className="mt-3 rounded-lg border border-green-400 bg-green-50 p-3">
                      <p className="text-sm text-gray-700 flex items-center gap-2">
                        <span>✅</span>
                        <span>
                          전체 API 키가 표시됩니다. 이 키는 다시 확인할 수 없으니 안전한 곳에 보관하세요.
                        </span>
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* 코드 예제 섹션 */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold">코드 예제</h3>
              <p className="text-sm text-muted-foreground mt-1">
                다양한 언어로 API를 호출하는 방법을 확인하세요
              </p>
            </div>
            <div className="space-y-4">
              <Tabs value={selectedLanguage} onValueChange={(val) => setSelectedLanguage(val as any)} className="w-full">
                <TabsList className="inline-flex h-auto bg-transparent p-0 gap-1">
                  <TabsTrigger
                    value="curl"
                    className="rounded-md px-4 py-2 transition-all duration-200 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=inactive]:text-gray-600 hover:text-gray-900"
                  >
                    cURL
                  </TabsTrigger>
                  <TabsTrigger
                    value="python"
                    className="rounded-md px-4 py-2 transition-all duration-200 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=inactive]:text-gray-600 hover:text-gray-900"
                  >
                    Python
                  </TabsTrigger>
                  <TabsTrigger
                    value="javascript"
                    className="rounded-md px-4 py-2 transition-all duration-200 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=inactive]:text-gray-600 hover:text-gray-900"
                  >
                    JavaScript
                  </TabsTrigger>
                  <TabsTrigger
                    value="typescript"
                    className="rounded-md px-4 py-2 transition-all duration-200 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=inactive]:text-gray-600 hover:text-gray-900"
                  >
                    TypeScript
                  </TabsTrigger>
                </TabsList>

                {Object.entries(codeExamples).map(([lang, code]) => (
                  <TabsContent key={lang} value={lang} className="space-y-2 mt-4">
                    <CodeEditor
                      code={code}
                      language={lang}
                      onCopy={(text) => handleCopy(text, `code-${lang}`)}
                      isCopied={copiedItem === `code-${lang}`}
                    />
                  </TabsContent>
                ))}
              </Tabs>

              {(generatedApiKey || plaintextApiKey) ? (
                <div className="rounded-lg border border-blue-400 bg-blue-50 p-3">
                  <p className="text-sm text-gray-700 flex items-center gap-2">
                    <span>✅</span>
                    <span>
                      <strong>전체 API 키</strong>가 코드 예제에 자동으로 포함되었습니다. 복사 후 바로 사용하실 수 있습니다.
                    </span>
                  </p>
                </div>
              ) : hasRealApiKey ? (
                <div className="rounded-lg border border-yellow-400 bg-yellow-50 p-3">
                  <p className="text-sm text-gray-700 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>
                      마스킹된 API 키가 표시됩니다. 전체 키를 보려면 위의 "새 API 키 생성" 버튼을 클릭하세요.
                    </span>
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          {/* 워크플로우 실행 엔드포인트 정보 */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold">워크플로우 실행</h3>
              <p className="text-sm text-muted-foreground mt-1">
                POST {PUBLIC_API_BASE_URL}/workflows/run
              </p>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold mb-2">요청 헤더</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <code>X-API-Key</code>: API 인증 키 (필수)</li>
                  <li>• <code>Content-Type</code>: application/json</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">요청 본문</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <code>inputs</code>: 워크플로우 입력 변수 (필수)</li>
                  <li>• <code>response_mode</code>: "blocking" (동기) 또는 "streaming" (스트리밍)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">응답 필드</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <code>workflow_run_id</code>: 실행 고유 ID</li>
                  <li>• <code>status</code>: 실행 상태</li>
                  <li>• <code>outputs</code>: 워크플로우 출력 결과</li>
                  <li>• <code>usage</code>: 토큰 사용량 정보</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Rate Limit 정보 */}
          {hasRealApiKey && activeApiKey && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold">Rate Limit</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  현재 API 키의 사용 제한
                </p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">분당 요청 제한:</span>
                  <span className="font-medium">{activeApiKey.rate_limit || 60}/분</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">시간당 요청 제한:</span>
                  <span className="font-medium">{(activeApiKey.rate_limit || 60) * 60}/시간</span>
                </div>
                {activeApiKey.usage_summary?.last_used_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">마지막 사용:</span>
                    <span className="font-medium">
                      {new Date(activeApiKey.usage_summary.last_used_at).toLocaleString('ko-KR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 border-t shrink-0 bg-muted/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              💡 복사 후 붙여넣기만 하면 바로 사용할 수 있습니다
            </p>
            <Button variant="outline" onClick={onClose}>
              닫기
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* API 키 생성 다이얼로그 */}
      <CreateAPIKeyDialog
        botId={botId}
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreated={(plainKey) => {
          setGeneratedApiKey(plainKey);
          setShowCreateDialog(false);
          toast.success('API 키가 생성되었습니다', {
            description: 'API 키가 코드 예제에 자동으로 반영되었습니다.',
            className: 'toast-success-green',
            style: {
              border: '1px solid #10B981',
              backgroundColor: '#F7FEF9',
            },
          });
        }}
      />
    </Dialog>
  );
}
