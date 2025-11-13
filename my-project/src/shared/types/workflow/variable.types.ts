// src/shared/types/workflow/variable.types.ts

import { PortType, PortValues } from './port.types';

/**
 * 변수 선택자 (다른 노드 출력 참조)
 * @see Backend: app/schemas/workflow.py - ValueSelector
 */
export interface ValueSelector {
  /** 변수 경로: "node_id.port_name" */
  variable: string;

  /** 값 타입 */
  value_type: PortType;
}

/**
 * 변수 매핑 (입력 포트 → 데이터 소스)
 * @see Backend: app/schemas/workflow.py - VariableMapping
 */
export interface VariableMapping {
  /** 대상 입력 포트 이름 */
  target_port: string;

  /** 데이터 소스 (다른 노드 출력) */
  source: ValueSelector;
}

/**
 * 노드별 변수 매핑
 */
export type NodeVariableMappings = Record<string, VariableMapping>;

/**
 * 변수 참조 정보 (UI용)
 */
export interface VariableReference {
  /** 소스 노드 ID */
  nodeId: string;

  /** 소스 노드 제목 */
  nodeTitle: string;

  /** 포트 이름 */
  portName: string;

  /** 포트 표시명 */
  portDisplayName: string;

  /** 타입 */
  type: PortType;

  /** 전체 경로 (복사용) */
  fullPath: string;
}

/**
 * 변수 풀 상태 (실행 중)
 */
export interface VariablePoolState {
  /** 노드 출력: { nodeId: { portName: value } } */
  nodeOutputs: Record<string, PortValues>;

  /** 환경 변수 */
  environmentVariables: Record<string, unknown>;

  /** 대화 변수 */
  conversationVariables: Record<string, unknown>;
}
