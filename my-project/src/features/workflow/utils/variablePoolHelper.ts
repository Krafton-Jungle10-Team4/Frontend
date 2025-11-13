// src/features/workflow/utils/variablePoolHelper.ts

import { PortValues } from '@shared/types/workflow';
import { useVariablePoolStore } from '../stores/variablePoolStore';

/**
 * Variable Pool 통계 정보
 */
export interface VariablePoolStats {
  /** 출력을 가진 노드 수 */
  totalNodes: number;
  /** 전체 출력 포트 수 */
  totalOutputs: number;
  /** 환경 변수 개수 */
  environmentVariablesCount: number;
  /** 대화 변수 개수 */
  conversationVariablesCount: number;
}

/**
 * 노드의 모든 출력을 한 번에 설정
 *
 * 여러 포트 출력을 개별 호출 없이 일괄 설정합니다.
 * 노드 실행 완료 후 결과를 저장할 때 유용합니다.
 *
 * @param nodeId - 노드 ID
 * @param outputs - 포트별 출력 값
 *
 * @example
 * ```typescript
 * setAllNodeOutputs('knowledge_1', {
 *   documents: [{ id: '1', content: 'doc1' }],
 *   context: 'combined context',
 *   relevance_scores: [0.9, 0.8]
 * });
 * ```
 */
export function setAllNodeOutputs(nodeId: string, outputs: PortValues): void {
  const store = useVariablePoolStore.getState();

  Object.entries(outputs).forEach(([portName, value]) => {
    store.setNodeOutput(nodeId, portName, value);
  });
}

/**
 * Variable Pool 초기화 (워크플로우 실행 시작 시)
 *
 * 워크플로우 실행 전에 Variable Pool을 깨끗한 상태로 초기화합니다.
 * 기존 노드 출력을 모두 제거하고, 환경 변수와 대화 변수를 설정합니다.
 *
 * @param environmentVariables - 환경 변수 (선택)
 * @param conversationVariables - 대화 변수 (선택)
 *
 * @example
 * ```typescript
 * initializeVariablePool(
 *   { API_KEY: 'xxx', MAX_TOKENS: 1000 },
 *   { sessionId: 'session-123', userId: 'user-456' }
 * );
 * ```
 */
export function initializeVariablePool(
  environmentVariables?: Record<string, unknown>,
  conversationVariables?: Record<string, unknown>
): void {
  const store = useVariablePoolStore.getState();

  // 노드 출력 초기화
  store.clearAllOutputs();

  // 환경 변수 설정
  if (environmentVariables) {
    store.setEnvironmentVariables(environmentVariables);
  }

  // 대화 변수 설정
  if (conversationVariables) {
    store.setConversationVariables(conversationVariables);
  }
}

/**
 * Variable Pool 상태를 JSON으로 export (디버깅용)
 *
 * 현재 Variable Pool의 전체 상태를 JSON 문자열로 반환합니다.
 * 디버깅, 로깅, 상태 저장 등에 사용할 수 있습니다.
 *
 * @returns JSON 문자열
 *
 * @example
 * ```typescript
 * const stateJson = exportVariablePoolState();
 * console.log(stateJson);
 * // {
 * //   "nodeOutputs": { "start_1": { "user_message": "안녕하세요" } },
 * //   "environmentVariables": { "API_KEY": "xxx" },
 * //   "conversationVariables": { "sessionId": "session-123" }
 * // }
 * ```
 */
export function exportVariablePoolState(): string {
  const store = useVariablePoolStore.getState();
  const snapshot = store.getSnapshot();
  return JSON.stringify(snapshot, null, 2);
}

/**
 * Variable Pool 통계 정보
 *
 * Variable Pool의 현재 상태에 대한 통계를 반환합니다.
 * 대시보드, 모니터링, 디버깅에 유용합니다.
 *
 * @returns 통계 객체
 *
 * @example
 * ```typescript
 * const stats = getVariablePoolStats();
 * console.log(`총 ${stats.totalNodes}개 노드가 ${stats.totalOutputs}개 출력 생성`);
 * // "총 3개 노드가 8개 출력 생성"
 * ```
 */
export function getVariablePoolStats(): VariablePoolStats {
  const store = useVariablePoolStore.getState();
  const { nodeOutputs, environmentVariables, conversationVariables } =
    store.getSnapshot();

  const totalNodes = Object.keys(nodeOutputs).length;
  const totalOutputs = Object.values(nodeOutputs).reduce(
    (sum, outputs) => sum + Object.keys(outputs).length,
    0
  );

  return {
    totalNodes,
    totalOutputs,
    environmentVariablesCount: Object.keys(environmentVariables).length,
    conversationVariablesCount: Object.keys(conversationVariables).length,
  };
}

/**
 * 특정 노드가 모든 필수 출력을 생성했는지 확인
 *
 * @param nodeId - 노드 ID
 * @param requiredPorts - 필수 포트 이름 배열
 * @returns 모든 필수 출력 존재 여부
 *
 * @example
 * ```typescript
 * const hasAllOutputs = hasAllRequiredOutputs('llm_1', ['response', 'tokens_used']);
 * if (!hasAllOutputs) {
 *   console.error('LLM 노드가 필수 출력을 생성하지 않았습니다');
 * }
 * ```
 */
export function hasAllRequiredOutputs(
  nodeId: string,
  requiredPorts: string[]
): boolean {
  const store = useVariablePoolStore.getState();

  return requiredPorts.every((portName) =>
    store.hasNodeOutput(nodeId, portName)
  );
}

/**
 * 노드 출력 값 검증
 *
 * 특정 노드의 출력이 존재하고 유효한 값인지 확인합니다.
 *
 * @param nodeId - 노드 ID
 * @param portName - 포트 이름
 * @returns 유효한 값 존재 여부
 *
 * @example
 * ```typescript
 * if (!isValidNodeOutput('start_1', 'user_message')) {
 *   throw new Error('사용자 메시지가 없습니다');
 * }
 * ```
 */
export function isValidNodeOutput(nodeId: string, portName: string): boolean {
  const store = useVariablePoolStore.getState();

  if (!store.hasNodeOutput(nodeId, portName)) {
    return false;
  }

  const value = store.getNodeOutput(nodeId, portName);

  // null, undefined는 무효한 값으로 간주
  return value !== null && value !== undefined;
}

/**
 * Variable Pool 완전 초기화 (테스트용)
 *
 * 모든 상태를 초기 상태로 되돌립니다.
 * 주로 테스트 환경에서 사용됩니다.
 *
 * @example
 * ```typescript
 * // 테스트 전 초기화
 * beforeEach(() => {
 *   resetVariablePool();
 * });
 * ```
 */
export function resetVariablePool(): void {
  const store = useVariablePoolStore.getState();

  store.clearAllOutputs();
  store.setEnvironmentVariables({});
  store.setConversationVariables({});
}

/**
 * 노드 출력 복사 (디버깅/백업용)
 *
 * 한 노드의 출력을 다른 노드로 복사합니다.
 *
 * @param sourceNodeId - 소스 노드 ID
 * @param targetNodeId - 타겟 노드 ID
 *
 * @example
 * ```typescript
 * // 노드 출력 백업
 * copyNodeOutputs('llm_1', 'llm_1_backup');
 * ```
 */
export function copyNodeOutputs(
  sourceNodeId: string,
  targetNodeId: string
): void {
  const store = useVariablePoolStore.getState();
  const outputs = store.getAllNodeOutputs(sourceNodeId);

  Object.entries(outputs).forEach(([portName, value]) => {
    store.setNodeOutput(targetNodeId, portName, value);
  });
}
