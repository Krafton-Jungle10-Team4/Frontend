import { memo, useState } from 'react';
import { Card } from '@/shared/components/card';
import { Textarea } from '@/shared/components/textarea';

/**
 * 로그 & 어노테이션 뷰
 */
const LogsView = () => {
  const [selectedLog, setSelectedLog] = useState<number | null>(null);
  const [annotation, setAnnotation] = useState('');

  // 샘플 로그 데이터
  const logs = [
    {
      id: 1,
      timestamp: '2025-11-03 14:30:25',
      level: 'info',
      message: 'Workflow execution started',
      nodeId: 'start-1',
      nodeName: 'Start Node',
    },
    {
      id: 2,
      timestamp: '2025-11-03 14:30:26',
      level: 'info',
      message: 'Knowledge retrieval completed: Found 5 relevant documents',
      nodeId: 'kr-2',
      nodeName: 'Knowledge Retrieval',
    },
    {
      id: 3,
      timestamp: '2025-11-03 14:30:28',
      level: 'success',
      message: 'LLM response generated successfully',
      nodeId: 'llm-3',
      nodeName: 'LLM Node',
      tokens: 245,
    },
    {
      id: 4,
      timestamp: '2025-11-03 14:30:29',
      level: 'info',
      message: 'Workflow execution completed',
      nodeId: 'end-4',
      nodeName: 'End Node',
    },
    {
      id: 5,
      timestamp: '2025-11-03 14:25:12',
      level: 'error',
      message: 'API rate limit exceeded',
      nodeId: 'llm-3',
      nodeName: 'LLM Node',
      error: 'RateLimitError: Too many requests',
    },
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="h-full w-full overflow-auto bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            로그 & 어노테이션
          </h1>
          <p className="text-gray-600">워크플로우 실행 로그 및 메모 관리</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 로그 리스트 */}
          <div className="lg:col-span-2">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  실행 로그
                </h2>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                    필터
                  </button>
                  <button className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                    새로고침
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    onClick={() => setSelectedLog(log.id)}
                    className={`
                      p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${
                        selectedLog === log.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl mt-1">
                        {getLevelIcon(log.level)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`
                            px-2 py-0.5 text-xs font-semibold rounded border
                            ${getLevelColor(log.level)}
                          `}
                          >
                            {log.level.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {log.timestamp}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {log.message}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="px-2 py-0.5 bg-gray-100 rounded">
                            {log.nodeName}
                          </span>
                          {log.tokens && (
                            <span className="text-gray-500">
                              {log.tokens} tokens
                            </span>
                          )}
                        </div>
                        {log.error && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                            {log.error}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* 어노테이션 패널 */}
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                어노테이션
              </h2>

              {selectedLog ? (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-600 font-medium mb-1">
                      선택된 로그
                    </p>
                    <p className="text-sm text-gray-900">
                      {logs.find((l) => l.id === selectedLog)?.message}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      메모 작성
                    </label>
                    <Textarea
                      value={annotation}
                      onChange={(e) => setAnnotation(e.target.value)}
                      placeholder="이 로그에 대한 메모를 작성하세요..."
                      className="min-h-[120px] resize-none"
                    />
                  </div>

                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    메모 저장
                  </button>

                  {/* 기존 어노테이션 리스트 */}
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      저장된 메모
                    </h3>
                    <div className="space-y-2">
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">
                          2025-11-03 14:35
                        </p>
                        <p className="text-sm text-gray-700">
                          Rate limit 에러 발생. API 키 확인 필요
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="text-4xl mb-2 block">📝</span>
                  <p className="text-gray-600 text-sm">로그를 선택하면</p>
                  <p className="text-gray-600 text-sm">
                    메모를 작성할 수 있습니다
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* 통계 요약 */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            로그 통계
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">ℹ️</span>
                <div>
                  <p className="text-xs text-gray-600">Info</p>
                  <p className="text-xl font-bold text-gray-900">
                    {logs.filter((l) => l.level === 'info').length}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="text-xs text-gray-600">Success</p>
                  <p className="text-xl font-bold text-green-600">
                    {logs.filter((l) => l.level === 'success').length}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="text-xs text-gray-600">Warning</p>
                  <p className="text-xl font-bold text-yellow-600">
                    {logs.filter((l) => l.level === 'warning').length}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">❌</span>
                <div>
                  <p className="text-xs text-gray-600">Error</p>
                  <p className="text-xl font-bold text-red-600">
                    {logs.filter((l) => l.level === 'error').length}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default memo(LogsView);
