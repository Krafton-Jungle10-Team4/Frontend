import { useState } from 'react';
import { Button } from '@shared/components/button';
import { Textarea } from '@shared/components/textarea';
import { Label } from '@shared/components/label';
import { Loader2, Play } from 'lucide-react';
import { PUBLIC_API_BASE_URL } from '@/shared/constants/apiEndpoints';
import { Alert, AlertDescription } from '@shared/components/alert';

interface InlineTesterProps {
  botId: string;
  apiKey?: string;
}

export function InlineTester({ botId, apiKey }: InlineTesterProps) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    if (!apiKey) {
      alert('먼저 API 키를 생성하세요.');
      return;
    }

    if (!input.trim()) {
      alert('테스트 입력을 작성하세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/workflows/run`, {
        method: 'POST',
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: { user_query: input },
          response_mode: 'blocking',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail?.message ||
            errorData.detail ||
            `HTTP ${response.status}`
        );
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error('API 테스트 실패:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!apiKey && (
        <Alert>
          <AlertDescription>
            API 키를 생성한 후 테스트할 수 있습니다.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="test_input">입력</Label>
        <Textarea
          id="test_input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="예: 엔비디아 소식을 알고싶어"
          className=""
          rows={4}
          disabled={!apiKey || isLoading}
        />
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleTest}
          disabled={!apiKey || isLoading || !input.trim()}
          style={{ backgroundColor: '#2563eb', width: '33.33%' }}
          className="text-white hover:bg-[#1d4ed8] transition-all duration-200 hover:scale-[1.03]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              실행 중...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              실행
            </>
          )}
        </Button>
      </div>

      {/* 에러 표시 */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            <strong>에러:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {/* 결과 표시 */}
      {result && (
        <div className="space-y-2">
          <Label>응답 결과</Label>
          <div className="rounded-lg border bg-gray-50">
            <div className="p-4 space-y-3">
              {/* 상태 */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">상태</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    result.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : result.status === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {result.status}
                </span>
              </div>

              {/* 실행 시간 */}
              {result.elapsed_time && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">실행 시간</span>
                  <span className="text-sm text-muted-foreground">
                    {result.elapsed_time.toFixed(2)}초
                  </span>
                </div>
              )}

              {/* 토큰 사용량 */}
              {result.usage && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">토큰 사용량</span>
                  <span className="text-sm text-muted-foreground">
                    {result.usage.total_tokens} tokens
                  </span>
                </div>
              )}
            </div>

            {/* 출력 */}
            {result.outputs && (
              <div className="border-t p-4">
                <Label className="mb-2 block">출력</Label>
                <pre className="p-3 bg-gray-100 text-gray-800 rounded text-sm overflow-x-auto">
                  {JSON.stringify(result.outputs, null, 2)}
                </pre>
              </div>
            )}

            {/* 전체 응답 (디버깅용) */}
            <details className="border-t">
              <summary className="p-4 cursor-pointer text-sm font-medium hover:bg-gray-100">
                전체 응답 보기
              </summary>
              <div className="p-4 pt-0">
                <pre className="p-3 bg-gray-100 text-gray-800 rounded text-xs overflow-x-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}

