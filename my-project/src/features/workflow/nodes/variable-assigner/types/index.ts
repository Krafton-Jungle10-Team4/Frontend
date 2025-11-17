// ==================== Enums ====================

/**
 * 변수 타입 열거형
 * Variable Assigner 노드에서 지원하는 데이터 타입
 */
export enum VarType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  OBJECT = 'object',
  ARRAY = 'array',
  ARRAY_STRING = 'array[string]',
  ARRAY_NUMBER = 'array[number]',
  ARRAY_OBJECT = 'array[object]',
  FILE = 'file',
  ARRAY_FILE = 'array_file',
  ANY = 'any',
}

// ==================== Basic Types ====================

/**
 * 변수 참조 경로 (Dify 스타일)
 * 예: ['node_id', 'port_name'] → node_id.port_name
 */
export type ValueSelector = string[];

/**
 * 변수 참조 경로 (백엔드 스타일)
 * 예: 'node_id.port_name'
 */
export type VariableReference = string;

/**
 * 포트 정의 (백엔드 스키마)
 */
export interface PortDefinition {
  /** 포트 이름 */
  name: string;

  /** 데이터 타입 */
  type: VarType;

  /** 필수 여부 */
  required: boolean;

  /** 기본값 */
  default_value?: unknown;

  /** 포트 설명 */
  description?: string;

  /** UI 표시명 */
  display_name?: string;
}

/**
 * 변수 매핑 (백엔드 연동)
 */
export interface VariableMapping {
  /** 대상 포트 */
  target_port: string;

  /** 데이터 소스 */
  source: {
    /** 변수 경로: 'node_id.port_name' */
    variable: string;
    /** 값 타입 */
    value_type: VarType;
  };
}

// ==================== Variable Assigner Types ====================

/**
 * 변수 그룹 항목
 */
export interface VarGroupItem {
  /** 출력 타입 */
  output_type: VarType;

  /** 선택된 변수 목록 */
  variables: ValueSelector[];
}

/**
 * 그룹 (Group Mode용)
 */
export interface VariableGroup extends VarGroupItem {
  /** 그룹 고유 ID (UUID) */
  groupId: string;

  /** 그룹 이름 (예: "Group1", "UserData") */
  group_name: string;
}

/**
 * Variable Assigner 노드 데이터
 */
export interface VariableAssignerNodeData {
  /** 단일 모드: 출력 타입 */
  output_type: VarType;

  /** 단일 모드: 선택된 변수 목록 */
  variables: ValueSelector[];

  /** 그룹 모드 설정 */
  advanced_settings: {
    /** 그룹 모드 활성화 여부 */
    group_enabled: boolean;

    /** 그룹 목록 */
    groups: VariableGroup[];
  };

  /** 백엔드 연동: 포트 정의 */
  ports?: {
    inputs: PortDefinition[];
    outputs: PortDefinition[];
  };

  /** 백엔드 연동: 변수 매핑 */
  variable_mappings?: Record<string, VariableMapping>;
}

/**
 * React Flow 노드 타입
 */
export interface VariableAssignerNode {
  /** 노드 ID */
  id: string;

  /** 노드 타입 */
  type: 'variable-assigner';

  /** 노드 위치 */
  position: { x: number; y: number };

  /** 노드 데이터 */
  data: VariableAssignerNodeData;
}

// ==================== Validation Result ====================

/**
 * 검증 결과
 */
export interface ValidationResult {
  /** 유효성 여부 */
  isValid: boolean;

  /** 에러 메시지 (유효하지 않을 경우) */
  errorMessage?: string;
}

// ==================== Available Variable Info ====================

/**
 * 사용 가능한 변수 정보
 */
export interface AvailableVariable {
  /** 소스 노드 ID */
  nodeId: string;

  /** 소스 노드 이름 */
  nodeName: string;

  /** 포트 이름 */
  portName: string;

  /** 포트 표시명 */
  displayName: string;

  /** 변수 타입 */
  type: VarType;

  /** 포트 설명 */
  description?: string;

  /** 변수 선택자 (Dify 스타일) */
  selector: ValueSelector;
}

/**
 * 노드별 변수 그룹
 */
export interface NodeVariableGroup {
  /** 노드 ID */
  nodeId: string;

  /** 노드 이름 */
  nodeName: string;

  /** 노드 타입 */
  nodeType: string;

  /** 사용 가능한 변수 목록 */
  variables: AvailableVariable[];
}
