import { CaseItem } from './CaseItem';
import type { IfElseCase, IfElseCondition } from '@/shared/types/workflow.types';

interface CaseListProps {
  nodeId: string;
  cases: IfElseCase[];
  onAddCondition: (caseId: string) => void;
  onUpdateCondition: (
    caseId: string,
    conditionId: string,
    updates: Partial<IfElseCondition>
  ) => void;
  onRemoveCondition: (caseId: string, conditionId: string) => void;
  onToggleLogicalOperator: (caseId: string) => void;
  onRemoveCase: (caseId: string) => void;
}

export function CaseList({
  nodeId,
  cases,
  onAddCondition,
  onUpdateCondition,
  onRemoveCondition,
  onToggleLogicalOperator,
  onRemoveCase,
}: CaseListProps) {
  return (
    <div className="space-y-3">
      {cases.map((caseItem, index) => (
        <CaseItem
          key={caseItem.case_id}
          nodeId={nodeId}
          caseItem={caseItem}
          index={index}
          onAddCondition={onAddCondition}
          onUpdateCondition={onUpdateCondition}
          onRemoveCondition={onRemoveCondition}
          onToggleLogicalOperator={onToggleLogicalOperator}
          onRemoveCase={onRemoveCase}
          canRemove={cases.length > 1}
        />
      ))}
    </div>
  );
}
