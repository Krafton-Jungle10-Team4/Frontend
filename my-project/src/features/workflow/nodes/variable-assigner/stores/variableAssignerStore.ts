import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  VariableAssignerNodeData,
  ValueSelector,
  VarType,
} from '../types';

interface VariableAssignerStore {
  nodeDataMap: Record<string, VariableAssignerNodeData>;

  initializeNode: (nodeId: string, data: VariableAssignerNodeData) => void;

  addVariable: (
    nodeId: string,
    variable: ValueSelector,
    varType: VarType,
  ) => void;

  removeVariable: (nodeId: string, variable: ValueSelector) => void;

  setOutputType: (nodeId: string, outputType: VarType) => void;

  toggleGroupMode: (nodeId: string, enabled: boolean) => void;

  addGroup: (nodeId: string) => void;

  removeGroup: (nodeId: string, groupId: string) => void;

  renameGroup: (nodeId: string, groupId: string, newName: string) => void;

  addVariableToGroup: (
    nodeId: string,
    groupId: string,
    variable: ValueSelector,
    varType: VarType,
  ) => void;

  removeVariableFromGroup: (
    nodeId: string,
    groupId: string,
    variable: ValueSelector,
  ) => void;

  setGroupOutputType: (
    nodeId: string,
    groupId: string,
    outputType: VarType,
  ) => void;

  getNodeData: (nodeId: string) => VariableAssignerNodeData | undefined;

  deleteNode: (nodeId: string) => void;
}

export const useVariableAssignerStore = create<VariableAssignerStore>()(
  immer((set, get) => ({
    nodeDataMap: {},

    initializeNode: (nodeId, data) => {
      set((draft) => {
        draft.nodeDataMap[nodeId] = data;
      });
    },

    addVariable: (nodeId, variable, varType) => {
      set((draft) => {
        const nodeData = draft.nodeDataMap[nodeId];
        if (!nodeData) return;

        const isDuplicate = nodeData.variables.some(
          (v) => v.join('.') === variable.join('.'),
        );
        if (isDuplicate) return;

        nodeData.variables.push(variable);

        if (nodeData.output_type === 'any') {
          nodeData.output_type = varType;
        }
      });
    },

    removeVariable: (nodeId, variable) => {
      set((draft) => {
        const nodeData = draft.nodeDataMap[nodeId];
        if (!nodeData) return;

        const varKey = variable.join('.');
        nodeData.variables = nodeData.variables.filter(
          (v) => v.join('.') !== varKey,
        );
      });
    },

    setOutputType: (nodeId, outputType) => {
      set((draft) => {
        const nodeData = draft.nodeDataMap[nodeId];
        if (nodeData) {
          nodeData.output_type = outputType;
        }
      });
    },

    toggleGroupMode: (nodeId, enabled) => {
      set((draft) => {
        const nodeData = draft.nodeDataMap[nodeId];
        if (!nodeData) return;

        if (enabled && nodeData.advanced_settings.groups.length === 0) {
          nodeData.advanced_settings.groups = [
            {
              groupId: crypto.randomUUID(),
              group_name: 'Group1',
              output_type: nodeData.output_type,
              variables: [...nodeData.variables],
            },
          ];
        } else if (!enabled && nodeData.advanced_settings.groups.length > 0) {
          const firstGroup = nodeData.advanced_settings.groups[0];
          nodeData.output_type = firstGroup.output_type;
          nodeData.variables = [...firstGroup.variables];
        }

        nodeData.advanced_settings.group_enabled = enabled;
      });
    },

    addGroup: (nodeId) => {
      set((draft) => {
        const nodeData = draft.nodeDataMap[nodeId];
        if (!nodeData) return;

        let maxNum = 1;
        nodeData.advanced_settings.groups.forEach((group) => {
          const match = /(\d+)$/.exec(group.group_name);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNum) maxNum = num;
          }
        });

        nodeData.advanced_settings.groups.push({
          groupId: crypto.randomUUID(),
          group_name: `Group${maxNum + 1}`,
          output_type: 'any',
          variables: [],
        });
      });
    },

    removeGroup: (nodeId, groupId) => {
      set((draft) => {
        const nodeData = draft.nodeDataMap[nodeId];
        if (!nodeData) return;

        nodeData.advanced_settings.groups =
          nodeData.advanced_settings.groups.filter((g) => g.groupId !== groupId);
      });
    },

    renameGroup: (nodeId, groupId, newName) => {
      set((draft) => {
        const nodeData = draft.nodeDataMap[nodeId];
        if (!nodeData) return;

        const group = nodeData.advanced_settings.groups.find(
          (g) => g.groupId === groupId,
        );
        if (group) {
          group.group_name = newName;
        }
      });
    },

    addVariableToGroup: (nodeId, groupId, variable, varType) => {
      set((draft) => {
        const nodeData = draft.nodeDataMap[nodeId];
        if (!nodeData) return;

        const group = nodeData.advanced_settings.groups.find(
          (g) => g.groupId === groupId,
        );
        if (!group) return;

        const isDuplicate = group.variables.some(
          (v) => v.join('.') === variable.join('.'),
        );
        if (isDuplicate) return;

        group.variables.push(variable);

        if (group.output_type === 'any') {
          group.output_type = varType;
        }
      });
    },

    removeVariableFromGroup: (nodeId, groupId, variable) => {
      set((draft) => {
        const nodeData = draft.nodeDataMap[nodeId];
        if (!nodeData) return;

        const group = nodeData.advanced_settings.groups.find(
          (g) => g.groupId === groupId,
        );
        if (!group) return;

        const varKey = variable.join('.');
        group.variables = group.variables.filter(
          (v) => v.join('.') !== varKey,
        );
      });
    },

    setGroupOutputType: (nodeId, groupId, outputType) => {
      set((draft) => {
        const nodeData = draft.nodeDataMap[nodeId];
        if (!nodeData) return;

        const group = nodeData.advanced_settings.groups.find(
          (g) => g.groupId === groupId,
        );
        if (group) {
          group.output_type = outputType;
        }
      });
    },

    getNodeData: (nodeId) => {
      return get().nodeDataMap[nodeId];
    },

    deleteNode: (nodeId) => {
      set((draft) => {
        delete draft.nodeDataMap[nodeId];
      });
    },
  })),
);
