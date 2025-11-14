import { useCallback } from 'react';
import { useVariableAssignerStore } from '../stores/variableAssignerStore';
import type { ValueSelector, VarType } from '../types';

export function useVariableAssigner(nodeId: string) {
  const store = useVariableAssignerStore();

  const nodeData = store.getNodeData(nodeId);
  const isGroupMode = nodeData?.advanced_settings.group_enabled ?? false;

  const handleAddVariable = useCallback(
    (variable: ValueSelector, varType: VarType, groupId?: string) => {
      if (groupId) {
        store.addVariableToGroup(nodeId, groupId, variable, varType);
      } else {
        store.addVariable(nodeId, variable, varType);
      }
    },
    [nodeId, store],
  );

  const handleRemoveVariable = useCallback(
    (variable: ValueSelector, groupId?: string) => {
      if (groupId) {
        store.removeVariableFromGroup(nodeId, groupId, variable);
      } else {
        store.removeVariable(nodeId, variable);
      }
    },
    [nodeId, store],
  );

  const handleSetOutputType = useCallback(
    (outputType: VarType) => {
      store.setOutputType(nodeId, outputType);
    },
    [nodeId, store],
  );

  const handleToggleGroupMode = useCallback(
    (enabled: boolean) => {
      store.toggleGroupMode(nodeId, enabled);
    },
    [nodeId, store],
  );

  const handleAddGroup = useCallback(() => {
    store.addGroup(nodeId);
  }, [nodeId, store]);

  const handleRemoveGroup = useCallback(
    (groupId: string) => {
      store.removeGroup(nodeId, groupId);
    },
    [nodeId, store],
  );

  const handleRenameGroup = useCallback(
    (groupId: string, newName: string) => {
      store.renameGroup(nodeId, groupId, newName);
    },
    [nodeId, store],
  );

  const handleSetGroupOutputType = useCallback(
    (groupId: string, outputType: VarType) => {
      store.setGroupOutputType(nodeId, groupId, outputType);
    },
    [nodeId, store],
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
