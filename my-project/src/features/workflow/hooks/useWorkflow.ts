import { useCallback, useEffect } from 'react';
import { useWorkflowStore } from '../stores/workflowStore';
import { workflowApi } from '../api/workflowApi';
import type { WorkflowData } from '@/shared/types/workflow.types';

/**
 * Workflow 커스텀 Hook
 *
 * 워크플로우 관련 비즈니스 로직 및 API 호출
 */
export function useWorkflow(workflowId?: string) {
  const {
    nodes,
    edges,
    workflowName,
    workflowDescription,
    isRunning,
    setNodes,
    setEdges,
    setWorkflowName,
    setWorkflowDescription,
    setIsRunning,
    reset,
  } = useWorkflowStore();

  /**
   * 워크플로우 불러오기
   */
  const loadWorkflow = useCallback(
    async (id: string) => {
      try {
        const workflow = await workflowApi.getById(id);
        setNodes(workflow.nodes);
        setEdges(workflow.edges);
        setWorkflowName(workflow.name);
        setWorkflowDescription(workflow.description || '');
      } catch (error) {
        console.error('Failed to load workflow:', error);
        throw error;
      }
    },
    [setNodes, setEdges, setWorkflowName, setWorkflowDescription]
  );

  /**
   * 워크플로우 저장
   */
  const saveWorkflow = useCallback(
    async (id?: string) => {
      try {
        const workflowData: Omit<
          WorkflowData,
          'id' | 'createdAt' | 'updatedAt'
        > = {
          name: workflowName || 'Untitled Workflow',
          description: workflowDescription,
          nodes,
          edges,
        };

        if (id) {
          // 기존 워크플로우 업데이트
          const updated = await workflowApi.update(id, workflowData);
          return updated;
        } else {
          // 새 워크플로우 생성
          const created = await workflowApi.create(workflowData);
          return created;
        }
      } catch (error) {
        console.error('Failed to save workflow:', error);
        throw error;
      }
    },
    [nodes, edges, workflowName, workflowDescription]
  );

  /**
   * 워크플로우 삭제
   */
  const deleteWorkflow = useCallback(
    async (id: string) => {
      try {
        await workflowApi.delete(id);
        reset();
      } catch (error) {
        console.error('Failed to delete workflow:', error);
        throw error;
      }
    },
    [reset]
  );

  /**
   * 워크플로우 실행
   */
  const executeWorkflow = useCallback(
    async (id: string, input?: Record<string, unknown>) => {
      try {
        setIsRunning(true);
        const result = await workflowApi.execute(id, input);
        return result;
      } catch (error) {
        console.error('Failed to execute workflow:', error);
        throw error;
      } finally {
        setIsRunning(false);
      }
    },
    [setIsRunning]
  );

  /**
   * 워크플로우 검증
   */
  const validateWorkflow = useCallback(async () => {
    try {
      const workflowData: Omit<WorkflowData, 'id' | 'createdAt' | 'updatedAt'> =
        {
          name: workflowName || 'Untitled Workflow',
          description: workflowDescription,
          nodes,
          edges,
        };

      const result = await workflowApi.validate(workflowData);
      return result;
    } catch (error) {
      console.error('Failed to validate workflow:', error);
      throw error;
    }
  }, [nodes, edges, workflowName, workflowDescription]);

  /**
   * 워크플로우 ID가 제공된 경우 자동으로 불러오기
   */
  useEffect(() => {
    if (workflowId) {
      loadWorkflow(workflowId);
    }
  }, [workflowId, loadWorkflow]);

  return {
    // 상태
    nodes,
    edges,
    workflowName,
    workflowDescription,
    isRunning,

    // Actions
    loadWorkflow,
    saveWorkflow,
    deleteWorkflow,
    executeWorkflow,
    validateWorkflow,
    reset,
  };
}
