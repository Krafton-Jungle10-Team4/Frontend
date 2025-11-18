import { useCallback, useEffect, useState } from 'react';
import { workflowApi } from '../api/workflowApi';
import type {
  WorkflowNodeExecution,
  WorkflowRunDetail,
} from '../types/log.types';

interface UseWorkflowLogDetailOptions {
  botId?: string | null;
  runId?: string | null;
  enabled?: boolean;
}

export function useWorkflowLogDetail({
  botId,
  runId,
  enabled = true,
}: UseWorkflowLogDetailOptions) {
  const [detail, setDetail] = useState<WorkflowRunDetail | null>(null);
  const [nodeExecutions, setNodeExecutions] = useState<
    WorkflowNodeExecution[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!botId || !runId || !enabled) {
      setDetail(null);
      setNodeExecutions([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [runDetail, nodes] = await Promise.all([
        workflowApi.getWorkflowRun(botId, runId),
        workflowApi.getWorkflowRunNodes(botId, runId),
      ]);
      setDetail(runDetail);
      setNodeExecutions(nodes);
    } catch (err) {
      console.error('Failed to load workflow log detail:', err);
      setError('상세 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [botId, enabled, runId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return {
    detail,
    nodeExecutions,
    isLoading,
    error,
    refetch: fetchDetail,
  };
}
