import { ComparisonOperator, VarType } from '@/shared/types/workflow.types';

/**
 * 변수 타입에 따른 사용 가능한 연산자 반환
 */
export function getOperatorsForType(varType: VarType): ComparisonOperator[] {
  switch (varType) {
    case VarType.STRING:
      return [
        ComparisonOperator.EQUAL,
        ComparisonOperator.NOT_EQUAL,
        ComparisonOperator.CONTAINS,
        ComparisonOperator.IS,
        ComparisonOperator.IS_NOT,
        ComparisonOperator.EMPTY,
        ComparisonOperator.NOT_EMPTY,
      ];

    case VarType.NUMBER:
      return [
        ComparisonOperator.EQUAL,
        ComparisonOperator.NOT_EQUAL,
        ComparisonOperator.GREATER_THAN,
        ComparisonOperator.LESS_THAN,
        ComparisonOperator.GREATER_EQUAL,
        ComparisonOperator.LESS_EQUAL,
        ComparisonOperator.EMPTY,
        ComparisonOperator.NOT_EMPTY,
      ];

    case VarType.BOOLEAN:
      return [ComparisonOperator.IS, ComparisonOperator.IS_NOT];

    default:
      return Object.values(ComparisonOperator);
  }
}

/**
 * 연산자 표시 이름
 */
export const OPERATOR_LABELS: Record<ComparisonOperator, string> = {
  [ComparisonOperator.EQUAL]: '같음 (=)',
  [ComparisonOperator.NOT_EQUAL]: '같지 않음 (≠)',
  [ComparisonOperator.GREATER_THAN]: '초과 (>)',
  [ComparisonOperator.LESS_THAN]: '미만 (<)',
  [ComparisonOperator.GREATER_EQUAL]: '이상 (≥)',
  [ComparisonOperator.LESS_EQUAL]: '이하 (≤)',
  [ComparisonOperator.CONTAINS]: '포함',
  [ComparisonOperator.IS]: '완전 일치',
  [ComparisonOperator.IS_NOT]: '일치하지 않음',
  [ComparisonOperator.EMPTY]: '비어있음',
  [ComparisonOperator.NOT_EMPTY]: '비어있지 않음',
};

/**
 * 값 입력이 필요하지 않은 연산자
 */
export const NO_VALUE_OPERATORS = [
  ComparisonOperator.EMPTY,
  ComparisonOperator.NOT_EMPTY,
];
