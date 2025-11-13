/**
 * Template Transform 노드 설정 패널
 *
 * 템플릿 기반 텍스트 변환 설정
 */

import { useWorkflowStore } from '../../../stores/workflowStore';
import { BasePanel } from '../_base/base-panel';
import { Box, Group, Field } from '../_base/components/layout';
import { Textarea } from '@shared/components/textarea';
import { RadioGroup, RadioGroupItem } from '@shared/components/radio-group';
import { Label } from '@shared/components/label';
import type { TemplateTransformNodeType } from '@/shared/types/workflow.types';

export const TemplateTransformPanel = () => {
  const { selectedNodeId, nodes, updateNode } = useWorkflowStore();

  const node = nodes.find((n) => n.id === selectedNodeId);

  if (!node) return null;

  const templateData = node.data as TemplateTransformNodeType;

  const handleUpdate = (field: string, value: unknown) => {
    updateNode(selectedNodeId!, { [field]: value });
  };

  return (
    <BasePanel>
      <Box>
        <Group title="템플릿 설정" description="변환할 템플릿을 작성하세요">
          <Field label="템플릿" required>
            <Textarea
              value={templateData.template || ''}
              onChange={(e) => handleUpdate('template', e.target.value)}
              placeholder="안녕하세요, {{user_name}}님!"
              rows={6}
            />
          </Field>

          <Field label="출력 형식">
            <RadioGroup
              value={templateData.outputFormat || 'plain'}
              onValueChange={(value) => handleUpdate('outputFormat', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="plain" id="plain" />
                <Label htmlFor="plain">일반 텍스트</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="markdown" id="markdown" />
                <Label htmlFor="markdown">Markdown</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json">JSON</Label>
              </div>
            </RadioGroup>
          </Field>
        </Group>
      </Box>
    </BasePanel>
  );
};
