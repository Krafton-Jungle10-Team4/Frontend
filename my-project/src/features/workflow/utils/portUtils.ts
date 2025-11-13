// src/features/workflow/utils/portUtils.ts

import type { PortDefinition, NodePortSchema } from '@shared/types/workflow';

/**
 * 포트 이름으로 포트 정의 찾기
 */
export function findPortByName(
  ports: PortDefinition[],
  portName: string
): PortDefinition | undefined {
  return ports.find((p) => p.name === portName);
}

/**
 * 필수 포트 목록 추출
 */
export function getRequiredPorts(ports: PortDefinition[]): PortDefinition[] {
  return ports.filter((p) => p.required);
}

/**
 * 포트가 기본값을 가지는지 확인
 */
export function hasDefaultValue(port: PortDefinition): boolean {
  return port.default_value !== undefined;
}

/**
 * 포트 ID 생성 (노드 ID + 포트 이름)
 */
export function generatePortId(nodeId: string, portName: string): string {
  return `${nodeId}.${portName}`;
}

/**
 * 포트 ID 파싱 (노드 ID + 포트 이름 분리)
 */
export function parsePortId(portId: string): {
  nodeId: string;
  portName: string;
} {
  const [nodeId, portName] = portId.split('.');
  return { nodeId, portName };
}

/**
 * 노드의 모든 포트 이름 추출
 */
export function getAllPortNames(portSchema: NodePortSchema): string[] {
  return [
    ...portSchema.inputs.map((p) => p.name),
    ...portSchema.outputs.map((p) => p.name),
  ];
}

/**
 * 포트 위치 계산 (균등 배치)
 */
export function calculatePortPosition(
  index: number,
  totalPorts: number
): number {
  return ((index + 1) / (totalPorts + 1)) * 100;
}
