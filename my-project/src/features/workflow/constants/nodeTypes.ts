import { BlockEnum } from '@/shared/types/workflow.types';
import type { NodeTypeResponse } from '../types/api.types';
import { VarType } from '../nodes/variable-assigner/types';

export const VARIABLE_ASSIGNER_ICON = 'variableAssigner';

export const VARIABLE_ASSIGNER_NODE_TYPE: NodeTypeResponse = {
  type: BlockEnum.Assigner,
  label: 'Variable Assigner',
  icon: VARIABLE_ASSIGNER_ICON,
  description: 'Collect and regroup variables from previous nodes',
  max_instances: -1,
  configurable: true,
  default_data: {
    output_type: VarType.ANY,
    variables: [],
    advanced_settings: {
      group_enabled: false,
      groups: [],
    },
  },
};

export const cloneVariableAssignerNodeType = (): NodeTypeResponse => ({
  ...VARIABLE_ASSIGNER_NODE_TYPE,
  default_data: {
    ...(VARIABLE_ASSIGNER_NODE_TYPE.default_data || {}),
    advanced_settings: {
      ...((VARIABLE_ASSIGNER_NODE_TYPE.default_data?.advanced_settings as Record<
        string,
        unknown
      >) || {}),
      groups: [],
    },
  },
});
