import type { FC } from 'react';
import { useMemo } from 'react';
import { useWorkflowStore } from '@/features/workflow/stores/workflowStore';
import { Alert, AlertDescription } from '@shared/components/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import type { Node, Edge } from '@/shared/types/workflow.types';

interface ValidationStatusProps {
  nodeId: string;
  template: string;
}

/**
 * Upstream 노드 찾기 (VariableSelector와 동일한 로직)
 */
function getUpstreamNodes(
  nodeId: string,
  nodes: Node[],
  edges: Edge[]
): Set<string> {
  const upstreamIds = new Set<string>();
  const queue = [nodeId];
  const visited = new Set<string>([nodeId]);

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    // 현재 노드로 들어오는 모든 엣지 찾기
    const incomingEdges = edges.filter((edge) => edge.target === currentId);

    incomingEdges.forEach((edge) => {
      const sourceId = edge.source;
      if (!visited.has(sourceId)) {
        visited.add(sourceId);
        upstreamIds.add(sourceId);
        queue.push(sourceId); // 재귀적으로 upstream 탐색
      }
    });
  }

  return upstreamIds;
}

/**
 * 사용 가능한 변수 목록 생성 (VariableSelector와 동일한 로직)
 */
function getAvailableVariables(
  nodeId: string,
  nodes: Node[],
  edges: Edge[]
): Set<string> {
  const upstreamIds = getUpstreamNodes(nodeId, nodes, edges);
  const availableVars = new Set<string>();

  nodes.forEach((node) => {
    // Upstream 노드이고 출력 포트가 있는 경우만
    if (
      upstreamIds.has(node.id) &&
      node.data.ports?.outputs &&
      node.data.ports.outputs.length > 0
    ) {
      node.data.ports.outputs.forEach((port) => {
        availableVars.add(`${node.id}.${port.name}`);
      });
    }
  });

  return availableVars;
}

export const ValidationStatus: FC<ValidationStatusProps> = ({
  nodeId,
  template,
}) => {
  const { nodes, edges } = useWorkflowStore();

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

    // 3. 사용 가능한 변수 목록 계산 (VariableSelector와 동일한 로직)
    const availableVariables = getAvailableVariables(nodeId, nodes, edges);

    // 4. 참조된 노드 존재 확인 및 검증
    const nodeIds = new Set(nodes.map((n) => n.id));
    for (const varRef of variables) {
      const [refNodeId, portName] = varRef.split('.');

      // 4-1. 노드 ID 존재 확인
      if (!nodeIds.has(refNodeId)) {
        errors.push(`존재하지 않는 노드 '${refNodeId}' 참조`);
        continue;
      }

      // 4-2. 노드 찾기
      const refNode = nodes.find((n) => n.id === refNodeId);
      if (!refNode) {
        errors.push(`노드 '${refNodeId}'를 찾을 수 없습니다`);
        continue;
      }

      // 4-3. 출력 포트 존재 확인
      const outputPorts = refNode.data.ports?.outputs || [];
      const portNames = outputPorts.map((p) => p.name);
      
      if (!portNames.includes(portName)) {
        const availablePorts = portNames.length > 0 
          ? `사용 가능한 포트: ${portNames.join(', ')}`
          : '이 노드는 출력 포트가 없습니다';
        errors.push(
          `노드 '${refNodeId}'에 출력 포트 '${portName}'가 없습니다. ${availablePorts}`
        );
        continue;
      }

      // 4-4. 실제 사용 가능한 변수인지 확인 (VariableSelector와 동일한 검증)
      const varKey = `${refNodeId}.${portName}`;
      if (!availableVariables.has(varKey)) {
        // Upstream 노드가 아닌 경우
        const upstreamIds = getUpstreamNodes(nodeId, nodes, edges);
        if (!upstreamIds.has(refNodeId)) {
          errors.push(
            `노드 '${refNodeId}'는 현재 노드에서 접근할 수 없는 노드입니다. ` +
            `변수 선택기를 사용하여 사용 가능한 변수만 선택하세요.`
          );
        } else {
          // Upstream 노드이지만 포트가 없는 경우 (이론적으로 발생하지 않아야 함)
          errors.push(
            `변수 '${varKey}'는 현재 노드에서 사용할 수 없습니다. ` +
            `변수 선택기를 사용하여 올바른 변수를 선택하세요.`
          );
        }
        continue;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }, [template, nodes, edges, nodeId]);

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
