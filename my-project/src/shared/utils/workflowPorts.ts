import type { Node } from '@/shared/types/workflow.types';
import type { PortDefinition } from '@/shared/types/workflow';

const PLACEHOLDER_HANDLE_NAMES = new Set([
  'source',
  'target',
  'default',
  'input',
  'output',
]);

const pickPreferredPortName = (ports?: PortDefinition[]): string | null => {
  if (!ports || ports.length === 0) {
    return null;
  }
  const requiredPort = ports.find((port) => port.required);
  if (requiredPort?.name) {
    return requiredPort.name;
  }
  return ports[0]?.name ?? null;
};

export const normalizeHandleId = (
  nodeId: string | undefined,
  handleId: string | null | undefined,
  nodes: Node[],
  direction: 'inputs' | 'outputs'
): string | null => {
  if (!nodeId) {
    return handleId ?? null;
  }
  const node = nodes.find((candidate) => candidate.id === nodeId);
  const ports = node?.data?.ports?.[direction];
  if (!ports || ports.length === 0) {
    return handleId ?? null;
  }

  const currentHandle = handleId ?? null;
  if (currentHandle && ports.some((port) => port.name === currentHandle)) {
    return currentHandle;
  }

  const fallback = pickPreferredPortName(ports);
  if (!fallback) {
    return currentHandle;
  }

  if (!currentHandle) {
    return fallback;
  }

  const lowered = currentHandle.toLowerCase();
  if (PLACEHOLDER_HANDLE_NAMES.has(lowered)) {
    return fallback;
  }

  if (!ports.some((port) => port.name === currentHandle)) {
    return fallback;
  }

  return currentHandle;
};

export const normalizeSelectorVariable = (
  selector: string,
  nodes: Node[]
): string => {
  if (
    selector.startsWith('env.') ||
    selector.startsWith('conv.') ||
    selector.startsWith('sys.')
  ) {
    return selector;
  }

  if (!selector.includes('.')) {
    return selector;
  }

  const [nodeId, portName] = selector.split('.', 2);
  if (!nodeId || !portName) {
    return selector;
  }

  const normalizedHandle = normalizeHandleId(nodeId, portName, nodes, 'outputs');
  if (!normalizedHandle) {
    return selector;
  }

  return `${nodeId}.${normalizedHandle}`;
};
