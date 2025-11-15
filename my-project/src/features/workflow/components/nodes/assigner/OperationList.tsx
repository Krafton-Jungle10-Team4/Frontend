/**
 * OperationList 컴포넌트
 * 작업 목록 관리 UI
 */

import { AssignerOperation } from '@/shared/types/workflow.types';
import { OperationItem } from './OperationItem';

interface OperationListProps {
  operations: AssignerOperation[];
  onOperationChange: (operationId: string, changes: Partial<AssignerOperation>) => void;
  onOperationRemove: (operationId: string) => void;
}

export const OperationList = ({
  operations,
  onOperationChange,
  onOperationRemove,
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
          operation={operation}
          index={index}
          onChange={(changes) => onOperationChange(operation.id, changes)}
          onRemove={() => onOperationRemove(operation.id)}
        />
      ))}
    </div>
  );
};
