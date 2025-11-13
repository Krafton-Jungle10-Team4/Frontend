// src/features/workflow/stores/variablePoolStore.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  PortValue,
  PortValues,
  ValueSelector,
  VariablePoolState,
} from '@shared/types/workflow';

/**
 * Variable Pool Store Interface
 *
 * 백엔드 VariablePool 클래스와 동일한 인터페이스 제공
 * @see Backend: app/core/workflow/variable_pool.py - VariablePool
 */
interface VariablePoolStore extends VariablePoolState {
  // === 노드 출력 관리 ===

  /**
   * 노드의 특정 출력 포트 값 저장
   * @see Backend: VariablePool.set_node_output
   */
  setNodeOutput: (nodeId: string, portName: string, value: PortValue) => void;

  /**
   * 노드의 특정 출력 포트 값 조회
   * @see Backend: VariablePool.get_node_output
   */
  getNodeOutput: (nodeId: string, portName: string) => PortValue | undefined;

  /**
   * 노드 출력 포트 존재 여부 확인
   * @see Backend: VariablePool.has_node_output
   */
  hasNodeOutput: (nodeId: string, portName: string) => boolean;

  /**
   * 특정 노드의 모든 출력 반환
   * @see Backend: VariablePool.get_all_node_outputs
   */
  getAllNodeOutputs: (nodeId: string) => PortValues;

  /**
   * 모든 노드 출력 초기화 (워크플로우 실행 시작 시)
   */
  clearAllOutputs: () => void;

  /**
   * 특정 노드 출력만 제거
   */
  clearNodeOutputs: (nodeId: string) => void;

  // === 변수 참조 해석 ===

  /**
   * ValueSelector를 실제 값으로 해석
   * @example "knowledge_1.documents" → actual documents array
   * @see Backend: VariablePool.resolve_value_selector
   */
  resolveValueSelector: (selector: ValueSelector) => PortValue | undefined;

  /**
   * 변수 경로 문자열을 값으로 해석
   * @example "llm_1.response" → actual response string
   */
  resolveVariablePath: (path: string) => PortValue | undefined;

  // === 환경 변수 관리 ===

  /**
   * 환경 변수 설정
   * @see Backend: VariablePool.set_environment_variable
   */
  setEnvironmentVariable: (key: string, value: unknown) => void;

  /**
   * 환경 변수 조회
   * @see Backend: VariablePool.get_environment_variable
   */
  getEnvironmentVariable: (key: string) => unknown;

  /**
   * 모든 환경 변수 설정
   */
  setEnvironmentVariables: (variables: Record<string, unknown>) => void;

  // === 대화 변수 관리 ===

  /**
   * 대화 변수 설정
   */
  setConversationVariable: (key: string, value: unknown) => void;

  /**
   * 대화 변수 조회
   */
  getConversationVariable: (key: string) => unknown;

  /**
   * 모든 대화 변수 설정
   */
  setConversationVariables: (variables: Record<string, unknown>) => void;

  // === 디버깅 & 유틸리티 ===

  /**
   * 모든 변수 상태 스냅샷 반환 (디버깅용)
   */
  getSnapshot: () => VariablePoolState;

  /**
   * 상태에서 특정 노드 관련 정보만 추출
   */
  getNodeContext: (nodeId: string) => {
    outputs: PortValues;
    hasOutputs: boolean;
  };
}

/**
 * Variable Pool Zustand Store
 *
 * 워크플로우 실행 중 노드 간 데이터 전달을 관리하는 중앙 저장소
 * - 노드 출력 저장 및 조회
 * - 변수 참조 해석 (node_id.port_name → 실제 값)
 * - 환경 변수 및 대화 변수 관리
 *
 * @example
 * ```typescript
 * const { setNodeOutput, getNodeOutput, resolveVariablePath } = useVariablePoolStore();
 *
 * // 노드 출력 저장
 * setNodeOutput('start_1', 'user_message', '안녕하세요');
 *
 * // 변수 참조 해석
 * const message = resolveVariablePath('start_1.user_message'); // '안녕하세요'
 * ```
 */
export const useVariablePoolStore = create<VariablePoolStore>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      nodeOutputs: {},
      environmentVariables: {},
      conversationVariables: {},

      // === 노드 출력 관리 구현 ===

      setNodeOutput: (nodeId, portName, value) => {
        set((state) => ({
          nodeOutputs: {
            ...state.nodeOutputs,
            [nodeId]: {
              ...state.nodeOutputs[nodeId],
              [portName]: value,
            },
          },
        }));
      },

      getNodeOutput: (nodeId, portName) => {
        const state = get();
        return state.nodeOutputs[nodeId]?.[portName];
      },

      hasNodeOutput: (nodeId, portName) => {
        const state = get();
        return (
          state.nodeOutputs[nodeId] !== undefined &&
          state.nodeOutputs[nodeId][portName] !== undefined
        );
      },

      getAllNodeOutputs: (nodeId) => {
        const state = get();
        return state.nodeOutputs[nodeId] || {};
      },

      clearAllOutputs: () => {
        set({ nodeOutputs: {} });
      },

      clearNodeOutputs: (nodeId) => {
        set((state) => {
          const { [nodeId]: _, ...rest } = state.nodeOutputs;
          return { nodeOutputs: rest };
        });
      },

      // === 변수 참조 해석 구현 ===

      resolveValueSelector: (selector) => {
        const { variable } = selector;
        return get().resolveVariablePath(variable);
      },

      resolveVariablePath: (path) => {
        // "node_id.port_name" 파싱
        const parts = path.split('.');
        if (parts.length !== 2) {
          console.error(`Invalid variable path: ${path}`);
          return undefined;
        }

        const [nodeId, portName] = parts;
        return get().getNodeOutput(nodeId, portName);
      },

      // === 환경 변수 관리 구현 ===

      setEnvironmentVariable: (key, value) => {
        set((state) => ({
          environmentVariables: {
            ...state.environmentVariables,
            [key]: value,
          },
        }));
      },

      getEnvironmentVariable: (key) => {
        const state = get();
        return state.environmentVariables[key];
      },

      setEnvironmentVariables: (variables) => {
        set({ environmentVariables: variables });
      },

      // === 대화 변수 관리 구현 ===

      setConversationVariable: (key, value) => {
        set((state) => ({
          conversationVariables: {
            ...state.conversationVariables,
            [key]: value,
          },
        }));
      },

      getConversationVariable: (key) => {
        const state = get();
        return state.conversationVariables[key];
      },

      setConversationVariables: (variables) => {
        set({ conversationVariables: variables });
      },

      // === 디버깅 & 유틸리티 구현 ===

      getSnapshot: () => {
        const { nodeOutputs, environmentVariables, conversationVariables } =
          get();
        return { nodeOutputs, environmentVariables, conversationVariables };
      },

      getNodeContext: (nodeId) => {
        const outputs = get().getAllNodeOutputs(nodeId);
        return {
          outputs,
          hasOutputs: Object.keys(outputs).length > 0,
        };
      },
    }),
    { name: 'VariablePoolStore' }
  )
);
