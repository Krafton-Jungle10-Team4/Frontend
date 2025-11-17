import type { FC } from 'react';
import { useMemo } from 'react';
import { Button } from '@shared/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@shared/components/dropdown-menu';
import { useWorkflowStore } from '@/features/workflow/stores/workflowStore';
import { ChevronDown } from 'lucide-react';

interface VariableSelectorProps {
  nodeId: string;
  onSelect: (variable: string) => void;
}

export const VariableSelector: FC<VariableSelectorProps> = ({
  nodeId,
  onSelect,
}) => {
  const { nodes, edges } = useWorkflowStore();

  // Upstream 경로의 모든 노드 출력 포트 수집
  const availableVariables = useMemo(() => {
    // BFS로 현재 노드까지 도달 가능한 모든 upstream 노드 찾기
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

    // 각 노드의 출력 포트 수집
    const variables: Array<{
      nodeId: string;
      nodeTitle: string;
      nodeType: string;
      ports: Array<{ name: string; displayName: string; type: string }>;
    }> = [];

    nodes.forEach((node) => {
      // Upstream 노드이고 출력 포트가 있는 경우만
      if (
        upstreamIds.has(node.id) &&
        node.data.ports?.outputs &&
        node.data.ports.outputs.length > 0
      ) {
        variables.push({
          nodeId: node.id,
          nodeTitle: node.data.title || node.id,
          nodeType: node.data.type,
          ports: node.data.ports.outputs.map((p) => ({
            name: p.name,
            displayName: p.display_name || p.name,
            type: p.type || 'string',
          })),
        });
      }
    });

    return variables;
  }, [nodes, edges, nodeId]);

  if (availableVariables.length === 0) {
    return (
      <Button variant="outline" size="sm" disabled>
        사용 가능한 변수 없음
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          변수 삽입 <ChevronDown className="ml-1 w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 max-h-96 overflow-y-auto">
        {availableVariables.map((nodeVar, index) => (
          <div key={nodeVar.nodeId}>
            {index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel className="text-xs font-semibold">
              {nodeVar.nodeTitle} ({nodeVar.nodeType})
            </DropdownMenuLabel>
            {nodeVar.ports.map((port) => (
              <DropdownMenuItem
                key={`${nodeVar.nodeId}.${port.name}`}
                onClick={() => onSelect(`${nodeVar.nodeId}.${port.name}`)}
                className="cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{port.displayName}</span>
                  <span className="text-xs text-gray-500">
                    {port.name} ({port.type})
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
