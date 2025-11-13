// src/features/workflow/hooks/useVariablePool.ts

import { useCallback } from 'react';
import { useVariablePoolStore } from '../stores/variablePoolStore';
import {
  PortValue,
  PortValues,
  ValueSelector,
} from '@shared/types/workflow';

/**
 * Variable Pool 훅
 *
 * Variable Pool의 주요 기능을 React 컴포넌트에서 사용하기 위한 훅
 *
 * @returns Variable Pool 상태 및 액션
 *
 * @example
 * ```typescript
 * function WorkflowExecutor() {
 *   const {
 *     nodeOutputs,
 *     setNodeOutput,
 *     getNodeOutput,
 *     resolveVariable,
 *     clearAllOutputs
 *   } = useVariablePool();
 *
 *   const handleStartWorkflow = () => {
 *     clearAllOutputs();
 *     setNodeOutput('start_1', 'user_message', '안녕하세요');
 *   };
 *
 *   const executeNextNode = () => {
 *     const message = resolveVariable('start_1.user_message');
 *     // 다음 노드 실행...
 *   };
 * }
 * ```
 */
export function useVariablePool() {
  // 스토어 상태
  const nodeOutputs = useVariablePoolStore((state) => state.nodeOutputs);
  const environmentVariables = useVariablePoolStore(
    (state) => state.environmentVariables
  );
  const conversationVariables = useVariablePoolStore(
    (state) => state.conversationVariables
  );

  // 스토어 액션
  const setNodeOutput = useVariablePoolStore((state) => state.setNodeOutput);
  const getNodeOutput = useVariablePoolStore((state) => state.getNodeOutput);
  const hasNodeOutput = useVariablePoolStore((state) => state.hasNodeOutput);
  const getAllNodeOutputs = useVariablePoolStore(
    (state) => state.getAllNodeOutputs
  );
  const resolveValueSelector = useVariablePoolStore(
    (state) => state.resolveValueSelector
  );
  const resolveVariablePath = useVariablePoolStore(
    (state) => state.resolveVariablePath
  );
  const clearAllOutputs = useVariablePoolStore(
    (state) => state.clearAllOutputs
  );
  const clearNodeOutputs = useVariablePoolStore(
    (state) => state.clearNodeOutputs
  );

  // 환경 변수 액션
  const setEnvironmentVariable = useVariablePoolStore(
    (state) => state.setEnvironmentVariable
  );
  const getEnvironmentVariable = useVariablePoolStore(
    (state) => state.getEnvironmentVariable
  );

  // 대화 변수 액션
  const setConversationVariable = useVariablePoolStore(
    (state) => state.setConversationVariable
  );
  const getConversationVariable = useVariablePoolStore(
    (state) => state.getConversationVariable
  );

  // 디버깅 액션
  const getSnapshot = useVariablePoolStore((state) => state.getSnapshot);
  const getNodeContext = useVariablePoolStore((state) => state.getNodeContext);

  // === 편의 함수들 ===

  /**
   * 여러 출력을 한 번에 설정
   */
  const setMultipleOutputs = useCallback(
    (nodeId: string, outputs: PortValues) => {
      Object.entries(outputs).forEach(([portName, value]) => {
        setNodeOutput(nodeId, portName, value);
      });
    },
    [setNodeOutput]
  );

  /**
   * 노드 출력 조회 (null 반환 버전)
   */
  const getNodeOutputSafe = useCallback(
    (nodeId: string, portName: string): PortValue | null => {
      return getNodeOutput(nodeId, portName) ?? null;
    },
    [getNodeOutput]
  );

  /**
   * 변수 경로 문자열을 값으로 해석
   */
  const resolveVariable = useCallback(
    (path: string): PortValue | undefined => {
      return resolveVariablePath(path);
    },
    [resolveVariablePath]
  );

  /**
   * ValueSelector 배열을 한 번에 해석
   */
  const resolveMultipleSelectors = useCallback(
    (selectors: ValueSelector[]): (PortValue | undefined)[] => {
      return selectors.map((selector) => resolveValueSelector(selector));
    },
    [resolveValueSelector]
  );

  /**
   * 노드의 모든 출력이 존재하는지 확인
   */
  const hasAllOutputs = useCallback(
    (nodeId: string, portNames: string[]): boolean => {
      return portNames.every((portName) => hasNodeOutput(nodeId, portName));
    },
    [hasNodeOutput]
  );

  return {
    // 상태
    nodeOutputs,
    environmentVariables,
    conversationVariables,

    // 기본 액션
    setNodeOutput,
    getNodeOutput,
    hasNodeOutput,
    getAllNodeOutputs,
    resolveValueSelector,
    resolveVariablePath,
    clearAllOutputs,
    clearNodeOutputs,

    // 환경 변수
    setEnvironmentVariable,
    getEnvironmentVariable,

    // 대화 변수
    setConversationVariable,
    getConversationVariable,

    // 디버깅
    getSnapshot,
    getNodeContext,

    // 편의 함수
    setMultipleOutputs,
    getNodeOutputSafe,
    resolveVariable,
    resolveMultipleSelectors,
    hasAllOutputs,
  };
}
