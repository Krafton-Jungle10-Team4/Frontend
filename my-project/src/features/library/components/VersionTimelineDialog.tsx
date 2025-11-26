import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/dialog';
import { Badge } from '@/shared/components/badge';
import { Button } from '@/shared/components/button';
import { Loader2 } from 'lucide-react';
import type { LibraryAgentVersion } from '@/features/workflow/types/workflow.types';
import { apiClient } from '@/shared/api/client';

interface VersionTimelineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: LibraryAgentVersion;
  onSelectVersion?: (version: LibraryAgentVersion) => void;
}

export function VersionTimelineDialog({
  open,
  onOpenChange,
  agent,
  onSelectVersion,
}: VersionTimelineDialogProps) {
  const [versions, setVersions] = useState<LibraryAgentVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        setIsLoading(true);

        // 봇의 모든 워크플로우 버전 조회
        const { data } = await apiClient.get<LibraryAgentVersion[]>(
          `/bots/${agent.bot_id}/workflows/versions`,
          {
            params: {
              status: 'published', // 발행된 버전만 조회
            },
          }
        );

        setVersions(data);
      } catch (error) {
        console.error('Failed to fetch versions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchVersions();
    }
  }, [open, agent]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>버전 타임라인: {agent.library_name}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">로딩 중...</span>
          </div>
        ) : (
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            {versions.map((version) => (
              <div
                key={version.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{version.version}</h3>
                      {version.status === 'published' && (
                        <Badge className="bg-green-500 text-white">발행됨</Badge>
                      )}
                      {version.status === 'draft' && (
                        <Badge variant="outline">초안</Badge>
                      )}
                      {version.id === agent.id && (
                        <Badge variant="outline">현재</Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mt-1">
                      {version.library_description || version.library_name || '설명 없음'}
                    </p>

                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {version.node_count && <span>{version.node_count} 노드</span>}
                      {version.edge_count && <span>{version.edge_count} 엣지</span>}
                      <span>
                        {version.library_published_at
                          ? new Date(version.library_published_at).toLocaleDateString('ko-KR')
                          : new Date(version.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        onSelectVersion?.(version);
                        onOpenChange(false);
                      }}
                    >
                      선택
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {versions.length === 0 && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                버전 정보가 없습니다.
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
