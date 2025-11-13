// src/shared/types/workflow/port.types.ts

/**
 * 포트 데이터 타입 (백엔드 PortType enum과 일치)
 * @see Backend: app/schemas/workflow.py - PortType
 */
export enum PortType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  ARRAY = 'array',
  OBJECT = 'object',
  FILE = 'file',
  ANY = 'any',
}

/**
 * 포트 정의
 * @see Backend: app/schemas/workflow.py - PortDefinition
 */
export interface PortDefinition {
  /** 포트 이름 (예: query, context, response) */
  name: string;

  /** 데이터 타입 */
  type: PortType;

  /** 필수 여부 */
  required: boolean;

  /** 기본값 */
  default_value?: unknown;

  /** 포트 설명 */
  description: string;

  /** UI 표시명 */
  display_name: string;
}

/**
 * 노드 포트 스키마
 * @see Backend: app/schemas/workflow.py - NodePortSchema
 */
export interface NodePortSchema {
  /** 입력 포트 목록 */
  inputs: PortDefinition[];

  /** 출력 포트 목록 */
  outputs: PortDefinition[];
}

/**
 * 포트 값 (실제 데이터)
 */
export type PortValue = string | number | boolean | unknown[] | Record<string, unknown> | File | null;

/**
 * 포트별 값 저장 구조
 */
export type PortValues = Record<string, PortValue>;
