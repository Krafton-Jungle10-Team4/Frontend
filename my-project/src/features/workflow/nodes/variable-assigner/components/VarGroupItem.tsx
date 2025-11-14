import { FC, useState } from 'react';
import { Card } from '@shared/components/card';
import { Button } from '@shared/components/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/select';
import { Trash2Icon, PlusIcon } from 'lucide-react';
import { VarType, type ValueSelector } from '../types';
import { useVariableAssigner } from '../hooks/useVariableAssigner';
import { VarList } from './VarList';
import { GroupHeaderInput } from './GroupHeaderInput';
import { VariablePicker } from './VariablePicker';

interface VarGroupItemProps {
  nodeId: string;
  groupEnabled: boolean;
  outputType: VarType;
  variables: ValueSelector[];
  groupId?: string;
  groupName?: string;
  canRemove?: boolean;
}

export const VarGroupItem: FC<VarGroupItemProps> = ({
  nodeId,
  groupEnabled,
  outputType,
  variables,
  groupId,
  groupName,
  canRemove = false,
}) => {
  const {
    handleRemoveGroup,
    handleRenameGroup,
    handleSetOutputType,
    handleSetGroupOutputType,
  } = useVariableAssigner(nodeId);
  const [showVariablePicker, setShowVariablePicker] = useState(false);

  const handleRemove = () => {
    if (groupId) {
      handleRemoveGroup(groupId);
    }
  };

  const handleOutputTypeChange = (type: string) => {
    if (groupEnabled && groupId) {
      handleSetGroupOutputType(groupId, type as VarType);
    } else {
      handleSetOutputType(type as VarType);
    }
  };

  return (
    <Card className="p-4 space-y-3">
      {groupEnabled && groupId && groupName && (
        <div className="flex items-center justify-between">
          <GroupHeaderInput
            value={groupName}
            onChange={newName => handleRenameGroup(groupId, newName)}
          />
          {canRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2Icon className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}

      <div>
        <label className="text-sm font-medium mb-1 block">Output Type</label>
        <Select value={outputType} onValueChange={handleOutputTypeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(VarType).map(type => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Variables</label>
        <VarList
          nodeId={nodeId}
          variables={variables}
          groupId={groupId}
        />
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowVariablePicker(true)}
        className="w-full"
      >
        <PlusIcon className="w-4 h-4 mr-2" />
        Add Variable
      </Button>

      {showVariablePicker && (
        <VariablePicker
          nodeId={nodeId}
          groupId={groupId}
          filterType={outputType}
          onClose={() => setShowVariablePicker(false)}
        />
      )}
    </Card>
  );
};
