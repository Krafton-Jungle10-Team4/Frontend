import type { IfElseCase, IfElseCondition } from '@/shared/types/workflow.types';
import { NO_VALUE_OPERATORS } from './operators';

/**
 * 조건 검증
 */
export function validateCondition(condition: IfElseCondition): {
  valid: boolean;
  error?: string;
} {
  // 변수 선택 확인
  if (!condition.variable_selector) {
    return { valid: false, error: '변수를 선택해주세요' };
  }

  // 연산자 확인
  if (!condition.comparison_operator) {
    return { valid: false, error: '연산자를 선택해주세요' };
  }

  // 값이 필요한 연산자인 경우 값 확인
  if (!NO_VALUE_OPERATORS.includes(condition.comparison_operator)) {
    if (condition.value === undefined || condition.value === null || condition.value === '') {
      return { valid: false, error: '비교할 값을 입력해주세요' };
    }
  }

  return { valid: true };
}

/**
 * 케이스 검증
 */
export function validateCase(caseItem: IfElseCase): {
  valid: boolean;
  error?: string;
} {
  // 조건이 없으면 항상 true로 평가됨 (경고만 표시)
  if (caseItem.conditions.length === 0) {
    return { valid: true };
  }

  // 각 조건 검증
  for (const condition of caseItem.conditions) {
    const result = validateCondition(condition);
    if (!result.valid) {
      return result;
    }
  }

  return { valid: true };
}

/**
 * 전체 케이스 목록 검증
 */
export function validateCases(cases: IfElseCase[]): {
  valid: boolean;
  error?: string;
} {
  if (cases.length === 0) {
    return { valid: false, error: '최소 1개 이상의 케이스가 필요합니다' };
  }

  for (let i = 0; i < cases.length; i++) {
    const result = validateCase(cases[i]);
    if (!result.valid) {
      return {
        valid: false,
        error: `케이스 ${i + 1}: ${result.error}`,
      };
    }
  }

  return { valid: true };
}
