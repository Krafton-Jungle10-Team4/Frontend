import { useEffect, useRef } from 'react';
import { useWorkflowStore } from '../stores/workflowStore';

const AUTOSAVE_INTERVAL = 30_000;

export function useWorkflowAutoSave(botId?: string) {
  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);
  const saveWorkflow = useWorkflowStore((state) => state.saveWorkflow);
  const isSaving = useWorkflowStore((state) => state.isSaving);
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

      saveWorkflow(botId).catch((error) => {
        console.error('Autosave failed:', error);
      });
      pendingSaveRef.current = false;
    }, AUTOSAVE_INTERVAL);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [botId, nodes, edges, saveWorkflow, isSaving]);
}
