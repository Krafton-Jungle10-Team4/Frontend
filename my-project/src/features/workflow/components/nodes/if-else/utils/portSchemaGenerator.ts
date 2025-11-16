import type { IfElseCase } from '@/shared/types/workflow.types';
import { LogicalOperator } from '@/shared/types/workflow.types';
import type { NodePortSchema, PortDefinition } from '@/shared/types/workflow';
import { PortType } from '@/shared/types/workflow';

const randomCaseId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `case_${Math.random().toString(36).slice(2, 10)}`;
};

export const createDefaultIfElseCase = (): IfElseCase => ({
  case_id: randomCaseId(),
  logical_operator: LogicalOperator.AND,
  conditions: [],
});

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
  // IfElse는 입력 포트를 사용하지 않는다.
  const inputs: PortDefinition[] = [];

  // 출력 포트 생성 (각 케이스 + ELSE)
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
