import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { CaseList } from './components/CaseList';
import { useIfElseConfig } from './hooks/useIfElseConfig';
import type { IfElseNodeType } from '@/shared/types/workflow.types';
import { useWorkflowStore } from '@/features/workflow/stores/workflowStore';

interface IfElsePanelProps {
  id: string;
  data: IfElseNodeType;
}

export function IfElsePanel({ id, data }: IfElsePanelProps) {
  const updateNode = useWorkflowStore((state) => state.updateNode);

  // 안전한 데이터 접근
  const initialCases = data?.cases ?? [];

  const {
    cases,
    addCase,
    removeCase,
    addCondition,
    updateCondition,
    removeCondition,
    toggleLogicalOperator,
  } = useIfElseConfig({
    cases: initialCases,
    onUpdate: (newCases) => {
      updateNode(id, {
        cases: newCases,
      } as any);
    },
  });

  return (
    <div className="space-y-4 p-4">
      {/* 헤더 */}
      <div>
        <h3 className="text-sm font-semibold mb-1">IF-ELSE 조건 설정</h3>
        <p className="text-xs text-gray-500">
          조건에 따라 다른 실행 경로를 설정합니다
        </p>
      </div>

      {/* 케이스 목록 */}
      {cases.length === 0 ? (
        <div className="text-sm text-gray-400 italic py-4 text-center">
          케이스를 추가하여 시작하세요
        </div>
      ) : (
        <CaseList
          nodeId={id}
          cases={cases}
          onAddCondition={addCondition}
          onUpdateCondition={updateCondition}
          onRemoveCondition={removeCondition}
          onToggleLogicalOperator={toggleLogicalOperator}
          onRemoveCase={removeCase}
        />
      )}

      {/* ELIF 추가 버튼 */}
      <Button variant="outline" onClick={addCase} className="w-full">
        <Plus className="w-4 h-4 mr-1" />
        {cases.length === 0 ? 'IF 케이스 추가' : 'ELIF 케이스 추가'}
      </Button>

      {/* ELSE 안내 */}
      <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
        <div className="text-xs font-medium text-gray-700 mb-1">ELSE (기본 경로)</div>
        <div className="text-xs text-gray-600">
          모든 조건이 만족되지 않을 경우 이 경로로 진행됩니다.
        </div>
      </div>
    </div>
  );
}
