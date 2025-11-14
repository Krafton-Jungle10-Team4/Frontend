/**
 * Variable Assigner 노드 Public API
 *
 * 이 파일은 Variable Assigner 노드의 공개 인터페이스를 정의합니다.
 * 외부 모듈에서 사용할 수 있는 타입과 함수를 export합니다.
 */

// Types
export * from './types';

// API
export { variableAssignerApi } from './api/variableAssignerApi';
export {
  valueSelectorToReference,
  referenceToValueSelector,
  toBackendFormat,
  fromBackendFormat,
} from './api/transformers';

// Store
export { useVariableAssignerStore } from './stores/variableAssignerStore';

// Hooks
export { useVariableAssigner } from './hooks/useVariableAssigner';
export { useVariableValidation } from './hooks/useVariableValidation';
export { useAvailableVariables } from './hooks/useAvailableVariables';

// Components
export { VariableAssignerNode } from './components/VariableAssignerNode';
export { VariableAssignerPanel } from './components/VariableAssignerPanel';
export { VarGroupItem } from './components/VarGroupItem';
export { VarList } from './components/VarList';
export { GroupHeaderInput } from './components/GroupHeaderInput';
export { AddVariableButton } from './components/AddVariableButton';
export { VariablePicker } from './components/VariablePicker';

// Utils
export { checkValid, createVarFilter } from './utils/validation';
export { generatePortSchema } from './utils/portSchemaGenerator';
export {
  generateNextGroupName,
  isDuplicateGroupName,
  validateGroupNameFormat,
} from './utils/groupHelpers';
