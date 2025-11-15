/**
 * Assigner 노드 설정 패널
 *
 * 변수 조작 작업 목록 관리
 */

import { Plus } from 'lucide-react';
import { useWorkflowStore } from '../../../stores/workflowStore';
import { BasePanel } from '../_base/base-panel';
import { Box, Group } from '../_base/components/layout';
import { Button } from '@shared/components/button';
import { OperationList } from './OperationList';
import type { AssignerNodeType, AssignerOperation, WriteMode, AssignerInputType } from '@/shared/types/workflow.types';

export const AssignerPanel = () => {
  const { selectedNodeId, nodes, updateNode } = useWorkflowStore();

  const node = nodes.find((n) => n.id === selectedNodeId);

  if (!node) return null;

  const assignerData = node.data as AssignerNodeType;

  const handleAddOperation = () => {
    const newOperationId = `op_${Date.now()}`;
    const newOperationIndex = assignerData.operations?.length || 0;

    // 새 작업 추가
    const newOperation: AssignerOperation = {
      id: newOperationId,
      write_mode: 'over-write' as WriteMode,
      input_type: 'variable' as AssignerInputType,
      constant_value: null,
    };

    const updatedOperations = [...(assignerData.operations || []), newOperation];

    updateNode(selectedNodeId!, {
      operations: updatedOperations,
    });

    // TODO: 포트 동적 추가 로직
    // - operation_{index}_target 입력 포트
    // - operation_{index}_value 입력 포트 (조건부)
    // - operation_{index}_result 출력 포트
  };

  const handleOperationChange = (
    operationId: string,
    changes: Partial<AssignerOperation>
  ) => {
    const updatedOperations = assignerData.operations?.map((op) =>
      op.id === operationId ? { ...op, ...changes } : op
    );

    updateNode(selectedNodeId!, {
      operations: updatedOperations,
    });
  };

  const handleOperationRemove = (operationId: string) => {
    const operationIndex = assignerData.operations?.findIndex(
      (op) => op.id === operationId
    );

    if (operationIndex === -1) return;

    const updatedOperations = assignerData.operations?.filter(
      (op) => op.id !== operationId
    );

    updateNode(selectedNodeId!, {
      operations: updatedOperations,
    });

    // TODO: 포트 제거 로직
    // - 해당 인덱스의 입력/출력 포트 제거
  };

  return (
    <BasePanel>
      <Box>
        <Group
          title="작업 목록"
          description="변수를 조작할 작업을 추가하세요"
          extra={
            <Button onClick={handleAddOperation} variant="ghost" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              작업 추가
            </Button>
          }
        >
          <OperationList
            operations={assignerData.operations || []}
            onOperationChange={handleOperationChange}
            onOperationRemove={handleOperationRemove}
          />
        </Group>
      </Box>
    </BasePanel>
  );
};
