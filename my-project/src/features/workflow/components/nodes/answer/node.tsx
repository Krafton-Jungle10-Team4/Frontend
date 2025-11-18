import type { NodeProps, AnswerNodeType } from '@/shared/types/workflow.types';
import { memo } from 'react';
import { useWorkflowStore } from '../../../stores/workflowStore';

/**
 * Answer 노드
 * 워크플로우 최종 응답 생성
 * - 템플릿 미리보기 표시 (30자 제한)
 */
const AnswerNode = ({ data }: NodeProps<AnswerNodeType>) => {
  const { nodes } = useWorkflowStore();

  // 노드 ID를 사용자 친화적인 이름으로 변환하는 함수
  const formatTemplate = (template: string): string => {
    if (!template) return template;

    // {{nodeId.port}} 패턴을 찾아서 치환
    return template.replace(/\{\{(\d+)\.([^}]+)\}\}/g, (match, nodeId, portName) => {
      // 노드 ID로 노드 찾기
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return match; // 노드를 찾지 못하면 원본 유지

      // 노드 타입에서 사용자 친화적인 이름 생성
      const nodeTypeMap: Record<string, string> = {
        llm: 'LLM',
        'tavily-search': 'Search',
        'variable-assigner': 'Assigner',
        'template-transform': 'Template',
        'if-else': 'If/Else',
        'question-classifier': 'Classifier',
        start: 'Input',
        end: 'End',
      };

      const friendlyName = nodeTypeMap[node.data.type] || node.data.type.toUpperCase();
      return `{{${friendlyName}.${portName}}}`;
    });
  };

  // 템플릿 미리보기 (30자 제한)
  const formattedTemplate = formatTemplate(data.template || '');
  const preview = formattedTemplate
    ? formattedTemplate.slice(0, 30) + (formattedTemplate.length > 30 ? '...' : '')
    : '템플릿을 입력하세요';

  return (
    <div className="px-3 py-2 space-y-2">
      {/* 템플릿 미리보기 */}
      <div className="rounded-md bg-workflow-block-parma-bg px-2.5 py-1.5">
        <div className="system-2xs-regular-uppercase text-text-tertiary">
          TEMPLATE
        </div>
        <div className="system-xs-medium text-text-primary mt-1 font-mono text-xs break-all">
          {preview}
        </div>
      </div>

      {/* 설명 (선택) */}
      {data.description && (
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {data.description}
        </div>
      )}
    </div>
  );
};

export default memo(AnswerNode);
