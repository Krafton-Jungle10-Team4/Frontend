/**
 * ImportedWorkflowNode - 템플릿을 표현하는 노드
 */
import { memo, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { Button } from '@/shared/components/button';
import type { ImportedWorkflowNodeData } from '../../../types/import-node.types';
import { CollapsedView } from './CollapsedView';
import { ExpandedView } from './ExpandedView';
import { useWorkflowStore } from '../../../stores/workflowStore';
import BaseNode from '../_base/node';

export const ImportedWorkflowNode = memo(
  ({ id, data, selected }: NodeProps<ImportedWorkflowNodeData>) => {
    const updateNode = useWorkflowStore((state) => state.updateNode);
    const isExpanded = data.is_expanded ?? false;

    const handleToggleExpand = useCallback(() => {
      updateNode(id, {
        is_expanded: !isExpanded,
      });
    }, [id, isExpanded, updateNode]);

    // 커스텀 헤더 컴포넌트
    const customHeader = (
      <>
        {/* Read-only indicator */}
        <div className="absolute top-2 left-2 z-10">
          <Lock className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b bg-muted/50 rounded-t-[13px]">
          <div className="flex-1 pr-2 pl-6">
            <h3 className="font-semibold text-sm truncate">{data.title}</h3>
            <p className="text-xs text-muted-foreground">
              v{data.template_version}
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleToggleExpand}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </>
    );

    return (
      <BaseNode
        id={id}
        data={data}
        selected={selected}
        disableDefaultHeader={true}
      >
        <div className="relative">
          {customHeader}

          {/* Content */}
          <div className="p-3">
            {isExpanded ? (
              <ExpandedView
                nodeId={id}
                internalGraph={data.internal_graph}
                templateId={data.template_id}
              />
            ) : (
              <CollapsedView ports={data.ports} description={data.desc} />
            )}
          </div>

          {/* Input Handles */}
          {data.ports.inputs.map((input, index) => (
            <Handle
              key={`input-${input.name}`}
              type="target"
              position={Position.Left}
              id={input.name}
              className="!bg-blue-500 !border-2 !border-white !w-3 !h-3"
              style={{ top: `${60 + index * 30}px` }}
            />
          ))}

          {/* Output Handles */}
          {data.ports.outputs.map((output, index) => (
            <Handle
              key={`output-${output.name}`}
              type="source"
              position={Position.Right}
              id={output.name}
              className="!bg-green-500 !border-2 !border-white !w-3 !h-3"
              style={{ top: `${60 + index * 30}px` }}
            />
          ))}
        </div>
      </BaseNode>
    );
  }
);

ImportedWorkflowNode.displayName = 'ImportedWorkflowNode';
