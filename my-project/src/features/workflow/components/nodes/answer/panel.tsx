/**
 * Answer 노드 설정 패널
 *
 * 최종 응답 생성 설정 (응답 변수, 응답 타입)
 */

import { useWorkflowStore } from '../../../stores/workflowStore';
import { BasePanel } from '../_base/base-panel';
import { Box, Group, Field } from '../_base/components/layout';
import { Input } from '@shared/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/select';
import type { AnswerNodeType } from '@/shared/types/workflow.types';

export const AnswerPanel = () => {
  const { selectedNodeId, nodes, updateNode } = useWorkflowStore();

  const node = nodes.find((n) => n.id === selectedNodeId);

  if (!node) return null;

  const answerData = node.data as AnswerNodeType;

  const handleUpdate = (field: string, value: unknown) => {
    updateNode(selectedNodeId!, { [field]: value });
  };

  return (
    <BasePanel>
      <Box>
        <Group title="응답 설정" description="워크플로우 최종 응답을 설정하세요">
          <Field label="응답 변수" required>
            <Input
              value={answerData.responseVariable || ''}
              onChange={(e) => handleUpdate('responseVariable', e.target.value)}
              placeholder="{{llm.result}}"
            />
          </Field>

          <Field label="응답 타입">
            <Select
              value={answerData.responseType || 'text'}
              onValueChange={(value) => handleUpdate('responseType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="타입 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">텍스트</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="markdown">Markdown</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </Group>
      </Box>
    </BasePanel>
  );
};
