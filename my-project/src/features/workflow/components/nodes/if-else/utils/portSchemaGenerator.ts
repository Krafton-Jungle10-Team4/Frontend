import type { IfElseCase } from '@/shared/types/workflow.types';
import type { NodePortSchema, PortDefinition } from '@/shared/types/workflow';
import { PortType } from '@/shared/types/workflow';

/**
 * IF-ELSE 노드의 동적 포트 스키마 생성
 *
 * 입력:
 * - 모든 조건에서 참조된 고유 변수들 (variable_selector 추출)
 *
 * 출력:
 * - 각 IF/ELIF 케이스마다 하나씩 (if_0, elif_1, elif_2, ...)
 * - ELSE 브랜치 하나 (else)
 */
export function generateIfElsePortSchema(cases: IfElseCase[]): NodePortSchema {
  // 1. 모든 조건에서 사용된 변수 추출
  const variableSelectors = new Set<string>();

  cases.forEach((caseItem) => {
    caseItem.conditions.forEach((condition) => {
      if (condition.variable_selector) {
        variableSelectors.add(condition.variable_selector);
      }
    });
  });

  // 2. 입력 포트 생성 (각 변수마다)
  const inputs: PortDefinition[] = Array.from(variableSelectors).map(
    (selector) => {
      // selector 형식: "node_id.port_name"
      const displayName = selector.split('.').pop() || selector;

      return {
        name: selector,
        type: PortType.ANY, // 타입은 조건에서 varType 기반으로 결정되므로 ANY
        required: false,
        description: `Variable: ${selector}`,
        display_name: displayName,
      };
    }
  );

  // 3. 출력 포트 생성 (각 케이스 + ELSE)
  const outputs: PortDefinition[] = [];

  // IF/ELIF 케이스별 출력
  cases.forEach((caseItem, index) => {
    const portName = index === 0 ? 'if' : `elif_${index}`;
    const displayName = index === 0 ? 'IF' : `ELIF ${index}`;

    outputs.push({
      name: portName,
      type: PortType.BOOLEAN,
      required: true,
      description: `${displayName} branch output (conditions matched)`,
      display_name: displayName,
    });
  });

  // ELSE 출력 (항상 존재)
  outputs.push({
    name: 'else',
    type: PortType.BOOLEAN,
    required: true,
    description: 'ELSE branch output (no conditions matched)',
    display_name: 'ELSE',
  });

  return {
    inputs,
    outputs,
  };
}
