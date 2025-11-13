import { useEffect } from 'react';
import { useVariablePoolStore } from '../stores/variablePoolStore';
import { useWorkflowStore } from '../stores/workflowStore';

/**
 * Hook to sync variable values during workflow execution
 * Automatically updates variable pool when execution events occur
 *
 * @example
 * ```tsx
 * function WorkflowCanvas() {
 *   useVariableValueUpdates(); // Sync execution state to variable pool
 *   // ...
 * }
 * ```
 */
export function useVariableValueUpdates() {
  const executionState = useWorkflowStore((state) => state.executionState);
  const setNodeOutput = useVariablePoolStore((state) => state.setNodeOutput);
  const clearAllOutputs = useVariablePoolStore((state) => state.clearAllOutputs);

  useEffect(() => {
    if (!executionState) return;

    // Clear all outputs when execution starts
    if (
      executionState.status === 'running' &&
      executionState.executedNodes.length === 0
    ) {
      clearAllOutputs();
    }

    // Update outputs for completed nodes
    if (executionState.nodeOutputs) {
      Object.entries(executionState.nodeOutputs).forEach(([nodeId, outputs]) => {
        Object.entries(outputs as Record<string, unknown>).forEach(
          ([portName, value]) => {
            setNodeOutput(nodeId, portName, value);
          }
        );
      });
    }
  }, [executionState, setNodeOutput, clearAllOutputs]);
}
