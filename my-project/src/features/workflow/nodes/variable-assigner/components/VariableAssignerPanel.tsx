import { FC } from 'react';
import { Card, CardHeader, CardContent } from '@shared/components/card';
import { Switch } from '@shared/components/switch';
import { Button } from '@shared/components/button';
import { Badge } from '@shared/components/badge';
import { PlusIcon } from 'lucide-react';
import { useVariableAssigner } from '../hooks/useVariableAssigner';
import { VarGroupItem } from './VarGroupItem';

interface VariableAssignerPanelProps {
  nodeId: string;
}

export const VariableAssignerPanel: FC<VariableAssignerPanelProps> = ({
  nodeId,
}) => {
  const {
    nodeData,
    isGroupMode,
    handleToggleGroupMode,
    handleAddGroup,
  } = useVariableAssigner(nodeId);

  if (!nodeData) return null;

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Variable Groups</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isGroupMode ? (
            <VarGroupItem
              nodeId={nodeId}
              groupEnabled={false}
              outputType={nodeData.output_type}
              variables={nodeData.variables}
            />
          ) : (
            <>
              {nodeData.advanced_settings.groups.map(group => (
                <VarGroupItem
                  key={group.groupId}
                  nodeId={nodeId}
                  groupId={group.groupId}
                  groupEnabled={true}
                  groupName={group.group_name}
                  outputType={group.output_type}
                  variables={group.variables}
                  canRemove={nodeData.advanced_settings.groups.length > 1}
                />
              ))}

              <Button
                variant="outline"
                onClick={handleAddGroup}
                className="w-full"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Group
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="font-medium">Group Mode</p>
            <p className="text-sm text-gray-500">
              Manage multiple independent variable groups
            </p>
          </div>
          <Switch
            checked={isGroupMode}
            onCheckedChange={handleToggleGroupMode}
          />
        </CardContent>
      </Card>

      {isGroupMode && (
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold">Output Variables</h3>
          </CardHeader>
          <CardContent className="space-y-2">
            {nodeData.advanced_settings.groups.map(group => (
              <div
                key={group.groupId}
                className="flex items-center justify-between text-sm"
              >
                <code className="bg-gray-100 px-2 py-1 rounded">
                  {group.group_name}.output
                </code>
                <Badge variant="secondary">{group.output_type}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
