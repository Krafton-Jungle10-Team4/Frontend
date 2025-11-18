import { useState, useRef, useCallback } from 'react';
import { useWorkflowStore } from '../../../stores/workflowStore';
import { BasePanel } from '../_base/base-panel';
import { Box, Group, Field } from '../_base/components/layout';
import { Textarea } from '@shared/components/textarea';
import type { AnswerNodeType } from '@/shared/types/workflow.types';
import { VariableSelector } from './VariableSelector';
import { ValidationStatus } from './ValidationStatus';
import { TemplateSyntaxHint } from '../common/TemplateSyntaxHint';

export const AnswerPanel = () => {
  const { selectedNodeId, nodes, updateNode } = useWorkflowStore();
  if (!selectedNodeId) return null;

  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node) return null;

  const answerData = node.data as AnswerNodeType;

  return (
    <AnswerPanelContent
      key={selectedNodeId}
      nodeId={selectedNodeId}
      answerData={answerData}
      updateNode={updateNode}
    />
  );
};

interface AnswerPanelContentProps {
  nodeId: string;
  answerData: AnswerNodeType;
  updateNode: ReturnType<typeof useWorkflowStore>['updateNode'];
}

function AnswerPanelContent({
  nodeId,
  answerData,
  updateNode,
}: AnswerPanelContentProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [template, setTemplate] = useState(answerData.template || '');
  const [description, setDescription] = useState(
    answerData.description || ''
  );

  // 변수 삽입 핸들러
  const handleInsertVariable = useCallback(
    (variable: string) => {
      if (!textareaRef.current) return;

      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // 커서 위치에 변수 삽입
      const before = template.substring(0, start);
      const after = template.substring(end);
      const newTemplate = `${before}{{${variable}}}${after}`;

      setTemplate(newTemplate);

      // 데이터 업데이트
      updateNode(nodeId, {
        template: newTemplate,
      });

      // 커서 위치 조정
      const newPosition = start + variable.length + 4; // {{}}
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newPosition, newPosition);
      }, 0);
    },
    [template, nodeId, updateNode]
  );

  // 템플릿 변경 핸들러
  const handleTemplateChange = useCallback(
    (value: string) => {
      setTemplate(value);
      updateNode(nodeId, {
        template: value,
      });
    },
    [nodeId, updateNode]
  );

  // 설명 변경 핸들러
  const handleDescriptionChange = useCallback(
    (value: string) => {
      setDescription(value);
      updateNode(nodeId, {
        description: value,
      });
    },
    [nodeId, updateNode]
  );

  return (
    <BasePanel>
      <Box>
        <Group
          title="응답 템플릿"
          description="워크플로우의 최종 응답을 정의합니다"
        >
          {/* 템플릿 에디터 */}
          <Field label="템플릿" required>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  변수를 삽입하려면 아래 버튼을 클릭하세요
                </span>
                <VariableSelector nodeId={nodeId} onSelect={handleInsertVariable} />
              </div>
              <Textarea
                ref={textareaRef}
                value={template}
                onChange={(e) => handleTemplateChange(e.target.value)}
                placeholder="변수 선택기를 사용하여 사용 가능한 변수를 삽입하세요&#10;&#10;예: {{1763305619209.response}}&#10;또는 변수 선택기에서 직접 선택"
                rows={10}
                className="font-mono text-sm"
              />
              <TemplateSyntaxHint />
            </div>
          </Field>

          {/* 설명 (선택) */}
          <Field label="설명 (선택)">
            <Textarea
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="이 Answer 노드의 용도를 설명하세요"
              rows={2}
            />
          </Field>

          {/* 유효성 검사 상태 */}
          <div className="mt-4">
            <ValidationStatus nodeId={nodeId} template={template} />
          </div>
        </Group>
      </Box>
    </BasePanel>
  );
}
