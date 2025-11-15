import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { Badge } from '@/shared/components/badge';
import { ConditionItem } from './ConditionItem';
import type { IfElseCase, IfElseCondition, LogicalOperator } from '@/shared/types/workflow.types';

interface CaseItemProps {
  nodeId: string;
  caseItem: IfElseCase;
  index: number;
  onAddCondition: (caseId: string) => void;
  onUpdateCondition: (
    caseId: string,
    conditionId: string,
    updates: Partial<IfElseCondition>
  ) => void;
  onRemoveCondition: (caseId: string, conditionId: string) => void;
  onToggleLogicalOperator: (caseId: string) => void;
  onRemoveCase: (caseId: string) => void;
  canRemove: boolean;
}

export function CaseItem({
  nodeId,
  caseItem,
  index,
  onAddCondition,
  onUpdateCondition,
  onRemoveCondition,
  onToggleLogicalOperator,
  onRemoveCase,
  canRemove,
}: CaseItemProps) {
  const caseLabel = index === 0 ? 'IF' : `ELIF ${index}`;

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-white">
      {/* 케이스 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={index === 0 ? 'default' : 'secondary'}>{caseLabel}</Badge>
          {caseItem.conditions.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleLogicalOperator(caseItem.case_id)}
              className="h-7 text-xs"
            >
              {caseItem.logical_operator.toUpperCase()}
            </Button>
          )}
        </div>
        {canRemove && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemoveCase(caseItem.case_id)}
            className="h-7 w-7"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {/* 조건 목록 */}
      <div className="space-y-2">
        {caseItem.conditions.length === 0 ? (
          <div className="text-sm text-gray-400 italic py-2">조건이 없습니다</div>
        ) : (
          caseItem.conditions.map((condition, condIdx) => (
            <div key={condition.id} className="space-y-1">
              {condIdx > 0 && (
                <div className="text-xs font-medium text-gray-500 pl-2">
                  {caseItem.logical_operator.toUpperCase()}
                </div>
              )}
              <ConditionItem
                nodeId={nodeId}
                condition={condition}
                caseId={caseItem.case_id}
                onUpdate={onUpdateCondition}
                onRemove={onRemoveCondition}
              />
            </div>
          ))
        )}
      </div>

      {/* 조건 추가 버튼 */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAddCondition(caseItem.case_id)}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-1" />
        조건 추가
      </Button>
    </div>
  );
}
