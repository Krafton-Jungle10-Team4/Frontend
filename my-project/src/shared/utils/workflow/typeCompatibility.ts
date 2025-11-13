// src/shared/utils/workflow/typeCompatibility.ts

import { PortType } from '@shared/types/workflow/port.types';

/**
 * 타입 호환성 매트릭스
 *
 * sourceType -> targetType 연결 가능 여부
 */
const COMPATIBILITY_MATRIX: Record<PortType, Set<PortType>> = {
  [PortType.STRING]: new Set([PortType.STRING, PortType.ANY]),
  [PortType.NUMBER]: new Set([PortType.NUMBER, PortType.ANY]),
  [PortType.BOOLEAN]: new Set([PortType.BOOLEAN, PortType.ANY]),
  [PortType.ARRAY]: new Set([PortType.ARRAY, PortType.ANY]),
  [PortType.OBJECT]: new Set([PortType.OBJECT, PortType.ANY]),
  [PortType.FILE]: new Set([PortType.FILE, PortType.ANY]),
  [PortType.ANY]: new Set([
    PortType.STRING,
    PortType.NUMBER,
    PortType.BOOLEAN,
    PortType.ARRAY,
    PortType.OBJECT,
    PortType.FILE,
    PortType.ANY,
  ]),
};

/**
 * 두 포트 타입이 호환되는지 확인
 *
 * @param sourceType - 출력 포트 타입
 * @param targetType - 입력 포트 타입
 * @returns 연결 가능 여부
 */
export function areTypesCompatible(
  sourceType: PortType,
  targetType: PortType
): boolean {
  return COMPATIBILITY_MATRIX[sourceType]?.has(targetType) ?? false;
}

/**
 * 특정 타입과 호환 가능한 모든 타입 반환
 */
export function getCompatibleTypes(type: PortType): PortType[] {
  return Array.from(COMPATIBILITY_MATRIX[type] ?? []);
}

/**
 * 엣지 연결 가능 여부 검증
 */
export interface EdgeValidationResult {
  valid: boolean;
  error?: string;
}

export function validateEdgeConnection(
  sourcePortType: PortType,
  targetPortType: PortType,
  sourcePortName: string,
  targetPortName: string
): EdgeValidationResult {
  if (areTypesCompatible(sourcePortType, targetPortType)) {
    return { valid: true };
  }

  return {
    valid: false,
    error: `타입 불일치: '${sourcePortName}' (${sourcePortType}) → '${targetPortName}' (${targetPortType})`,
  };
}
