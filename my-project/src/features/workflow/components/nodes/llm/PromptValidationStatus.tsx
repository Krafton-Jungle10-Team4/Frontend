/**
 * LLM 노드 프롬프트 검증 상태 컴포넌트
 * 
 * 프롬프트에 사용된 변수의 유효성을 검증하고 표시합니다.
 * - {{nodeId.portName}} 형식 지원
 * - {{portName}} 형식 지원 (입력 포트 이름만 사용)
 */

import type { FC } from 'react';
import { useMemo } from 'react';
import { useWorkflowStore } from '@/features/workflow/stores/workflowStore';
import { Alert, AlertDescription } from '@shared/components/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import {
  resolvePromptVariables,
  type ResolvedVariable,
} from '@/features/workflow/utils/promptVariableResolver';

interface PromptValidationStatusProps {
  nodeId: string;
  prompt: string;
}

export const PromptValidationStatus: FC<PromptValidationStatusProps> = ({
  nodeId,
  prompt,
}) => {
  const { nodes, edges } = useWorkflowStore();

  const validation = useMemo(() => {
    if (!prompt.trim()) {
      return {
        isValid: false,
        errors: ['프롬프트가 비어있습니다'],
        warnings: [],
        resolvedVariables: [] as ResolvedVariable[],
      };
    }

    const currentNode = nodes.find((n) => n.id === nodeId);
    if (!currentNode) {
      return {
        isValid: false,
        errors: ['현재 노드를 찾을 수 없습니다'],
        warnings: [],
        resolvedVariables: [] as ResolvedVariable[],
      };
    }

    const variableMappings = currentNode.data.variable_mappings;
    const resolvedVariables = resolvePromptVariables(
      prompt,
      nodeId,
      nodes,
      edges,
      variableMappings
    );

    const errors: string[] = [];
    const warnings: string[] = [];

    // 변수가 없는 경우 경고
    if (resolvedVariables.length === 0) {
      warnings.push('변수가 없습니다. 정적 텍스트만 출력됩니다.');
    }

    // 해석 실패한 변수 확인
    const invalidVariables = resolvedVariables.filter((v) => !v.isValid);
    invalidVariables.forEach((v) => {
      errors.push(
        `변수 '{{${v.original}}}' ${v.error || '형식이 잘못되었습니다'}`
      );
    });

    // 해석 성공한 변수 중 포트 이름만 사용한 경우 정보 제공
    const portOnlyVariables = resolvedVariables.filter(
      (v) => v.isValid && !v.original.includes('.')
    );
    if (portOnlyVariables.length > 0) {
      warnings.push(
        `입력 포트 이름만 사용한 변수 ${portOnlyVariables.length}개가 자동으로 연결되었습니다`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      resolvedVariables,
    };
  }, [prompt, nodes, edges, nodeId]);

  if (validation.isValid && validation.warnings.length === 0) {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertDescription>유효한 프롬프트입니다</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-2">
      {validation.errors.map((error, i) => (
        <Alert key={i} variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ))}
      {validation.warnings.map((warning, i) => (
        <Alert key={i}>
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertDescription>{warning}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
};

