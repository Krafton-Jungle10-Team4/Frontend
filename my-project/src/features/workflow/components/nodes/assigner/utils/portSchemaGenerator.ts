import type { AssignerOperation } from '@/shared/types/workflow.types';
import type { NodePortSchema, PortDefinition } from '@/shared/types/workflow';
import { PortType } from '@/shared/types/workflow';

/**
 * Assigner 노드의 동적 포트 스키마 생성
 *
 * 각 operation마다:
 * 입력:
 * - operation_{i}_target: 대상 변수
 * - operation_{i}_value: 값 (input_type이 'variable'일 때만)
 *
 * 출력:
 * - operation_{i}_result: 결과 변수
 */
export function generateAssignerPortSchema(
  operations: AssignerOperation[]
): NodePortSchema {
  const inputs: PortDefinition[] = [];
  const outputs: PortDefinition[] = [];

  operations.forEach((operation, index) => {
    // 각 operation마다 target 입력 포트
    inputs.push({
      name: `operation_${index}_target`,
      type: PortType.ANY,
      required: true,
      description: `Target variable for operation ${index}`,
      display_name: `Op ${index} Target`,
    });

    // input_type이 'variable'일 때만 value 입력 포트
    if (operation.input_type === 'variable') {
      inputs.push({
        name: `operation_${index}_value`,
        type: PortType.ANY,
        required: true,
        description: `Source value for operation ${index}`,
        display_name: `Op ${index} Value`,
      });
    }

    // 각 operation마다 result 출력 포트
    outputs.push({
      name: `operation_${index}_result`,
      type: PortType.ANY,
      required: true,
      description: `Result of operation ${index}`,
      display_name: `Op ${index} Result`,
    });
  });

  return {
    inputs,
    outputs,
  };
}
