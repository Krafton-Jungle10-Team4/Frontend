/**
 * Assigner 노드 - 로컬 타입 정의
 *
 * 이 파일은 Assigner 노드 컴포넌트에서 사용하는 헬퍼 타입을 정의합니다.
 */

import { WriteMode } from '@/shared/types/workflow.types';
import type { AssignerInputType, AssignerOperation } from '@/shared/types/workflow.types';

/**
 * 작업 타입 레이블 맵
 */
export const WRITE_MODE_LABELS: Record<WriteMode, string> = {
  [WriteMode.OVERWRITE]: '덮어쓰기',
  [WriteMode.CLEAR]: '초기화',
  [WriteMode.SET]: '값 설정',
  [WriteMode.APPEND]: '요소 추가',
  [WriteMode.EXTEND]: '배열 확장',
  [WriteMode.REMOVE_FIRST]: '첫 요소 제거',
  [WriteMode.REMOVE_LAST]: '끝 요소 제거',
  [WriteMode.INCREMENT]: '증가 (+=)',
  [WriteMode.DECREMENT]: '감소 (-=)',
  [WriteMode.MULTIPLY]: '곱셈 (*=)',
  [WriteMode.DIVIDE]: '나눗셈 (/=)',
};

/**
 * 값 입력이 필요 없는 작업 타입
 */
export const NO_VALUE_MODES: WriteMode[] = [
  WriteMode.CLEAR,
  WriteMode.REMOVE_FIRST,
  WriteMode.REMOVE_LAST,
];

/**
 * 산술 작업 타입
 */
export const ARITHMETIC_MODES: WriteMode[] = [
  WriteMode.INCREMENT,
  WriteMode.DECREMENT,
  WriteMode.MULTIPLY,
  WriteMode.DIVIDE,
];

/**
 * 배열 작업 타입
 */
export const ARRAY_MODES: WriteMode[] = [
  WriteMode.APPEND,
  WriteMode.EXTEND,
  WriteMode.REMOVE_FIRST,
  WriteMode.REMOVE_LAST,
];

/**
 * 기본 작업 타입
 */
export const BASE_MODES: WriteMode[] = [
  WriteMode.OVERWRITE,
  WriteMode.CLEAR,
  WriteMode.SET,
];

/**
 * 작업이 값 입력을 필요로 하는지 확인
 */
export const needsValueInput = (writeMode: WriteMode): boolean => {
  return !NO_VALUE_MODES.includes(writeMode);
};

/**
 * 작업이 산술 연산인지 확인
 */
export const isArithmeticOperation = (writeMode: WriteMode): boolean => {
  return ARITHMETIC_MODES.includes(writeMode);
};

/**
 * 작업이 배열 작업인지 확인
 */
export const isArrayOperation = (writeMode: WriteMode): boolean => {
  return ARRAY_MODES.includes(writeMode);
};

/**
 * 타입에 따라 사용 가능한 작업 목록 반환
 */
export const getAvailableOperations = (targetType?: string): WriteMode[] => {
  if (!targetType || targetType === 'any') {
    return [...BASE_MODES, ...ARRAY_MODES, ...ARITHMETIC_MODES];
  }

  if (targetType.startsWith('array')) {
    return [...BASE_MODES, ...ARRAY_MODES];
  }

  if (targetType === 'number') {
    return [...BASE_MODES, ...ARITHMETIC_MODES];
  }

  return BASE_MODES;
};
