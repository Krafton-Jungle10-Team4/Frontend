import { VarReferencePicker } from '@/features/workflow/components/variable/VarReferencePicker';
import { useAvailableVariables } from '@/features/workflow/hooks/useAvailableVariables';
import { VarType } from '@/shared/types/workflow.types';
import { PortType, type ValueSelector } from '@/shared/types/workflow';

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

  const selectedVariable = variables.find((v) => v.fullPath === value);
  const currentSelector: ValueSelector | null = selectedVariable
    ? { variable: selectedVariable.fullPath, value_type: selectedVariable.type }
    : value
    ? { variable: value, value_type: PortType.ANY }
    : null;

  const handleChange = (selector: ValueSelector | null) => {
    if (!selector) {
      onChange('', VarType.STRING);
      return;
    }
    const matched = variables.find((v) => v.fullPath === selector.variable);
    const varType = matched ? portTypeToVarType(matched.type) : VarType.STRING;
    onChange(selector.variable, varType);
  };

  return (
    <VarReferencePicker
      nodeId={nodeId}
      portName="if-else-variable"
      portType={PortType.ANY}
      value={currentSelector}
      onChange={handleChange}
      placeholder="변수"
    />
  );
}
