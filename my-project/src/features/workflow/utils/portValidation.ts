// src/features/workflow/utils/portValidation.ts

import type { PortDefinition } from '@shared/types/workflow';
import { PortType } from '@shared/types/workflow';
import { areTypesCompatible } from '@shared/utils/workflow/typeCompatibility';

/**
 * 포트 연결 검증 결과
 */
export interface PortConnectionValidation {
  valid: boolean;
  error?: string;
  warning?: string;
}

/**
 * 두 포트가 연결 가능한지 검증
 *
 * @param sourcePort - 출력 포트
 * @param targetPort - 입력 포트
 * @returns 검증 결과
 */
export function validatePortConnection(
  sourcePort: PortDefinition,
  targetPort: PortDefinition
): PortConnectionValidation {
  // 1. 타입 호환성 검사
  if (!areTypesCompatible(sourcePort.type, targetPort.type)) {
    return {
      valid: false,
      error: `타입 불일치: ${sourcePort.display_name} (${sourcePort.type}) → ${targetPort.display_name} (${targetPort.type})`,
    };
  }

  // 2. ANY 타입 경고
  if (
    (sourcePort.type === PortType.ANY || targetPort.type === PortType.ANY) &&
    sourcePort.type !== targetPort.type
  ) {
    return {
      valid: true,
      warning: 'ANY 타입 연결: 런타임 타입 검증 필요',
    };
  }

  return { valid: true };
}

/**
 * 노드의 모든 필수 입력 포트가 연결되었는지 확인
 *
 * @param inputPorts - 입력 포트 목록
 * @param connectedPorts - 연결된 포트 이름 Set
 * @returns 검증 결과
 */
export function validateRequiredInputs(
  inputPorts: PortDefinition[],
  connectedPorts: Set<string>
): PortConnectionValidation {
  const missingRequired = inputPorts.filter(
    (port) => port.required && !connectedPorts.has(port.name)
  );

  if (missingRequired.length > 0) {
    const portNames = missingRequired
      .map((p) => p.display_name)
      .join(', ');

    return {
      valid: false,
      error: `필수 입력 포트가 연결되지 않음: ${portNames}`,
    };
  }

  return { valid: true };
}

/**
 * 포트가 이미 연결되어 있는지 확인 (다중 연결 방지)
 *
 * @param portName - 포트 이름
 * @param existingConnections - 기존 연결 목록
 * @param allowMultiple - 다중 연결 허용 여부
 * @returns 검증 결과
 */
export function validateMultipleConnections(
  portName: string,
  existingConnections: string[],
  allowMultiple: boolean = false
): PortConnectionValidation {
  if (!allowMultiple && existingConnections.includes(portName)) {
    return {
      valid: false,
      error: '이 포트는 이미 연결되어 있습니다.',
    };
  }

  return { valid: true };
}
