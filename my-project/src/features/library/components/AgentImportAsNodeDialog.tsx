import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/dialog';
import { Button } from '@/shared/components/button';
import { Input } from '@/shared/components/input';
import { Badge } from '@/shared/components/badge';
import { toast } from 'sonner';
import { getLibraryAgents, getLibraryAgentDetail } from '../api/libraryApi';
import { createImportedWorkflowNode } from '@/features/workflow/utils/createImportedWorkflowNode';
import { useWorkflowStore } from '@/features/workflow/stores/workflowStore';
import type { LibraryAgentVersion } from '@/features/workflow/types/workflow.types';
import { cn } from '@/shared/utils/cn';

interface AgentImportAsNodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess?: () => void;
}

export function AgentImportAsNodeDialog({
  open,
  onOpenChange,
  onImportSuccess,
}: AgentImportAsNodeDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [agents, setAgents] = useState<LibraryAgentVersion[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<LibraryAgentVersion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const addNode = useWorkflowStore((state) => state.addNode);

  // 검색 (디바운스 적용 권장)
  const handleSearch = async () => {
    try {
      setIsLoading(true);
      const response = await getLibraryAgents({
        search: searchQuery,
      });
      setAgents(response.agents);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('검색 실패', {
        description: '에이전트 검색 중 오류가 발생했습니다.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 노드로 가져오기
  const handleImportAsNode = async () => {
    if (!selectedAgent) {
      toast.error('에이전트 미선택', {
        description: '가져올 에이전트를 선택해주세요.',
      });
      return;
    }

    try {
      setIsLoading(true);

      // 에이전트 상세 정보 조회 (graph, input_schema, output_schema 포함)
      const agentDetail = await getLibraryAgentDetail(selectedAgent.id);

      // ImportedWorkflowNode 생성
      const newNode = createImportedWorkflowNode(agentDetail, {
        x: 300,  // 캔버스 중앙 (또는 viewport 중앙 계산)
        y: 200,
      });

      // 그래프에 노드 추가
      addNode(newNode);

      toast.success('노드 추가 완료', {
        description: `${selectedAgent.library_name}이(가) 캔버스에 추가되었습니다.`,
      });

      onImportSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('가져오기 실패', {
        description: '노드 추가 중 오류가 발생했습니다.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>에이전트 노드 가져오기</DialogTitle>
          <DialogDescription>
            라이브러리 에이전트를 현재 워크플로우에 노드로 추가합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 검색 */}
          <div className="flex gap-2">
            <Input
              placeholder="에이전트 이름 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              검색
            </Button>
          </div>

          {/* 검색 결과 */}
          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {agents.map((agent) => (
              <div
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={cn(
                  "p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
                  selectedAgent?.id === agent.id && "border-primary bg-primary/5"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{agent.library_name}</h3>
                      <Badge variant="outline">{agent.version}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {agent.library_description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{agent.node_count || 0} 노드</span>
                      <span>{agent.edge_count || 0} 연결</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {agents.length === 0 && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                검색 결과가 없습니다.
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button
            onClick={handleImportAsNode}
            disabled={!selectedAgent || isLoading}
          >
            {isLoading ? "추가 중..." : "노드로 가져오기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
