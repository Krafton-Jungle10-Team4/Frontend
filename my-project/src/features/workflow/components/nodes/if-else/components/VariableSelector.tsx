import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/select';
import { useAvailableVariables } from '@/features/workflow/hooks/useAvailableVariables';
import { VarType } from '@/shared/types/workflow.types';
import { PortType } from '@/shared/types/workflow';

interface VariableSelectorProps {
  nodeId: string;
  value: string;
  onChange: (variable: string, varType: VarType) => void;
}

/**
 * PortType을 VarType으로 변환
 */
function portTypeToVarType(portType: PortType): VarType {
  switch (portType) {
    case PortType.STRING:
      return VarType.STRING;
    case PortType.NUMBER:
      return VarType.NUMBER;
    case PortType.BOOLEAN:
      return VarType.BOOLEAN;
    default:
      return VarType.STRING;
  }
}

export function VariableSelector({ nodeId, value, onChange }: VariableSelectorProps) {
  const variables = useAvailableVariables(nodeId);

  const handleChange = (variableKey: string) => {
    const variable = variables.find((v) => v.fullPath === variableKey);
    if (variable) {
      const varType = portTypeToVarType(variable.type);
      onChange(variable.fullPath, varType);
    }
  };

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="변수 선택..." />
      </SelectTrigger>
      <SelectContent>
        {variables.length === 0 ? (
          <SelectItem value="empty" disabled>
            사용 가능한 변수 없음
          </SelectItem>
        ) : (
          variables.map((variable) => (
            <SelectItem key={variable.fullPath} value={variable.fullPath}>
              <div className="flex items-center gap-2">
                <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded font-mono">
                  {portTypeToVarType(variable.type)}
                </span>
                <span className="text-xs text-gray-500">{variable.nodeTitle}</span>
                <span>·</span>
                <span>{variable.portDisplayName || variable.portName}</span>
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
