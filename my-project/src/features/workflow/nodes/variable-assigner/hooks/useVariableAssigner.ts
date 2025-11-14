import { useCallback } from 'react';
import { useVariableAssignerStore } from '../stores/variableAssignerStore';
import { useWorkflowStore } from '@features/workflow/stores/workflowStore';
import { generatePortSchema } from '../utils/portSchemaGenerator';
import type { ValueSelector, VarType } from '../types';

export function useVariableAssigner(nodeId: string) {
  const store = useVariableAssignerStore();
  const updateNode = useWorkflowStore((state) => state.updateNode);

  const nodeData = store.getNodeData(nodeId);
  const isGroupMode = nodeData?.advanced_settings.group_enabled ?? false;

  const syncNodeData = useCallback(() => {
    const latestData = useVariableAssignerStore.getState().nodeDataMap[nodeId];
    if (!latestData) return;
    updateNode(nodeId, {
      ...latestData,
      ports: generatePortSchema(latestData),
    });
  }, [nodeId, updateNode]);

  const handleAddVariable = useCallback(
    (variable: ValueSelector, varType: VarType, groupId?: string) => {
      if (groupId) {
        store.addVariableToGroup(nodeId, groupId, variable, varType);
      } else {
        store.addVariable(nodeId, variable, varType);
      }
      syncNodeData();
    },
    [nodeId, store, syncNodeData],
  );

  const handleRemoveVariable = useCallback(
    (variable: ValueSelector, groupId?: string) => {
      if (groupId) {
        store.removeVariableFromGroup(nodeId, groupId, variable);
      } else {
        store.removeVariable(nodeId, variable);
      }
      syncNodeData();
    },
    [nodeId, store, syncNodeData],
  );

  const handleSetOutputType = useCallback(
    (outputType: VarType) => {
      store.setOutputType(nodeId, outputType);
      syncNodeData();
    },
    [nodeId, store, syncNodeData],
  );

  const handleToggleGroupMode = useCallback(
    (enabled: boolean) => {
      store.toggleGroupMode(nodeId, enabled);
      syncNodeData();
    },
    [nodeId, store, syncNodeData],
  );

  const handleAddGroup = useCallback(() => {
    store.addGroup(nodeId);
    syncNodeData();
  }, [nodeId, store, syncNodeData]);

  const handleRemoveGroup = useCallback(
    (groupId: string) => {
      store.removeGroup(nodeId, groupId);
      syncNodeData();
    },
    [nodeId, store, syncNodeData],
  );

  const handleRenameGroup = useCallback(
    (groupId: string, newName: string) => {
      store.renameGroup(nodeId, groupId, newName);
      syncNodeData();
    },
    [nodeId, store, syncNodeData],
  );

  const handleSetGroupOutputType = useCallback(
    (groupId: string, outputType: VarType) => {
      store.setGroupOutputType(nodeId, groupId, outputType);
      syncNodeData();
    },
    [nodeId, store, syncNodeData],
  );

  return {
    nodeData,
    isGroupMode,
    handleAddVariable,
    handleRemoveVariable,
    handleSetOutputType,
    handleToggleGroupMode,
    handleAddGroup,
    handleRemoveGroup,
    handleRenameGroup,
    handleSetGroupOutputType,
  };
}
