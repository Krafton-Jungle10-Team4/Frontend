import { useMemo } from 'react';
import { ScrollArea } from '@shared/components/scroll-area';
import { Separator } from '@shared/components/separator';
import { VariableTag } from './VariableTag';
import { useVariablePoolStore } from '../../stores/variablePoolStore';
import { useWorkflowStore } from '../../stores/workflowStore';
import { PortDefinition } from '@shared/types/workflow/port.types';
import { cn } from '@shared/utils/cn';

interface OutputVarListProps {
  nodeId: string;
  className?: string;
  /**
   * Whether to show real-time values from variable pool
   * Only works during/after workflow execution
   */
  showValues?: boolean;
  /**
   * Whether to show empty state when no outputs
   */
  showEmptyState?: boolean;
}

export function OutputVarList({
  nodeId,
  className,
  showValues = false,
  showEmptyState = true,
}: OutputVarListProps) {
  const node = useWorkflowStore((state) =>
    state.nodes.find((n) => n.id === nodeId)
  );

  const getNodeOutput = useVariablePoolStore((state) => state.getNodeOutput);

  const outputsWithValues = useMemo(() => {
    if (!node?.ports?.outputs) return [];

    return node.ports.outputs.map((output: PortDefinition) => {
      const value = showValues ? getNodeOutput(nodeId, output.name) : undefined;
      const hasValue = value !== undefined;

      return {
        port: output,
        value,
        hasValue,
        fullPath: `${nodeId}.${output.name}`,
      };
    });
  }, [node, nodeId, showValues, getNodeOutput]);

  if (outputsWithValues.length === 0 && !showEmptyState) {
    return null;
  }

  if (outputsWithValues.length === 0) {
    return (
      <div className={cn('text-sm text-muted-foreground', className)}>
        이 노드는 출력 변수가 없습니다.
      </div>
    );
  }

  return (
    <ScrollArea className={cn('max-h-[300px]', className)}>
      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground">
          출력 변수 ({outputsWithValues.length})
        </div>
        <Separator />
        <div className="space-y-1.5">
          {outputsWithValues.map(({ port, value, hasValue, fullPath }) => (
            <VariableTag
              key={port.name}
              nodeId={nodeId}
              port={port}
              value={value}
              hasValue={hasValue}
              fullPath={fullPath}
              showCopyButton
              showInspectButton={hasValue}
            />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
