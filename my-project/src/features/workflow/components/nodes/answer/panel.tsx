import { useState, useRef, useCallback, useEffect } from 'react';
import { useWorkflowStore } from '../../../stores/workflowStore';
import { BasePanel } from '../_base/base-panel';
import { Box, Group, Field } from '../_base/components/layout';
import { Label } from '@shared/components/label';
import { Textarea } from '@shared/components/textarea';
import type { AnswerNodeType } from '@/shared/types/workflow.types';
import { VariableSelector } from './VariableSelector';
import { ValidationStatus } from './ValidationStatus';
import { TemplateSyntaxHint } from '../common/TemplateSyntaxHint';

export const AnswerPanel = () => {
  const { selectedNodeId, nodes, updateNode } = useWorkflowStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const node = nodes.find((n) => n.id === selectedNodeId);

  const [template, setTemplate] = useState(
    (node?.data as AnswerNodeType)?.template || ''
  );
  const [description, setDescription] = useState(
    (node?.data as AnswerNodeType)?.description || ''
  );

  // Sync local state when selected node changes
  useEffect(() => {
    if (node?.data) {
      const answerData = node.data as AnswerNodeType;
      setTemplate(answerData.template || '');
      setDescription(answerData.description || '');
    }
  }, [selectedNodeId, node?.data]);

  if (!node || !selectedNodeId) return null;

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
      updateNode(selectedNodeId, {
        template: newTemplate,
      });

      // 커서 위치 조정
      const newPosition = start + variable.length + 4; // {{}}
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newPosition, newPosition);
      }, 0);
    },
    [template, selectedNodeId, updateNode]
  );

  // 템플릿 변경 핸들러
  const handleTemplateChange = useCallback(
    (value: string) => {
      setTemplate(value);
      updateNode(selectedNodeId, {
        template: value,
      });
    },
    [selectedNodeId, updateNode]
  );

  // 설명 변경 핸들러
  const handleDescriptionChange = useCallback(
    (value: string) => {
      setDescription(value);
      updateNode(selectedNodeId, {
        description: value,
      });
    },
    [selectedNodeId, updateNode]
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
                <VariableSelector
                  nodeId={selectedNodeId}
                  onSelect={handleInsertVariable}
                />
              </div>
              <Textarea
                ref={textareaRef}
                value={template}
                onChange={(e) => handleTemplateChange(e.target.value)}
                placeholder="예: 사용자 질문: {{start_1.user_message}}&#10;&#10;AI 답변: {{llm_1.response}}"
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
            <ValidationStatus nodeId={selectedNodeId} template={template} />
          </div>
        </Group>
      </Box>
    </BasePanel>
  );
};
