import { useMemo, useCallback } from 'react';
import type { NodePortSchema, NodeVariableMappings } from '@shared/types/workflow';
import { Group, Field } from '../layout';
import { VarReferencePicker } from '@features/workflow/components/variable/VarReferencePicker';
import { useWorkflowStore } from '@features/workflow/stores/workflowStore';
import type { ValueSelector } from '@shared/types/workflow';

type InputMappingSectionProps = {
  nodeId: string;
  ports?: NodePortSchema;
  title?: string;
  description?: string;
};

export const InputMappingSection = ({
  nodeId,
  ports,
  title = '입력 매핑',
  description = '이 노드가 사용할 입력을 연결하세요',
}: InputMappingSectionProps) => {
  const updateNode = useWorkflowStore((state) => state.updateNode);
  const node = useWorkflowStore(
    useCallback(
      (state) => state.nodes.find((candidate) => candidate.id === nodeId),
      [nodeId]
    )
  );

  const inputPorts = useMemo(() => ports?.inputs ?? [], [ports?.inputs]);

  if (!node || inputPorts.length === 0) {
    return null;
  }

  const currentMappings =
    (node.data.variable_mappings as NodeVariableMappings | undefined) || {};

  const handleMappingChange = (portName: string, selector: ValueSelector | null) => {
    const nextMappings: NodeVariableMappings = { ...currentMappings };

    if (selector) {
      nextMappings[portName] = {
        target_port: portName,
        source: selector,
      };
    } else {
      delete nextMappings[portName];
    }

    updateNode(nodeId, { variable_mappings: nextMappings });
  };

  return (
    <Group title={title} description={description}>
      {inputPorts.map((port) => (
        <Field
          key={port.name}
          label={port.display_name}
          required={port.required}
          description={port.description || undefined}
        >
          <VarReferencePicker
            nodeId={nodeId}
            portName={port.name}
            portType={port.type}
            value={currentMappings[port.name]?.source || null}
            onChange={(selector) => handleMappingChange(port.name, selector)}
            placeholder={`${port.display_name} 변수를 선택하세요`}
          />
        </Field>
      ))}
    </Group>
  );
};
