import type { FC } from 'react';
import { useMemo } from 'react';
import { useWorkflowStore } from '@/features/workflow/stores/workflowStore';
import { Alert, AlertDescription } from '@shared/components/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface ValidationStatusProps {
  nodeId: string;
  template: string;
}

export const ValidationStatus: FC<ValidationStatusProps> = ({
  nodeId,
  template,
}) => {
  const { nodes } = useWorkflowStore();

  const validation = useMemo(() => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. 템플릿 비어있음
    if (!template.trim()) {
      errors.push('템플릿이 비어있습니다');
      return { isValid: false, errors, warnings };
    }

    // 2. 변수 참조 추출
    const varPattern = /\{\{\s*([-\w]+\.[-\w]+)\s*\}\}/g;
    const matches = [...template.matchAll(varPattern)];
    const variables = matches.map((m) => m[1]);

    if (variables.length === 0) {
      warnings.push('변수가 없습니다. 정적 텍스트만 출력됩니다.');
    }

    // 3. 참조된 노드 존재 확인
    const nodeIds = new Set(nodes.map((n) => n.id));
    for (const varRef of variables) {
      const [refNodeId, portName] = varRef.split('.');

      if (!nodeIds.has(refNodeId)) {
        errors.push(`존재하지 않는 노드 '${refNodeId}' 참조`);
        continue;
      }

      // 4. 포트 존재 확인
      const refNode = nodes.find((n) => n.id === refNodeId);
      if (refNode?.data.ports?.outputs) {
        const portNames = refNode.data.ports.outputs.map((p) => p.name);
        if (!portNames.includes(portName)) {
          errors.push(
            `노드 '${refNodeId}'에 출력 포트 '${portName}'가 없습니다`
          );
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }, [template, nodes, nodeId]);

  if (validation.isValid && validation.warnings.length === 0) {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertDescription>유효한 템플릿입니다</AlertDescription>
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
