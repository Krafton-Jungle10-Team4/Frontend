import type {
  VariableAssignerNodeData,
  ValidationResult,
  VarType,
} from '../types'

/**
 * 노드 데이터 유효성 검증
 */
export function checkValid(
  data: VariableAssignerNodeData
): ValidationResult {
  const { variables, advanced_settings } = data
  const { group_enabled, groups } = advanced_settings

  if (group_enabled) {
    if (!groups || groups.length === 0) {
      return {
        isValid: false,
        errorMessage: 'At least one group is required',
      }
    }

    for (const group of groups) {
      if (!group.variables || group.variables.length === 0) {
        return {
          isValid: false,
          errorMessage: `Group "${group.group_name}" has no variables`,
        }
      }
    }
  } else {
    if (!variables || variables.length === 0) {
      return {
        isValid: false,
        errorMessage: 'At least one variable is required',
      }
    }
  }

  return { isValid: true }
}

/**
 * 변수 타입 필터 함수 생성
 */
export function createVarFilter(targetType: VarType) {
  return (varType: VarType): boolean => {
    if (targetType === 'any') return true
    if (varType === 'any') return true
    return varType === targetType
  }
}
