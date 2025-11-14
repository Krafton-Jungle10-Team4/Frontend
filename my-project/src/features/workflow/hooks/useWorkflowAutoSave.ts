import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useWorkflowStore } from '../stores/workflowStore';

const AUTOSAVE_INTERVAL = 30_000;

export function useWorkflowAutoSave(botId?: string) {
  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);
  const saveWorkflow = useWorkflowStore((state) => state.saveWorkflow);
  const setValidationErrors = useWorkflowStore((state) => state.setValidationErrors);
  const isSaving = useWorkflowStore((state) => state.isSaving);
  const validationErrors = useWorkflowStore((state) => state.validationErrors);
  const timerRef = useRef<number | null>(null);
  const pendingSaveRef = useRef(false);

  useEffect(() => {
    if (!botId) return;
    pendingSaveRef.current = true;

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      if (!botId || isSaving || !pendingSaveRef.current) {
        return;
      }

      saveWorkflow(botId)
        .then(() => {
          // 자동저장 성공 시 조용히 처리 (토스트 없음)
          pendingSaveRef.current = false;
        })
        .catch((error: any) => {
          console.error('Autosave failed:', error);

          // 검증 에러인 경우 상세 메시지 표시
          if (error.response?.status === 400) {
            const errorData = error.response?.data?.detail;

            // 검증 에러를 store에 설정하여 ValidationPanel에 표시
            if (errorData?.errors && Array.isArray(errorData.errors)) {
              const errors = errorData.errors.map((msg: string) => ({
                type: 'validation' as const,
                node_id: null,
                message: msg,
                severity: 'error' as const,
              }));
              const warnings =
                errorData.warnings?.map((msg: string) => ({
                  type: 'validation' as const,
                  node_id: null,
                  message: msg,
                  severity: 'warning' as const,
                })) || [];

              setValidationErrors(errors, warnings);

              // 첫 번째 에러를 토스트로 표시
              toast.error(`자동저장 실패: ${errorData.errors[0]}`, {
                description: 'ValidationPanel에서 모든 오류를 확인하고 수정 후 저장 버튼을 눌러주세요',
                duration: 10000,
              });
            } else {
              toast.error('자동저장 실패: 워크플로우 검증 실패', {
                description: '문제를 수정하고 저장 버튼을 눌러주세요',
                duration: 10000,
              });
            }
          } else {
            toast.error('자동저장 실패', {
              description: '워크플로우가 저장되지 않았습니다',
              duration: 10000,
            });
          }

          // 에러 시에도 pendingSave는 리셋 (다음 타이머에서 재시도)
          // 중요: 현재 그래프 상태를 유지 (loadWorkflow 호출하지 않음)
          pendingSaveRef.current = false;
        });
    }, AUTOSAVE_INTERVAL);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [botId, nodes, edges, saveWorkflow, setValidationErrors, isSaving, validationErrors]);
}
