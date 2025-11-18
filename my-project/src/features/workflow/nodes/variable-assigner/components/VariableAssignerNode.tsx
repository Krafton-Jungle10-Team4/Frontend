import { FC, useMemo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@shared/components/card';
import { Badge } from '@shared/components/badge';
import { useVariableAssigner } from '../hooks/useVariableAssigner';

interface VariableAssignerNodeProps {
  id: string;
  data: any;
}

export const VariableAssignerNode: FC<VariableAssignerNodeProps> = ({
  id,
}) => {
  const { nodeData, isGroupMode } = useVariableAssigner(id);

  const groups = useMemo(() => {
    if (!nodeData) return [];

    if (!isGroupMode) {
      return [
        {
          inputHandleId: 'input',
          outputHandleId: 'output',
          title: 'Variable Assigner',
          type: nodeData.output_type,
          variableCount: nodeData.variables.length,
        },
      ];
    }

    return nodeData.advanced_settings.groups.map(group => ({
      inputHandleId: `${group.group_name}.input`,
      outputHandleId: `${group.group_name}.output`,
      title: group.group_name,
      type: group.output_type,
      variableCount: group.variables.length,
    }));
  }, [nodeData, isGroupMode]);

  if (!nodeData) return null;

  return (
    <div className="space-y-1">
      {groups.map(group => (
        <Card
          key={group.outputHandleId}
          className="min-w-[200px] p-3 shadow-md hover:shadow-lg transition-shadow"
        >
          <Handle
            type="target"
            position={Position.Left}
            id={group.inputHandleId}
            className="!bg-blue-500"
          />

          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm">{group.title}</h4>
            <Badge variant="secondary">{group.type}</Badge>
          </div>

          <p className="text-xs text-gray-500">
            {group.variableCount} variable{group.variableCount !== 1 ? 's' : ''}
          </p>

          <Handle
            type="source"
            position={Position.Right}
            id={group.outputHandleId}
            className="!bg-green-500"
          />
        </Card>
      ))}
    </div>
  );
};
