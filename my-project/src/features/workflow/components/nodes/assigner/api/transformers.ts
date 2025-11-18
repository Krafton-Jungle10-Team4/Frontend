import type { AssignerNodeType, AssignerOperation } from '@/shared/types/workflow.types';

/**
 * Assigner 노드의 operation을 백엔드 포맷으로 변환
 * @param operation - 프론트엔드 operation 데이터
 * @returns 백엔드 API 포맷
 */
function operationToBackend(operation: AssignerOperation) {
  return {
    write_mode: operation.write_mode,
    input_type: operation.input_type,
    constant_value: operation.constant_value,
    // target_variable와 source_variable는 포트 연결 정보를 담고 있으므로
    // 백엔드에는 보내지 않음 (포트 연결로 대체됨)
  };
}

/**
 * 백엔드 operation을 프론트엔드 포맷으로 변환
 * @param backendOp - 백엔드 operation 데이터
 * @param index - operation 인덱스 (ID 생성용)
 * @returns 프론트엔드 operation 데이터
 */
function operationFromBackend(
  backendOp: any,
  index: number
): AssignerOperation {
  return {
    id: `op_${index}_${Date.now()}`,
    write_mode: backendOp.write_mode,
    input_type: backendOp.input_type,
    constant_value: backendOp.constant_value,
    // target_variable와 source_variable는 엣지 연결로부터 복원됨
  };
}

/**
 * Assigner 노드 데이터를 백엔드 포맷으로 변환
 * @param data - 프론트엔드 노드 데이터
 * @returns 백엔드 API 요청 포맷
 */
export function toBackendFormat(data: AssignerNodeType) {
  const operations = (data.operations || []).map(operationToBackend);
  const variable_mappings = data.variable_mappings || {};

  // Ensure variable_mappings for all operation ports
  operations.forEach((operation, index) => {
    // Check if operation needs a value input
    const needsValue = operation.write_mode !== 'CLEAR' &&
                       operation.write_mode !== 'REMOVE_FIRST' &&
                       operation.write_mode !== 'REMOVE_LAST';

    // Ensure target port mapping exists
    const targetPortName = `operation_${index}_target`;
    if (!variable_mappings[targetPortName]) {
      variable_mappings[targetPortName] = {
        target_port: targetPortName,
        source: {
          variable: '',
          value_type: 'any'
        }
      };
    }

    // Ensure value port mapping exists if needed
    if (needsValue && operation.input_type === 'VARIABLE') {
      const valuePortName = `operation_${index}_value`;
      if (!variable_mappings[valuePortName]) {
        variable_mappings[valuePortName] = {
          target_port: valuePortName,
          source: {
            variable: '',
            value_type: 'any'
          }
        };
      }
    }
  });

  return {
    type: 'assigner',
    config: {
      version: data.version || '2',
      operations: operations,
    },
    // ui_state는 프론트엔드 전용이므로 백엔드에 보내지 않음
    ports: data.ports,
    variable_mappings: variable_mappings,
  };
}

/**
 * 백엔드 포맷을 프론트엔드 데이터로 변환
 * @param backendData - 백엔드 API 응답 데이터
 * @returns 프론트엔드 노드 데이터
 */
export function fromBackendFormat(
  backendData: any
): Partial<AssignerNodeType> {
  const { config } = backendData;

  return {
    version: config?.version || '2',
    operations: (config?.operations || []).map(operationFromBackend),
    ui_state: {
      expanded: true,
      selected_operation: undefined,
    },
    ports: backendData.ports,
    variable_mappings: backendData.variable_mappings,
  };
}
