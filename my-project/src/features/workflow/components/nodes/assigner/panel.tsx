/**
 * Assigner 노드 설정 패널
 *
 * 변수 조작 작업 목록 관리
 */

import { Plus } from 'lucide-react';
import { useWorkflowStore } from '../../../stores/workflowStore';
import { BasePanel } from '../_base/base-panel';
import { Box, Group } from '../_base/components/layout';
import { Button } from '@shared/components/button';
import { OperationList } from './OperationList';
import type {
  AssignerNodeType,
  AssignerOperation,
  WriteMode,
  AssignerInputType,
} from '@/shared/types/workflow.types';
import { generateAssignerPortSchema } from './utils/portSchemaGenerator';
import type { NodeVariableMappings, NodePortSchema } from '@shared/types/workflow';
import type { ValueSelector } from '@shared/types/workflow';

const filterMappingsByPorts = (
  mappings: NodeVariableMappings | undefined,
  ports?: NodePortSchema
): NodeVariableMappings | undefined => {
  if (!mappings || !ports) {
    return mappings;
  }

  const allowed = new Set((ports.inputs || []).map((port) => port.name));
  const next: NodeVariableMappings = {};

  Object.entries(mappings).forEach(([key, mapping]) => {
    if (allowed.has(key)) {
      next[key] = mapping;
    }
  });

  return Object.keys(next).length ? next : undefined;
};

export const AssignerPanel = () => {
  const { selectedNodeId, nodes, updateNode } = useWorkflowStore();

  const node = nodes.find((n) => n.id === selectedNodeId);

  if (!node) return null;

  const assignerData = node.data as AssignerNodeType;
  const variableMappings = (assignerData.variable_mappings || {}) as NodeVariableMappings;

  const handleVariableMappingChange = (portName: string, selector: ValueSelector | null) => {
    const nextMappings: NodeVariableMappings = { ...variableMappings };
    if (selector) {
      nextMappings[portName] = {
        target_port: portName,
        source: selector,
      };
    } else {
      delete nextMappings[portName];
    }

    updateNode(selectedNodeId!, {
      variable_mappings: Object.keys(nextMappings).length ? nextMappings : undefined,
    } as any);
  };

  const handleAddOperation = () => {
    const newOperationId = `op_${Date.now()}`;

    // 새 작업 추가
    const newOperation: AssignerOperation = {
      id: newOperationId,
      write_mode: 'over-write' as WriteMode,
      input_type: 'variable' as AssignerInputType,
      constant_value: null,
    };

    const updatedOperations = [...(assignerData.operations || []), newOperation];

    // 포트 동적 생성
    const updatedPorts = generateAssignerPortSchema(updatedOperations);

    const filteredMappings = filterMappingsByPorts(variableMappings, updatedPorts);

    updateNode(selectedNodeId!, {
      operations: updatedOperations,
      ports: updatedPorts,
      variable_mappings: filteredMappings,
    });
  };

  const handleOperationChange = (
    operationId: string,
    changes: Partial<AssignerOperation>
  ) => {
    const updatedOperations = assignerData.operations?.map((op) =>
      op.id === operationId ? { ...op, ...changes } : op
    );

    // 포트 재생성 (input_type 변경 시 value 포트 유무가 바뀔 수 있음)
    const updatedPorts = generateAssignerPortSchema(updatedOperations || []);

    const filteredMappings = filterMappingsByPorts(variableMappings, updatedPorts);

    updateNode(selectedNodeId!, {
      operations: updatedOperations,
      ports: updatedPorts,
      variable_mappings: filteredMappings,
    });
  };

  const handleOperationRemove = (operationId: string) => {
    const operationIndex = assignerData.operations?.findIndex(
      (op) => op.id === operationId
    );

    if (operationIndex === -1) return;

    const updatedOperations = assignerData.operations?.filter(
      (op) => op.id !== operationId
    );

    // 포트 재생성 (해당 operation의 포트들이 제거됨)
    const updatedPorts = generateAssignerPortSchema(updatedOperations || []);

    const filteredMappings = filterMappingsByPorts(variableMappings, updatedPorts);

    updateNode(selectedNodeId!, {
      operations: updatedOperations,
      ports: updatedPorts,
      variable_mappings: filteredMappings,
    });
  };

  return (
    <BasePanel>
      <Box>
        <Group
          title="작업 목록"
          description="변수를 조작할 작업을 추가하세요"
        >
          {/* 작업이 없을 때 안내 메시지 */}
          {assignerData.operations?.length === 0 ? (
            <div className="text-sm text-gray-400 italic py-4 text-center">
              작업을 추가하여 시작하세요
            </div>
          ) : (
            <OperationList
              nodeId={selectedNodeId!}
              operations={assignerData.operations || []}
              variableMappings={variableMappings}
              onOperationChange={handleOperationChange}
              onOperationRemove={handleOperationRemove}
              onVariableMappingChange={handleVariableMappingChange}
            />
          )}

          {/* 작업 추가 버튼 */}
          <Button onClick={handleAddOperation} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-1" />
            작업 추가
          </Button>
        </Group>
      </Box>
    </BasePanel>
  );
};
