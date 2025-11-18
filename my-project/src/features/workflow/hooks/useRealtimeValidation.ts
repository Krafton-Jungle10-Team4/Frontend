import { useEffect, useMemo } from 'react';
import { useWorkflowStore } from '../stores/workflowStore';
import { debounce } from 'lodash-es';

/**
 * 실시간 워크플로우 검증 훅
 *
 * 노드/엣지 변경 시 자동으로 검증 API를 호출하여
 * 워크플로우 구조의 유효성을 실시간으로 체크합니다.
 *
 * @param enabled - 검증 활성화 여부 (기본값: true)
 */
export const useRealtimeValidation = (enabled: boolean = true) => {
  const { nodes, edges, validateWorkflow } = useWorkflowStore();

  const debouncedValidate = useMemo(() => {
    return debounce(async () => {
      await validateWorkflow();
    }, 500);
  }, [validateWorkflow]);

  useEffect(() => {
    if (!enabled) return;

    debouncedValidate();

    return () => {
      debouncedValidate.cancel();
    };
    return () => {
      debouncedValidate.cancel();
    };
  }, [nodes, edges, enabled, debouncedValidate]);
};
