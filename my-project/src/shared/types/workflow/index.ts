// src/shared/types/workflow/index.ts

// Port Types
export {
  PortType,
  type PortDefinition,
  type NodePortSchema,
  type PortValue,
  type PortValues,
} from './port.types';

// Variable Types
export {
  type ValueSelector,
  type VariableMapping,
  type NodeVariableMappings,
  type VariableReference,
  type VariablePoolState,
} from './variable.types';

// Node Types
export {
  type WorkflowNodeV2,
  type WorkflowEdgeV2,
} from './node.types';
