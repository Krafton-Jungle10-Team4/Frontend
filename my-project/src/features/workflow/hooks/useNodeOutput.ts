// src/features/workflow/hooks/useNodeOutput.ts

import { useVariablePoolStore } from '../stores/variablePoolStore';
import { PortValue, PortValues } from '@shared/types/workflow';

/**
 * 특정 노드의 출력을 구독하는 훅
 *
 * 노드의 모든 출력 포트 값을 구독하며, 값이 변경될 때만 리렌더링됩니다.
 * 얕은 비교를 사용하여 불필요한 리렌더링을 방지합니다.
 *
 * @param nodeId - 노드 ID
 * @returns 노드의 모든 출력 포트 값
 *
 * @example
 * ```typescript
 * function NodeOutputDisplay({ nodeId }: { nodeId: string }) {
 *   const outputs = useNodeOutput(nodeId);
 *
 *   return (
 *     <div>
 *       {Object.entries(outputs).map(([portName, value]) => (
 *         <div key={portName}>
 *           {portName}: {JSON.stringify(value)}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useNodeOutput(nodeId: string): PortValues {
  return useVariablePoolStore(
    (state) => state.nodeOutputs[nodeId] || {},
    (prev, next) => {
      // 얕은 비교로 불필요한 리렌더링 방지
      return JSON.stringify(prev) === JSON.stringify(next);
    }
  );
}

/**
 * 특정 노드의 특정 포트 출력을 구독하는 훅
 *
 * 하나의 포트 출력만 구독하므로 useNodeOutput보다 더 세밀한 제어가 가능합니다.
 * 해당 포트 값이 변경될 때만 리렌더링됩니다.
 *
 * @param nodeId - 노드 ID
 * @param portName - 포트 이름
 * @returns 포트 값
 *
 * @example
 * ```typescript
 * function LLMResponse({ nodeId }: { nodeId: string }) {
 *   const response = useNodePortOutput(nodeId, 'response');
 *
 *   return <div>{response as string}</div>;
 * }
 * ```
 */
export function useNodePortOutput(
  nodeId: string,
  portName: string
): PortValue | undefined {
  return useVariablePoolStore((state) => {
    return state.nodeOutputs[nodeId]?.[portName];
  });
}

/**
 * 여러 노드의 출력을 한 번에 구독하는 훅
 *
 * 여러 노드의 출력을 동시에 모니터링해야 할 때 유용합니다.
 * 각 노드의 출력이 변경될 때만 리렌더링됩니다.
 *
 * @param nodeIds - 노드 ID 배열
 * @returns 노드별 출력 맵
 *
 * @example
 * ```typescript
 * function MultiNodeDisplay({ nodeIds }: { nodeIds: string[] }) {
 *   const outputs = useMultipleNodeOutputs(nodeIds);
 *
 *   return (
 *     <div>
 *       {Object.entries(outputs).map(([nodeId, nodeOutputs]) => (
 *         <div key={nodeId}>
 *           <h3>{nodeId}</h3>
 *           <pre>{JSON.stringify(nodeOutputs, null, 2)}</pre>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useMultipleNodeOutputs(
  nodeIds: string[]
): Record<string, PortValues> {
  return useVariablePoolStore(
    (state) => {
      const result: Record<string, PortValues> = {};
      nodeIds.forEach((nodeId) => {
        result[nodeId] = state.nodeOutputs[nodeId] || {};
      });
      return result;
    },
    (prev, next) => {
      // 얕은 비교로 불필요한 리렌더링 방지
      return JSON.stringify(prev) === JSON.stringify(next);
    }
  );
}

/**
 * 노드가 출력을 가지고 있는지 확인하는 훅
 *
 * 노드의 출력 존재 여부만 구독합니다.
 * 출력이 생성되거나 제거될 때만 리렌더링됩니다.
 *
 * @param nodeId - 노드 ID
 * @returns 출력 존재 여부
 *
 * @example
 * ```typescript
 * function NodeStatus({ nodeId }: { nodeId: string }) {
 *   const hasOutput = useNodeHasOutput(nodeId);
 *
 *   return (
 *     <div>
 *       {hasOutput ? '✅ 출력 있음' : '⏳ 대기 중'}
 *     </div>
 *   );
 * }
 * ```
 */
export function useNodeHasOutput(nodeId: string): boolean {
  return useVariablePoolStore((state) => {
    const outputs = state.nodeOutputs[nodeId];
    return outputs !== undefined && Object.keys(outputs).length > 0;
  });
}

/**
 * 특정 포트가 존재하는지 확인하는 훅
 *
 * 특정 포트의 존재 여부만 구독합니다.
 * 해당 포트가 생성되거나 제거될 때만 리렌더링됩니다.
 *
 * @param nodeId - 노드 ID
 * @param portName - 포트 이름
 * @returns 포트 존재 여부
 *
 * @example
 * ```typescript
 * function PortStatus({ nodeId, portName }: Props) {
 *   const hasPort = usePortExists(nodeId, portName);
 *
 *   return (
 *     <div>
 *       {portName}: {hasPort ? '✅' : '❌'}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePortExists(nodeId: string, portName: string): boolean {
  return useVariablePoolStore((state) => {
    return (
      state.nodeOutputs[nodeId] !== undefined &&
      state.nodeOutputs[nodeId][portName] !== undefined
    );
  });
}

/**
 * 노드 출력 개수를 구독하는 훅
 *
 * 노드가 생성한 출력 포트의 개수를 구독합니다.
 * 출력 개수가 변경될 때만 리렌더링됩니다.
 *
 * @param nodeId - 노드 ID
 * @returns 출력 포트 개수
 *
 * @example
 * ```typescript
 * function NodeOutputCount({ nodeId }: { nodeId: string }) {
 *   const count = useNodeOutputCount(nodeId);
 *
 *   return <div>출력 개수: {count}</div>;
 * }
 * ```
 */
export function useNodeOutputCount(nodeId: string): number {
  return useVariablePoolStore((state) => {
    const outputs = state.nodeOutputs[nodeId];
    return outputs ? Object.keys(outputs).length : 0;
  });
}
