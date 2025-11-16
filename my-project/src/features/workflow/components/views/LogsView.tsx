import { memo, useEffect, useState } from 'react';
import { Card } from '@/shared/components/card';
import { Textarea } from '@/shared/components/textarea';
import { workflowApi } from '../../api/workflowApi';
import { useBotStore } from '@/features/bot/stores/botStore';
import type {
  WorkflowRunSummary,
  WorkflowNodeExecution,
} from '../../types/api.types';

/**
 * 로그 & 어노테이션 뷰
 */
const LogsView = () => {
  const botId = useBotStore((state) => state.selectedBotId);
  const [runs, setRuns] = useState<WorkflowRunSummary[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [nodeExecutions, setNodeExecutions] = useState<WorkflowNodeExecution[]>(
    []
  );
  const [annotation, setAnnotation] = useState('');
  const [loadingRuns, setLoadingRuns] = useState(false);
  const [loadingNodes, setLoadingNodes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!botId) {
      setRuns([]);
      setNodeExecutions([]);
      setSelectedRunId(null);
      return;
    }

    setLoadingRuns(true);
    workflowApi
      .listWorkflowRuns(botId, { limit: 20 })
      .then((response) => {
        const runsList = response?.runs || [];
        setRuns(runsList);
        if (runsList.length > 0) {
          setSelectedRunId(runsList[0].id);
        }
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to load workflow runs:', err);
        setError('실행 이력을 불러올 수 없습니다.');
        setRuns([]);
      })
      .finally(() => setLoadingRuns(false));
  }, [botId]);

  useEffect(() => {
    if (!botId || !selectedRunId) {
      setNodeExecutions([]);
      return;
    }

    setLoadingNodes(true);
    workflowApi
      .getWorkflowRunNodes(botId, selectedRunId)
      .then((nodes) => {
        setNodeExecutions(nodes);
      })
      .catch((err) => {
        console.error('Failed to load node executions:', err);
      })
      .finally(() => setLoadingNodes(false));
  }, [botId, selectedRunId]);

  return (
    <div className="h-full w-full overflow-auto bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            실행 로그 & 어노테이션
          </h1>
          <p className="text-gray-600">
            워크플로우 실행 기록을 살펴보고 문제를 빠르게 파악하세요.
          </p>
        </div>

        {!botId && (
          <div className="text-sm text-gray-500">
            봇을 선택하면 실행 로그를 확인할 수 있습니다.
          </div>
        )}

        {error && <div className="text-sm text-red-500">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 실행 목록 */}
          <div className="lg:col-span-2">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  최근 실행
                </h2>
                {loadingRuns && (
                  <span className="text-xs text-gray-500">불러오는 중...</span>
                )}
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {runs.map((run) => (
                  <div
                    key={run.id}
                    onClick={() => setSelectedRunId(run.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedRunId === run.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {run.id.slice(0, 8)}...
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(run.started_at).toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded ${
                          run.status === 'succeeded'
                            ? 'bg-green-100 text-green-700'
                            : run.status === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {run.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-600 flex gap-4">
                      <span>Tokens: {run.total_tokens ?? 0}</span>
                      <span>Time: {run.elapsed_time ?? 0}ms</span>
                    </div>
                  </div>
                ))}

                {runs.length === 0 && !loadingRuns && (
                  <div className="text-sm text-gray-500 text-center py-8">
                    실행 기록이 없습니다.
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* 노드 로그 & 어노테이션 */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                노드 실행 로그
              </h2>
              {loadingNodes ? (
                <div className="text-sm text-gray-500">노드 로그 불러오는 중...</div>
              ) : nodeExecutions.length > 0 ? (
                <div className="space-y-3 max-h-[360px] overflow-y-auto">
                  {nodeExecutions.map((exec) => (
                    <div
                      key={exec.id}
                      className="border rounded-lg p-3 bg-white shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-800">
                          {exec.node_id}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            exec.status === 'succeeded'
                              ? 'bg-green-100 text-green-700'
                              : exec.status === 'failed'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {exec.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        {exec.node_type} • {exec.elapsed_time ?? 0}ms •{' '}
                        {exec.tokens_used ?? 0} tokens
                      </p>
                      {exec.error_message && (
                        <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded p-2">
                          {exec.error_message}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  선택된 실행에 대한 노드 로그가 없습니다.
                </div>
              )}
            </Card>

            <Card className="p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                어노테이션
              </h2>
              <Textarea
                value={annotation}
                onChange={(e) => setAnnotation(e.target.value)}
                placeholder="이 실행에 대한 메모를 작성하세요..."
                className="min-h-[150px] resize-none"
              />
              <p className="text-xs text-gray-400 mt-2">
                주석은 로컬에만 저장됩니다.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(LogsView);
