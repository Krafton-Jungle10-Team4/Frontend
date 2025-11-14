import { useVariableAssignerStore } from '../stores/variableAssignerStore';
import type { ValidationResult } from '../types';

export function useVariableValidation(nodeId: string): ValidationResult {
  const nodeData = useVariableAssignerStore((state) =>
    state.getNodeData(nodeId),
  );

  if (!nodeData) {
    return {
      isValid: false,
      errorMessage: 'Node data not found',
    };
  }

  const { variables, advanced_settings } = nodeData;
  const { group_enabled, groups } = advanced_settings;

  if (group_enabled) {
    if (!groups || groups.length === 0) {
      return {
        isValid: false,
        errorMessage: 'At least one group is required',
      };
    }

    for (const group of groups) {
      if (!group.variables || group.variables.length === 0) {
        return {
          isValid: false,
          errorMessage: `Group "${group.group_name}" has no variables`,
        };
      }
    }
  } else {
    if (!variables || variables.length === 0) {
      return {
        isValid: false,
        errorMessage: 'At least one variable is required',
      };
    }
  }

  return { isValid: true };
}
