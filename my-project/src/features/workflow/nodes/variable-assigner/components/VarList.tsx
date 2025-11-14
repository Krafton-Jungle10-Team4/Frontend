import { FC } from 'react';
import { Button } from '@shared/components/button';
import { XIcon } from 'lucide-react';
import type { ValueSelector } from '../types';
import { useVariableAssigner } from '../hooks/useVariableAssigner';

interface VarListProps {
  nodeId: string;
  variables: ValueSelector[];
  groupId?: string;
}

export const VarList: FC<VarListProps> = ({ nodeId, variables, groupId }) => {
  const { handleRemoveVariable } = useVariableAssigner(nodeId);

  if (variables.length === 0) {
    return (
      <div className="text-sm text-gray-400 text-center py-4 border-2 border-dashed rounded">
        No variables selected
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {variables.map((variable, index) => {
        const displayPath = variable.join('.');

        return (
          <div
            key={index}
            className="flex items-center justify-between bg-gray-50 p-2 rounded"
          >
            <code className="text-sm">{displayPath}</code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveVariable(variable, groupId)}
              className="text-gray-500 hover:text-red-500"
            >
              <XIcon className="w-4 h-4" />
            </Button>
          </div>
        );
      })}
    </div>
  );
};
