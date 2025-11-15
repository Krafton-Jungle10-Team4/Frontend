import { useState, useCallback } from 'react';
import type {
  IfElseCase,
  IfElseCondition,
  LogicalOperator,
  VarType,
  ComparisonOperator,
} from '@/shared/types/workflow.types';

interface UseIfElseConfigProps {
  cases: IfElseCase[];
  onUpdate: (cases: IfElseCase[]) => void;
}

export function useIfElseConfig({ cases: initialCases, onUpdate }: UseIfElseConfigProps) {
  const [cases, setCases] = useState<IfElseCase[]>(initialCases || []);

  // 변경사항을 부모에 전파
  const notifyUpdate = useCallback(
    (newCases: IfElseCase[]) => {
      setCases(newCases);
      onUpdate(newCases);
    },
    [onUpdate]
  );

  // 케이스 추가 (ELIF)
  const addCase = useCallback(() => {
    const newCase: IfElseCase = {
      case_id: crypto.randomUUID(),
      logical_operator: 'and' as LogicalOperator,
      conditions: [],
    };
    notifyUpdate([...cases, newCase]);
  }, [cases, notifyUpdate]);

  // 케이스 삭제
  const removeCase = useCallback(
    (caseId: string) => {
      notifyUpdate(cases.filter((c) => c.case_id !== caseId));
    },
    [cases, notifyUpdate]
  );

  // 케이스 업데이트
  const updateCase = useCallback(
    (caseId: string, updates: Partial<IfElseCase>) => {
      const newCases = cases.map((c) => (c.case_id === caseId ? { ...c, ...updates } : c));
      notifyUpdate(newCases);
    },
    [cases, notifyUpdate]
  );

  // 조건 추가
  const addCondition = useCallback(
    (caseId: string) => {
      const newCases = cases.map((c) => {
        if (c.case_id === caseId) {
          const newCondition: IfElseCondition = {
            id: crypto.randomUUID(),
            varType: 'string' as VarType,
            variable_selector: '',
            comparison_operator: '=' as ComparisonOperator,
            value: '',
          };
          return {
            ...c,
            conditions: [...c.conditions, newCondition],
          };
        }
        return c;
      });
      notifyUpdate(newCases);
    },
    [cases, notifyUpdate]
  );

  // 조건 수정
  const updateCondition = useCallback(
    (caseId: string, conditionId: string, updates: Partial<IfElseCondition>) => {
      const newCases = cases.map((c) => {
        if (c.case_id === caseId) {
          return {
            ...c,
            conditions: c.conditions.map((cond) =>
              cond.id === conditionId ? { ...cond, ...updates } : cond
            ),
          };
        }
        return c;
      });
      notifyUpdate(newCases);
    },
    [cases, notifyUpdate]
  );

  // 조건 삭제
  const removeCondition = useCallback(
    (caseId: string, conditionId: string) => {
      const newCases = cases.map((c) => {
        if (c.case_id === caseId) {
          return {
            ...c,
            conditions: c.conditions.filter((cond) => cond.id !== conditionId),
          };
        }
        return c;
      });
      notifyUpdate(newCases);
    },
    [cases, notifyUpdate]
  );

  // 논리 연산자 토글 (AND ↔ OR)
  const toggleLogicalOperator = useCallback(
    (caseId: string) => {
      const newCases = cases.map((c) => {
        if (c.case_id === caseId) {
          return {
            ...c,
            logical_operator: (c.logical_operator === 'and' ? 'or' : 'and') as LogicalOperator,
          };
        }
        return c;
      });
      notifyUpdate(newCases);
    },
    [cases, notifyUpdate]
  );

  return {
    cases,
    addCase,
    removeCase,
    updateCase,
    addCondition,
    updateCondition,
    removeCondition,
    toggleLogicalOperator,
  };
}
