/**
 * Start 노드 설정 패널
 *
 * 워크플로우 메타데이터 설정 (제목, 설명)
 */

import { useWorkflowStore } from '../../../stores/workflowStore';
import { BasePanel } from '../_base/base-panel';
import { Box, Group, Field } from '../_base/components/layout';
import { Input } from '@shared/components/input';
import { Textarea } from '@shared/components/textarea';
import type { StartNodeType } from '@/shared/types/workflow.types';

export const StartPanel = () => {
  const { selectedNodeId, nodes, updateNode } = useWorkflowStore();

  const node = nodes.find((n) => n.id === selectedNodeId);

  if (!node) return null;

  const startData = node.data as StartNodeType;

  const handleUpdate = (field: string, value: unknown) => {
    updateNode(selectedNodeId!, { [field]: value });
  };

  return (
    <BasePanel>
      <Box>
        <Group title="기본 설정" description="워크플로우 시작점 정보를 설정하세요">
          <Field label="제목" required>
            <Input
              value={startData.title || ''}
              onChange={(e) => handleUpdate('title', e.target.value)}
              placeholder="워크플로우 시작"
            />
          </Field>

          <Field label="설명">
            <Textarea
              value={startData.desc || ''}
              onChange={(e) => handleUpdate('desc', e.target.value)}
              rows={3}
              placeholder="이 워크플로우에 대한 설명을 입력하세요..."
            />
          </Field>
        </Group>
      </Box>
    </BasePanel>
  );
};
