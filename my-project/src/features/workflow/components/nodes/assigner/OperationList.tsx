/**
 * OperationList 컴포넌트
 * 작업 목록 관리 UI
 */

import { AssignerOperation } from '@/shared/types/workflow.types';
import { OperationItem } from './OperationItem';
import type { NodeVariableMappings } from '@shared/types/workflow';
import type { ValueSelector } from '@shared/types/workflow';

interface OperationListProps {
  nodeId: string;
  operations: AssignerOperation[];
  variableMappings?: NodeVariableMappings;
  onOperationChange: (operationId: string, changes: Partial<AssignerOperation>) => void;
  onOperationRemove: (operationId: string) => void;
  onVariableMappingChange: (portName: string, selector: ValueSelector | null) => void;
}

export const OperationList = ({
  nodeId,
  operations,
  variableMappings,
  onOperationChange,
  onOperationRemove,
  onVariableMappingChange,
}: OperationListProps) => {
  if (operations.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        작업이 없습니다. 작업 추가 버튼을 클릭하세요.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {operations.map((operation, index) => (
        <OperationItem
          key={operation.id}
          nodeId={nodeId}
          operation={operation}
          index={index}
          variableMappings={variableMappings}
          onChange={(changes) => onOperationChange(operation.id, changes)}
          onRemove={() => onOperationRemove(operation.id)}
          onVariableMappingChange={onVariableMappingChange}
        />
      ))}
    </div>
  );
};
