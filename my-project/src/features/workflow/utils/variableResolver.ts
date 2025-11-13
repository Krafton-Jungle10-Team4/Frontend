// src/features/workflow/utils/variableResolver.ts

import { PortValue, ValueSelector } from '@shared/types/workflow';
import { useVariablePoolStore } from '../stores/variablePoolStore';

/**
 * 변수 경로 파싱 결과
 */
export interface ParsedVariablePath {
  nodeId: string;
  portName: string;
}

/**
 * 변수 경로 파싱
 *
 * "node_id.port_name" 형식의 변수 경로를 파싱하여 노드 ID와 포트 이름으로 분리
 *
 * @param path - 변수 경로 (예: "knowledge_1.documents")
 * @returns { nodeId, portName } 또는 null (파싱 실패 시)
 *
 * @example
 * ```typescript
 * parseVariablePath('knowledge_1.documents')
 * // { nodeId: 'knowledge_1', portName: 'documents' }
 *
 * parseVariablePath('invalid')
 * // null
 * ```
 */
export function parseVariablePath(path: string): ParsedVariablePath | null {
  const parts = path.split('.');

  if (parts.length !== 2) {
    return null;
  }

  const [nodeId, portName] = parts;

  // 빈 문자열 검증
  if (!nodeId || !portName) {
    return null;
  }

  return {
    nodeId,
    portName,
  };
}

/**
 * 변수 경로 생성
 *
 * 노드 ID와 포트 이름을 조합하여 변수 경로 문자열 생성
 *
 * @param nodeId - 노드 ID
 * @param portName - 포트 이름
 * @returns 변수 경로 (예: "knowledge_1.documents")
 *
 * @example
 * ```typescript
 * buildVariablePath('knowledge_1', 'documents')
 * // 'knowledge_1.documents'
 * ```
 */
export function buildVariablePath(nodeId: string, portName: string): string {
  return `${nodeId}.${portName}`;
}

/**
 * 변수 참조를 실제 값으로 해석 (Store 외부에서 사용)
 *
 * ValueSelector 객체를 받아 실제 노드 출력 값을 반환합니다.
 * Store의 getState()를 사용하여 React 컴포넌트 외부에서도 사용 가능합니다.
 *
 * @param selector - 변수 선택자
 * @returns 해석된 값 또는 undefined
 *
 * @example
 * ```typescript
 * const selector: ValueSelector = {
 *   variable: 'start_1.user_message',
 *   value_type: PortType.STRING
 * };
 *
 * const value = resolveVariableValue(selector);
 * // '안녕하세요' (실제 저장된 값)
 * ```
 */
export function resolveVariableValue(
  selector: ValueSelector
): PortValue | undefined {
  const store = useVariablePoolStore.getState();
  return store.resolveValueSelector(selector);
}

/**
 * 여러 변수 참조를 한 번에 해석
 *
 * 여러 ValueSelector를 배열로 받아 각각을 해석한 값 배열을 반환합니다.
 * 일괄 처리가 필요한 경우 유용합니다.
 *
 * @param selectors - 변수 선택자 배열
 * @returns 해석된 값 배열
 *
 * @example
 * ```typescript
 * const selectors = [
 *   { variable: 'start_1.user_message', value_type: PortType.STRING },
 *   { variable: 'knowledge_1.context', value_type: PortType.STRING }
 * ];
 *
 * const values = resolveMultipleVariables(selectors);
 * // ['안녕하세요', 'context data...']
 * ```
 */
export function resolveMultipleVariables(
  selectors: ValueSelector[]
): (PortValue | undefined)[] {
  const store = useVariablePoolStore.getState();
  return selectors.map((selector) => store.resolveValueSelector(selector));
}

/**
 * 변수 경로 검증
 *
 * 변수 경로 문자열이 올바른 형식인지 검증합니다.
 * "node_id.port_name" 형식이어야 합니다.
 *
 * @param path - 변수 경로
 * @returns 유효 여부
 *
 * @example
 * ```typescript
 * isValidVariablePath('knowledge_1.documents') // true
 * isValidVariablePath('invalid') // false
 * isValidVariablePath('too.many.parts') // false
 * ```
 */
export function isValidVariablePath(path: string): boolean {
  const parsed = parseVariablePath(path);
  return parsed !== null;
}

/**
 * 변수가 존재하는지 확인
 *
 * 변수 경로가 유효하고, 실제로 Variable Pool에 값이 저장되어 있는지 확인합니다.
 *
 * @param path - 변수 경로
 * @returns 존재 여부
 *
 * @example
 * ```typescript
 * // 노드 출력이 저장되어 있는 경우
 * variableExists('start_1.user_message') // true
 *
 * // 저장되지 않은 경우
 * variableExists('nonexistent.output') // false
 * ```
 */
export function variableExists(path: string): boolean {
  const parsed = parseVariablePath(path);
  if (!parsed) return false;

  const store = useVariablePoolStore.getState();
  return store.hasNodeOutput(parsed.nodeId, parsed.portName);
}

/**
 * 변수 경로에서 노드 ID 추출
 *
 * @param path - 변수 경로
 * @returns 노드 ID 또는 null
 *
 * @example
 * ```typescript
 * extractNodeId('knowledge_1.documents') // 'knowledge_1'
 * extractNodeId('invalid') // null
 * ```
 */
export function extractNodeId(path: string): string | null {
  const parsed = parseVariablePath(path);
  return parsed ? parsed.nodeId : null;
}

/**
 * 변수 경로에서 포트 이름 추출
 *
 * @param path - 변수 경로
 * @returns 포트 이름 또는 null
 *
 * @example
 * ```typescript
 * extractPortName('knowledge_1.documents') // 'documents'
 * extractPortName('invalid') // null
 * ```
 */
export function extractPortName(path: string): string | null {
  const parsed = parseVariablePath(path);
  return parsed ? parsed.portName : null;
}
