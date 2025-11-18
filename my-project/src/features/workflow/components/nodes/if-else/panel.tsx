import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { CaseList } from './components/CaseList';
import { useIfElseConfig } from './hooks/useIfElseConfig';
import type { IfElseNodeType } from '@/shared/types/workflow.types';
import { useWorkflowStore } from '@/features/workflow/stores/workflowStore';
import { validateCases } from './utils/validation';
import { Alert, AlertDescription } from '@/shared/components/alert';
import { AlertCircle } from 'lucide-react';
import { BasePanel } from '../_base/base-panel';
import { Box, Group } from '../_base/components/layout';
import { generateIfElsePortSchema } from './utils/portSchemaGenerator';

/**
 * IF-ELSE 노드 설정 패널
 *
 * 패턴: LLMPanel과 동일하게 store에서 selectedNodeId와 nodes를 읽음
 * props를 받지 않고 내부에서 선택된 노드를 찾아 사용
 */
export function IfElsePanel() {
  const { selectedNodeId, nodes, updateNode } = useWorkflowStore();

  if (!selectedNodeId) return null;

  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node) return null;

  const ifElseData = node.data as IfElseNodeType;
  const initialCases = ifElseData?.cases ?? [];

  return (
    <IfElsePanelContent
      key={selectedNodeId}
      nodeId={selectedNodeId}
      initialCases={initialCases}
      updateNode={updateNode}
    />
  );
}

interface IfElsePanelContentProps {
  nodeId: string;
  initialCases: IfElseNodeType['cases'];
  updateNode: ReturnType<typeof useWorkflowStore>['updateNode'];
}

function IfElsePanelContent({
  nodeId,
  initialCases,
  updateNode,
}: IfElsePanelContentProps) {
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
      updateNode(nodeId, {
        cases: newCases,
        ports: generateIfElsePortSchema(newCases),
      } as any);
    },
  });

  // 전체 검증 상태
  const validation = validateCases(cases);
  const hasErrors = !validation.isValid;

  return (
    <BasePanel>
      <Box>
        <Group
          title="IF-ELSE 조건 설정"
          description="조건에 따라 다른 실행 경로를 설정합니다"
        >
          {/* 검증 에러 표시 */}
          {hasErrors && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="text-sm font-medium mb-1">설정을 완료해주세요</div>
                <ul className="text-xs space-y-1">
                  {validation.errors.map((error, idx) => (
                    <li key={idx}>• {error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* 케이스 목록 */}
          {cases.length === 0 ? (
            <div className="text-sm text-gray-400 italic py-4 text-center">
              케이스를 추가하여 시작하세요
            </div>
          ) : (
            <CaseList
              nodeId={nodeId}
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
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">ELSE (기본 경로)</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              모든 조건이 만족되지 않을 경우 이 경로로 진행됩니다.
            </div>
          </div>

          <div className="mt-3 rounded-md border border-dashed border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/40 p-3 text-xs text-gray-600 dark:text-gray-400">
            <p className="font-medium text-gray-700 dark:text-gray-200 mb-1">분기 라우팅 안내</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><code className="font-mono">if</code>, <code className="font-mono">elif_N</code>, <code className="font-mono">else</code> 출력 핸들이 그대로 엣지 source_handle이 됩니다.</li>
              <li>각 케이스의 <code className="font-mono">case_id</code>를 지정하면 해당 문자열도 핸들로 사용되어 조건별 라우팅을 명확히 할 수 있습니다.</li>
              <li>분기 대상 노드의 입력 엣지를 해당 핸들에 연결하면 실행 시 선택된 경로만 큐에 추가됩니다.</li>
            </ul>
          </div>
        </Group>
      </Box>
    </BasePanel>
  );
}
