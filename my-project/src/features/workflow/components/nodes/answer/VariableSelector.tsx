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
  const { nodes } = useWorkflowStore();

  // 현재 노드보다 앞에 있는 노드들의 출력 포트 수집
  const availableVariables = useMemo(() => {
    // 현재 노드 인덱스 찾기
    const currentIndex = nodes.findIndex((n) => n.id === nodeId);
    if (currentIndex === -1) return [];

    // 앞쪽 노드들만 필터링
    const upstreamNodes = nodes.slice(0, currentIndex);

    // 각 노드의 출력 포트 수집
    const variables: Array<{
      nodeId: string;
      nodeTitle: string;
      nodeType: string;
      ports: Array<{ name: string; displayName: string; type: string }>;
    }> = [];

    upstreamNodes.forEach((node) => {
      if (node.data.ports?.outputs && node.data.ports.outputs.length > 0) {
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
  }, [nodes, nodeId]);

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
