import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/shared/components/card';
import { Button } from '@/shared/components/button';
import { Badge } from '@/shared/components/badge';
import { Download, Rocket, Eye } from 'lucide-react';
import type { LibraryAgentVersion } from '@/features/workflow/types/workflow.types';
import { AgentDetailDialog } from './AgentDetailDialog';
import { AgentImportDialog } from './AgentImportDialog';
import { DeploymentDialog } from './DeploymentDialog';

interface AgentCardProps {
  agent: LibraryAgentVersion;
}

export function AgentCard({ agent }: AgentCardProps) {
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showDeployDialog, setShowDeployDialog] = useState(false);

  const visibilityLabel = {
    private: '비공개',
    team: '팀',
    public: '공개',
  }[agent.library_visibility];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{agent.library_name}</CardTitle>
              <CardDescription className="text-xs mt-1">
                {agent.version} • {formatDate(agent.library_published_at)}
              </CardDescription>
            </div>
            <Badge variant="outline">{visibilityLabel}</Badge>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {agent.library_description || '설명이 없습니다.'}
          </p>

          {/* Category & Tags */}
          <div className="space-y-2">
            {agent.library_category && (
              <Badge variant="secondary">{agent.library_category}</Badge>
            )}
            {agent.library_tags && agent.library_tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {agent.library_tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
            {agent.node_count !== undefined && (
              <span>노드: {agent.node_count}</span>
            )}
            {agent.edge_count !== undefined && (
              <span>엣지: {agent.edge_count}</span>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setShowDetailDialog(true)}
          >
            <Eye className="w-4 h-4 mr-1" />
            상세보기
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setShowImportDialog(true)}
          >
            <Download className="w-4 h-4 mr-1" />
            가져오기
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeployDialog(true)}
          >
            <Rocket className="w-4 h-4" />
          </Button>
        </CardFooter>
      </Card>

      {/* Dialogs */}
      <AgentDetailDialog
        open={showDetailDialog}
        onClose={() => setShowDetailDialog(false)}
        versionId={agent.id}
      />
      <AgentImportDialog
        open={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        agent={agent}
      />
      <DeploymentDialog
        open={showDeployDialog}
        onClose={() => setShowDeployDialog(false)}
        versionId={agent.id}
        agentName={agent.library_name}
      />
    </>
  );
}
