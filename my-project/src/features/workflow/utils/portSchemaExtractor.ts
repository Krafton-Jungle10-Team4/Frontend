/**
 * 포트 스키마 추출 유틸리티
 */
import type { Node } from '@xyflow/react';
import type { PortDefinition } from '../types/template.types';

/**
 * Start 노드에서 입력 스키마 추출
 */
export function extractInputSchema(nodes: Node[]): PortDefinition[] {
  const startNode = nodes.find((node) => node.data?.type === 'start');

  if (!startNode) {
    return [];
  }

  const outputs = startNode.data?.ports?.outputs || startNode.data?.outputs || {};
  const ports: PortDefinition[] = [];

  Object.entries(outputs).forEach(([portName, portData]: [string, any]) => {
    ports.push({
      name: portName,
      type: portData.type || 'any',
      required: portData.required ?? true,
      description: portData.description,
      display_name: portData.label || portData.display_name || portName,
      default_value: portData.default || portData.default_value,
    });
  });

  return ports;
}

/**
 * End/Answer 노드에서 출력 스키마 추출
 */
export function extractOutputSchema(nodes: Node[]): PortDefinition[] {
  const endNodes = nodes.filter((node) =>
    ['end', 'answer'].includes(node.data?.type)
  );

  if (endNodes.length === 0) {
    return [];
  }

  // 첫 번째 End/Answer 노드의 입력 포트 사용
  const endNode = endNodes[0];
  const inputs = endNode.data?.ports?.inputs || endNode.data?.inputs || {};
  const ports: PortDefinition[] = [];

  Object.entries(inputs).forEach(([portName, portData]: [string, any]) => {
    ports.push({
      name: portName,
      type: portData.type || 'any',
      required: portData.required ?? true,
      description: portData.description,
      display_name: portData.label || portData.display_name || portName,
      default_value: portData.default || portData.default_value,
    });
  });

  return ports;
}

/**
 * 워크플로우에서 전체 포트 스키마 추출
 */
export function extractPortSchemas(nodes: Node[]): {
  input_schema: PortDefinition[];
  output_schema: PortDefinition[];
} {
  return {
    input_schema: extractInputSchema(nodes),
    output_schema: extractOutputSchema(nodes),
  };
}

/**
 * 포트 정의의 유효성 검증
 */
export function validatePortDefinition(port: PortDefinition): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!port.name || port.name.trim().length === 0) {
    errors.push('포트 이름이 비어있습니다.');
  }

  const validTypes = ['string', 'number', 'boolean', 'array', 'object', 'any', 'file', 'array_file'];
  if (!validTypes.includes(port.type)) {
    errors.push(`유효하지 않은 포트 타입: ${port.type}`);
  }

  if (typeof port.required !== 'boolean') {
    errors.push('required 필드는 boolean 타입이어야 합니다.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 포트 스키마 배열 검증
 */
export function validatePortSchema(ports: PortDefinition[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const portNames = new Set<string>();

  ports.forEach((port, index) => {
    const validation = validatePortDefinition(port);
    if (!validation.valid) {
      errors.push(`포트 [${index}]: ${validation.errors.join(', ')}`);
    }

    // 중복 포트 이름 검사
    if (portNames.has(port.name)) {
      errors.push(`중복된 포트 이름: ${port.name}`);
    }
    portNames.add(port.name);
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
