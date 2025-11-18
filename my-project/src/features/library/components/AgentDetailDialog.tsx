import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/dialog';
import { Badge } from '@/shared/components/badge';
import { Loader2 } from 'lucide-react';
import { useLibraryStore } from '../stores/libraryStore';
import type { LibraryAgentDetail } from '@/features/workflow/types/workflow.types';

interface AgentDetailDialogProps {
  open: boolean;
  onClose: () => void;
  versionId: string;
}

export function AgentDetailDialog({ open, onClose, versionId }: AgentDetailDialogProps) {
  const { fetchAgentDetail, isLoading } = useLibraryStore();
  const [agent, setAgent] = useState<LibraryAgentDetail | null>(null);

  useEffect(() => {
    if (open && versionId) {
      fetchAgentDetail(versionId).then(() => {
        const selectedAgent = useLibraryStore.getState().selectedAgent;
        setAgent(selectedAgent);
      });
    }
  }, [open, versionId, fetchAgentDetail]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{agent?.library_name || '에이전트 상세'}</DialogTitle>
          <DialogDescription>
            {agent?.version} • {agent && formatDate(agent.library_published_at)}
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">로딩 중...</span>
          </div>
        )}

        {!isLoading && agent && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="font-semibold mb-2">기본 정보</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">설명: </span>
                  <span className="text-sm">{agent.library_description || '설명 없음'}</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">카테고리: </span>
                  {agent.library_category && (
                    <Badge variant="secondary">{agent.library_category}</Badge>
                  )}
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">공개 범위: </span>
                  <Badge variant="outline">
                    {agent.library_visibility === 'private' ? '비공개' :
                     agent.library_visibility === 'team' ? '팀' : '공개'}
                  </Badge>
                </div>
                {agent.library_tags && agent.library_tags.length > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground">태그: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {agent.library_tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Statistics */}
            <div>
              <h3 className="font-semibold mb-2">통계</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground">노드 개수</div>
                  <div className="text-2xl font-bold">{agent.node_count || 0}</div>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground">엣지 개수</div>
                  <div className="text-2xl font-bold">{agent.edge_count || 0}</div>
                </div>
              </div>
            </div>

            {/* Graph Preview */}
            {agent.graph && (
              <div>
                <h3 className="font-semibold mb-2">워크플로우 구조</h3>
                <div className="bg-muted p-3 rounded-lg text-sm">
                  <div className="text-muted-foreground mb-1">노드 타입:</div>
                  <div className="flex flex-wrap gap-1">
                    {agent.graph.nodes?.map((node: any) => (
                      <Badge key={node.id} variant="secondary" className="text-xs">
                        {node.type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div>
              <h3 className="font-semibold mb-2">메타데이터</h3>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-muted-foreground">Bot ID: </span>
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">{agent.bot_id}</code>
                </div>
                <div>
                  <span className="text-muted-foreground">Version ID: </span>
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">{agent.id}</code>
                </div>
                <div>
                  <span className="text-muted-foreground">생성일: </span>
                  <span>{formatDate(agent.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
