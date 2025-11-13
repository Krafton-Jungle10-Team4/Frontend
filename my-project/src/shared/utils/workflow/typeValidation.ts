// src/shared/utils/workflow/typeValidation.ts

import { PortType, PortValue } from '@shared/types/workflow/port.types';

/**
 * 값의 런타임 타입 확인
 */
export function getValueType(value: unknown): PortType {
  if (value === null || value === undefined) {
    return PortType.ANY;
  }

  if (typeof value === 'string') {
    return PortType.STRING;
  }

  if (typeof value === 'number') {
    return PortType.NUMBER;
  }

  if (typeof value === 'boolean') {
    return PortType.BOOLEAN;
  }

  if (Array.isArray(value)) {
    return PortType.ARRAY;
  }

  if (value instanceof File) {
    return PortType.FILE;
  }

  if (typeof value === 'object') {
    return PortType.OBJECT;
  }

  return PortType.ANY;
}

/**
 * 값이 특정 타입과 일치하는지 확인
 */
export function isValueOfType(value: unknown, expectedType: PortType): boolean {
  const actualType = getValueType(value);

  // ANY는 모든 타입 허용
  if (expectedType === PortType.ANY) {
    return true;
  }

  return actualType === expectedType;
}

/**
 * 포트 정의 검증
 */
export function validatePortValue(
  value: unknown,
  portName: string,
  expectedType: PortType,
  required: boolean
): { valid: boolean; error?: string } {
  // 필수 체크
  if (required && (value === null || value === undefined)) {
    return {
      valid: false,
      error: `필수 포트 '${portName}'에 값이 제공되지 않았습니다.`,
    };
  }

  // null/undefined는 선택적 포트에서 허용
  if (value === null || value === undefined) {
    return { valid: true };
  }

  // 타입 체크
  if (!isValueOfType(value, expectedType)) {
    return {
      valid: false,
      error: `포트 '${portName}'의 타입이 일치하지 않습니다. 예상: ${expectedType}, 실제: ${getValueType(value)}`,
    };
  }

  return { valid: true };
}
