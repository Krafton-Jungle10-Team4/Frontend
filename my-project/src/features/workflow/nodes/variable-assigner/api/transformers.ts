import type {
  ValueSelector,
  VariableReference,
  VariableAssignerNodeData,
  PortDefinition,
  VariableMapping,
} from '../types';
import { VarType } from '../types';

/**
 * Dify ValueSelector를 백엔드 VariableReference로 변환
 * @param selector - Dify 스타일 변수 선택자 (배열 형식)
 * @returns 백엔드 스타일 변수 참조 (문자열 형식)
 * @example
 * valueSelectorToReference(['node_id', 'port_name']) // 'node_id.port_name'
 */
export function valueSelectorToReference(
  selector: ValueSelector
): VariableReference {
  return selector.join('.');
}

/**
 * 백엔드 VariableReference를 Dify ValueSelector로 변환
 * @param reference - 백엔드 스타일 변수 참조 (문자열 형식)
 * @returns Dify 스타일 변수 선택자 (배열 형식)
 * @example
 * referenceToValueSelector('node_id.port_name') // ['node_id', 'port_name']
 */
export function referenceToValueSelector(
  reference: VariableReference
): ValueSelector {
  return reference.split('.');
}

/**
 * 기본 포트 스키마 생성
 * @param data - 노드 데이터
 * @returns 포트 정의 객체
 */
function generateDefaultPorts(data: VariableAssignerNodeData): {
  inputs: PortDefinition[];
  outputs: PortDefinition[];
} {
  const { advanced_settings } = data;

  // 단일 모드
  if (!advanced_settings.group_enabled) {
    return {
      inputs: [],
      outputs: [
        {
          name: 'output',
          type: data.output_type,
          required: true,
          description: '집계된 변수 출력',
          display_name: '출력',
        },
      ],
    };
  }

  // 그룹 모드
  return {
    inputs: [],
    outputs: advanced_settings.groups.map(group => ({
      name: `${group.group_name}.output`,
      type: group.output_type,
      required: true,
      description: `${group.group_name} 그룹 출력`,
      display_name: group.group_name,
    })),
  };
}

/**
 * Variable Assigner 노드 데이터를 백엔드 포맷으로 변환
 * 기존 ports와 variable_mappings가 있으면 보존하고, 없으면 기본값 생성
 * @param data - 프론트엔드 노드 데이터
 * @returns 백엔드 API 요청 포맷
 */
export function toBackendFormat(data: VariableAssignerNodeData) {
  const { advanced_settings } = data;

  // 기존 ports와 variable_mappings 보존, 없으면 기본값 생성
  const ports =
    data.ports ?? generateDefaultPorts(data);
  const variable_mappings =
    (data.variable_mappings as Record<string, VariableMapping> | undefined) ??
    {};

  // 단일 모드
  if (!advanced_settings.group_enabled) {
    return {
      type: 'variable-assigner',
      config: {
        output_type: data.output_type,
        variables: data.variables.map(valueSelectorToReference),
      },
      ports,
      variable_mappings,
    };
  }

  // 그룹 모드
  return {
    type: 'variable-assigner',
    config: {
      group_enabled: true,
      groups: advanced_settings.groups.map(group => ({
        groupId: group.groupId,
        group_name: group.group_name,
        output_type: group.output_type,
        variables: group.variables.map(valueSelectorToReference),
      })),
    },
    ports,
    variable_mappings,
  };
}

/**
 * 백엔드 포맷을 프론트엔드 데이터로 변환
 * 백엔드에서 받은 ports와 variable_mappings를 보존
 * @param backendData - 백엔드 API 응답 데이터
 * @returns 프론트엔드 노드 데이터
 */
export function fromBackendFormat(
  backendData: any
): VariableAssignerNodeData {
  const { config } = backendData;

  // 백엔드에서 받은 ports와 variable_mappings 보존
  const ports = backendData.ports;
  const variable_mappings =
    (backendData.variable_mappings as Record<string, VariableMapping> | undefined) ??
    {};

  // 단일 모드
  if (!config.group_enabled) {
    return {
      output_type: config.output_type,
      variables: config.variables.map(referenceToValueSelector),
      advanced_settings: {
        group_enabled: false,
        groups: [],
      },
      ports,
      variable_mappings,
    };
  }

  // 그룹 모드
  return {
    output_type: VarType.ANY,
    variables: [],
    advanced_settings: {
      group_enabled: true,
      groups: config.groups.map((group: any) => ({
        groupId: group.groupId,
        group_name: group.group_name,
        output_type: group.output_type,
        variables: group.variables.map(referenceToValueSelector),
      })),
    },
    ports,
    variable_mappings,
  };
}
