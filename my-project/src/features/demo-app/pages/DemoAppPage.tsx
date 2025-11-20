import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/card';
import { Button } from '@/shared/components/button';
import { Play, RotateCw } from 'lucide-react';
import { ApiConfigForm } from '../components/ApiConfigForm';
import { RequestBuilder } from '../components/RequestBuilder';
import { ResponseViewer } from '../components/ResponseViewer';
import { ExecutionHistory } from '../components/ExecutionHistory';
import { WorkflowTemplates } from '../components/WorkflowTemplates';
import { useDemoAppStore } from '../stores/demoAppStore';

export function DemoAppPage() {
  const {
    currentResponse,
    isExecuting,
    error,
    executeWorkflow,
    clearResponse,
  } = useDemoAppStore();

  const [showTemplates, setShowTemplates] = useState(false);

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="container mx-auto p-8 space-y-6">
        {/* 헤더 */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">API Demo App</h1>
            <p className="text-muted-foreground mt-2">
              워크플로우 API를 테스트하고 실행 결과를 확인하세요.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowTemplates(!showTemplates)}
            >
              템플릿 보기
            </Button>
            <Button
              onClick={executeWorkflow}
              disabled={isExecuting}
            >
              {isExecuting ? (
                <>
                  <RotateCw className="mr-2 h-4 w-4 animate-spin" />
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
        </div>

        {/* 템플릿 (조건부 표시) */}
        {showTemplates && (
          <WorkflowTemplates onClose={() => setShowTemplates(false)} />
        )}

        {/* 메인 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 좌측: API 설정 */}
          <div className="lg:col-span-1">
            <ApiConfigForm />
          </div>

          {/* 중앙: 요청 빌더 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>요청 설정</CardTitle>
              </CardHeader>
              <CardContent>
                <RequestBuilder />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 응답 뷰어 */}
        {(currentResponse || error) && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>실행 결과</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={clearResponse}
              >
                초기화
              </Button>
            </CardHeader>
            <CardContent>
              <ResponseViewer
                response={currentResponse}
                error={error}
              />
            </CardContent>
          </Card>
        )}

        {/* 실행 히스토리 */}
        <Card>
          <CardHeader>
            <CardTitle>실행 히스토리</CardTitle>
          </CardHeader>
          <CardContent>
            <ExecutionHistory />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

